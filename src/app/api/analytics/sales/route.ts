import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request, ["ADMIN", "SALES_MANAGER", "FINANCE_MANAGER"]);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get months from query parameter
    const searchParams = new URL(request.url).searchParams;
    const months = parseInt(searchParams.get("months") || "6");
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Fetch actual sales data from database
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        saleDate: "asc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}

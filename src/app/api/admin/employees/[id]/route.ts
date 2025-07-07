import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// GET /api/admin/employees/[id]
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const authResult = await verifyAuth(request, ['ADMIN', 'SALES_MANAGER']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Employee ID is cognitoId (string)
    if (!id) {
      return NextResponse.json({ message: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { cognitoId: id },
    });

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Fetch cars managed by this employee
    const managedCars = await prisma.car.findMany({
      where: { employeeId: id },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        sales: {
          select: {
            id: true,
            customer: {
              select: {
                cognitoId: true,
                name: true,
                email: true,
              },
            },
            salePrice: true,
          },
        },
      },
    });

    // Transform cars to include customer count and total sales value
    interface Customer {
      cognitoId: string;
      name: string;
      email: string;
    }

    interface Sale {
      id: number;
      customer: Customer | null;
      salePrice: number;
    }

    interface ManagedCar {
      id: number;
      make: string;
      model: string;
      year: number;
      sales: Sale[];
    }

    interface TransformedCar {
      id: number;
      make: string;
      model: string;
      year: number;
      customerCount: number;
      totalSalesValue: number;
    }

    const transformedCars: TransformedCar[] = managedCars.map((car: ManagedCar) => {
      const customerSet = new Set<string>();
      let totalSalesValue = 0;
      car.sales.forEach((sale: Sale) => {
        if (sale.customer) {
          customerSet.add(sale.customer.cognitoId);
          totalSalesValue += sale.salePrice;
        }
      });

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        customerCount: customerSet.size,
        totalSalesValue: totalSalesValue,
      };
    });

    // Get all customers associated with this employee's sales
    const customers: Customer[] = managedCars.flatMap((car: ManagedCar) => 
      car.sales.map((sale: Sale) => sale.customer)
    ).filter(Boolean) as Customer[];

    // Remove duplicates
    const uniqueCustomers = Array.from(
      new Map(customers.map(customer => [customer.cognitoId, customer])).values()
    );

    // Map customers to include car information
    const customersWithCars = [];
    for (const customer of uniqueCustomers) {
      for (const car of managedCars) {
        const hasCustomer: boolean = car.sales.some(
          (sale: Sale): boolean => sale.customer !== null && sale.customer.cognitoId === customer.cognitoId
        );
        
        if (hasCustomer) {
          customersWithCars.push({
            cognitoId: customer.cognitoId,
            name: customer.name,
            email: customer.email,
            car: `${car.year} ${car.make} ${car.model}`,
          });
        }
      }
    }

    // Calculate statistics
    const totalCarsManaged = transformedCars.length;
    const totalCustomersServed = uniqueCustomers.length;
    const totalSales: number = managedCars.reduce((acc: number, car: ManagedCar) => acc + car.sales.length, 0);
    const totalRevenue: number = managedCars.reduce((acc: number, car: ManagedCar) => 
      acc + transformedCars.find((tc: TransformedCar) => tc.id === car.id)!.totalSalesValue, 0
    );

    const employeeDetails = {
      cognitoId: employee.cognitoId,
      name: employee.name,
      email: employee.email,
      phoneNumber: employee.phoneNumber || "",
      role: employee.role,
      status: employee.status,
      dealershipId: employee.dealershipId,
      managedCars: transformedCars,
      customers: customersWithCars,
      stats: {
        carsManaged: totalCarsManaged,
        customersServed: totalCustomersServed,
        totalSales: totalSales,
        totalRevenue: totalRevenue,
      }
    };

    return NextResponse.json(employeeDetails);

  } catch (error) {
    console.error("Error fetching employee details:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch employee details" }),
      { status: 500 }
    );
  }
}

// DELETE /api/admin/employees/[id]
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const authResult = await verifyAuth(request, ["ADMIN"]);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ message: "Invalid employee ID" }, { status: 400 });
    }

    // Delete the employee
    await prisma.employee.delete({
      where: { cognitoId: id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ success: false, message: "Failed to delete employee" }, { status: 500 });
  }
}

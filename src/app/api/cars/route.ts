import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

// Add a GET handler to retrieve all cars
export async function GET(req: NextRequest) {
  try {
    // Get query parameters if needed
    const { searchParams } = new URL(req.url);

    // Build a query object for filtering (optional)
    const query: any = {};

    // Example: Add filters if they exist
    // if (searchParams.has('status')) {
    //   query.status = searchParams.get('status');
    // }

    // Fetch all cars from the database with optional filters
    const cars = await prisma.car.findMany({
      where: query,
      include: {
        dealership: true, // Include related dealership data
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { message: "Failed to fetch cars." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const carData: any = {};

    for (const [key, value] of formData.entries()) {
      if (key === "photos") continue;
      if (key === "features") {
        carData[key] = (value as string).split(",").map((s) => s.trim());
      } else if (
        key === "price" ||
        key === "mileage" ||
        key === "year" ||
        key === "dealershipId"
      ) {
        carData[key] = Number(value);
      } else {
        carData[key] = value as any;
      }
    }

    const photos = formData.getAll("photos") as File[];
    const photoUrls: string[] = [];

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), "public", photo.name);
      await writeFile(path, buffer);
      photoUrls.push(`/${photo.name}`);
    }

    carData.photoUrls = photoUrls;

    const newCar = await prisma.car.create({
      data: carData as any,
    });

    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create car." },
      { status: 500 }
    );
  }
}

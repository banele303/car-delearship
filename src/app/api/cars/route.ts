import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

// Add a GET handler to retrieve all cars
export async function GET(req: NextRequest) {
  const started = Date.now();
  const { searchParams } = new URL(req.url);
  const query: any = {};
  const takeParam = searchParams.get('limit');
  const featuredParam = searchParams.get('featured');
  const orderParam = searchParams.get('order');
  const orderDir = orderParam === 'asc' ? 'asc' : 'desc';
  const take = takeParam ? Number(takeParam) : undefined;
  if (take !== undefined && (isNaN(take) || take <= 0)) {
    return NextResponse.json({ message: 'Invalid limit parameter' }, { status: 400 });
  }
  if (featuredParam === 'true') query.featured = true;

  try {
    const cars = await prisma.car.findMany({
      where: query,
      include: { dealership: true },
      take,
      orderBy: { updatedAt: orderDir },
    });
    return NextResponse.json(cars, { headers: { 'x-query-time': String(Date.now() - started) } });
  } catch (error: any) {
    // Attempt a fallback if failure might be due to schema drift (e.g. missing featured column)
    const msg = error?.message || String(error);
    let fallbackData = null;
    let fallbackTried = false;
    if (query.featured) {
      try {
        fallbackTried = true;
        const { featured, ...rest } = query;
        fallbackData = await prisma.car.findMany({
          where: rest,
          include: { dealership: true },
          take,
          orderBy: { updatedAt: orderDir },
        });
      } catch {}
    }
    const code = error?.code;
    console.error('Error fetching cars', { message: msg, code, stack: error?.stack, query, fallbackTried });
    if (fallbackData) {
      return NextResponse.json(fallbackData, { headers: { 'x-fallback': 'true' } });
    }
    if (code === 'P1001') {
      return NextResponse.json({ message: 'Database unreachable (P1001). Check DATABASE_URL / network.' }, { status: 500 });
    }
    if (code === 'P2021') {
      return NextResponse.json({ message: 'Table not found (P2021). Run migrations.' }, { status: 500 });
    }
    if (code === 'P2022') {
      return NextResponse.json({ message: 'Column not found (P2022). Migrate & regenerate Prisma client.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Failed to fetch cars', error: msg, code }, { status: 500 });
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
  // Upload limits (can be overridden via env). Keep reasonable to avoid platform hard limits.
  const MAX_FILES = Number(process.env.CAR_UPLOAD_MAX_FILES || 25);
  const MAX_SINGLE_MB = Number(process.env.CAR_UPLOAD_SINGLE_MAX_MB || 10); // was 5
  const MAX_TOTAL_MB = Number(process.env.CAR_UPLOAD_TOTAL_MAX_MB || 80); // was 40
    if (photos.length > MAX_FILES) {
      return NextResponse.json({ message: `Too many photos: ${photos.length} > ${MAX_FILES}` }, { status: 400 });
    }
    let totalBytes = 0;
    for (const p of photos) {
      totalBytes += p.size;
      const mb = p.size / (1024*1024);
      if (mb > MAX_SINGLE_MB) {
        return NextResponse.json({ message: `File ${p.name} is ${mb.toFixed(1)}MB > ${MAX_SINGLE_MB}MB limit` }, { status: 400 });
      }
    }
    const totalMb = totalBytes / (1024*1024);
    if (totalMb > MAX_TOTAL_MB) {
      return NextResponse.json({ message: `Total upload ${totalMb.toFixed(1)}MB exceeds ${MAX_TOTAL_MB}MB limit` }, { status: 413 });
    }
    const photoUrls: string[] = [];
    for (const photo of photos) {
      try {
        const url = await uploadToS3(photo, "cars");
        photoUrls.push(url);
      } catch (err) {
        console.error("S3 upload error:", err);
      }
    }
    carData.photoUrls = photoUrls;
    if (typeof carData.featured === 'string') {
      carData.featured = carData.featured === 'true';
    }

    // Validate dealership exists early to avoid FK P2003
    // dealershipId optional: validate only if passed
    if (carData.dealershipId) {
      if (isNaN(carData.dealershipId)) {
        return NextResponse.json({ message: 'Invalid dealershipId supplied.' }, { status: 400 });
      }
      const dealershipExists = await prisma.dealership.findUnique({ where: { id: carData.dealershipId } });
      if (!dealershipExists) {
        return NextResponse.json({ message: `Dealership ${carData.dealershipId} not found.` }, { status: 404 });
      }
    } else {
      delete carData.dealershipId; // omit so Prisma uses default or allows null depending on schema (currently required)
    }

    try {
      const newCar = await prisma.car.create({
        data: carData as any,
      });
      return NextResponse.json(newCar, { status: 201 });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('vin')) {
        return NextResponse.json(
          { message: "A car with this VIN already exists. Please use a unique VIN." },
          { status: 409 }
        );
      }
      console.error(prismaError);
      return NextResponse.json(
        { message: "Failed to create car.", error: prismaError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create car." },
      { status: 500 }
    );
  }
}

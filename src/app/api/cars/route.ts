import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import { CAR_UPLOAD_MAX_FILES, CAR_UPLOAD_SINGLE_MAX_MB, CAR_UPLOAD_TOTAL_MAX_MB, describeCarUploadLimits } from "@/config/uploadLimits";

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
    // Normalize legacy enum values (GASOLINE -> PETROL for display) without mutating DB
  const normalized = cars.map(c => (String(c.fuelType) === 'GASOLINE' ? { ...c, fuelType: 'PETROL' } : c));
    return NextResponse.json(normalized, { headers: { 'x-query-time': String(Date.now() - started), 'x-fueltype-normalized': 'true' } });
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
    const featureBuffer: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'photos') continue;
      if (key === 'vin') continue; // ignore client-sent vin (we will generate)
      if (key === 'interiorColor') continue; // interiorColor no longer collected
      if (key === 'features') {
        const raw = String(value).trim();
        if (!raw) continue;
        if (raw.startsWith('[')) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.forEach(v => {
                const s = String(v).trim();
                if (s) featureBuffer.push(s);
              });
            }
            continue; // handled
          } catch {
            // fall through to simple splitting
          }
        }
        raw.split(',').forEach(tok => {
          const s = tok.replace(/[\[\]"]+/g,'').trim();
          if (s) featureBuffer.push(s);
        });
      } else if (['price','mileage','year','dealershipId'].includes(key)) {
        carData[key] = Number(value);
      } else {
        carData[key] = value as any;
      }
    }
    if (featureBuffer.length) {
      // de-dupe preserving first selection order
      const seen = new Set<string>();
      carData.features = featureBuffer.filter(f => {
        const k = f.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
    }
    // Enum migration: accept legacy GASOLINE or interim FUEL and map to GASOLINE (temporarily, until PETROL migration is applied)
    if (carData.fuelType === 'PETROL' || carData.fuelType === 'FUEL') {
      carData.fuelType = 'GASOLINE'; // Use GASOLINE until migration adds PETROL to database enum
    }
    
    // Ensure fuel type is valid for database enum
    const validFuelTypes = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PLUG_IN_HYBRID', 'HYDROGEN'];
    if (!validFuelTypes.includes(carData.fuelType)) {
      console.warn('[CAR_CREATE_DEBUG] Invalid fuelType:', carData.fuelType, 'defaulting to GASOLINE');
      carData.fuelType = 'GASOLINE';
    }
  const photos = formData.getAll('photos') as File[];
  const MAX_FILES = CAR_UPLOAD_MAX_FILES;
  const MAX_SINGLE_MB = CAR_UPLOAD_SINGLE_MAX_MB;
  const MAX_TOTAL_MB = CAR_UPLOAD_TOTAL_MAX_MB;
  console.log('[CAR_UPLOAD_DEBUG][CREATE] photos:', photos.length, describeCarUploadLimits());
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
    if (MAX_TOTAL_MB > 0 && totalMb > MAX_TOTAL_MB) {
      return NextResponse.json({ message: `Total upload ${totalMb.toFixed(1)}MB exceeds ${MAX_TOTAL_MB}MB limit`, totalMb, MAX_TOTAL_MB }, { status: 413, headers: { 'x-car-upload-total-mb': totalMb.toFixed(2), 'x-car-upload-max-total-mb': String(MAX_TOTAL_MB), 'x-car-upload-max-single-mb': String(MAX_SINGLE_MB) } });
    }
    const photoUrls: string[] = [];
    for (const photo of photos) {
      try {
        const url = await uploadToS3(photo, 'cars');
        photoUrls.push(url);
      } catch (err) {
        console.error('S3 upload error:', err);
      }
    }
    carData.photoUrls = photoUrls;
    if (typeof carData.featured === 'string') {
      carData.featured = carData.featured === 'true';
    }
    if (carData.dealershipId) {
      if (isNaN(carData.dealershipId)) {
        return NextResponse.json({ message: 'Invalid dealershipId supplied.' }, { status: 400 });
      }
      const dealershipExists = await prisma.dealership.findUnique({ where: { id: carData.dealershipId } });
      if (!dealershipExists) {
        return NextResponse.json({ message: `Dealership ${carData.dealershipId} not found.` }, { status: 404 });
      }
    } else {
      delete carData.dealershipId;
    }
    // Handle employeeId optionally: attempt to resolve; if not found just omit instead of error.
    if (carData.employeeId) {
      const suppliedEmp = String(carData.employeeId).trim();
      let employee = await prisma.employee.findUnique({ where: { cognitoId: suppliedEmp } });
      if (!employee && /^\d+$/.test(suppliedEmp)) {
        // If numeric, try matching by internal numeric id then map to cognitoId
        const idNum = parseInt(suppliedEmp, 10);
        if (!isNaN(idNum)) {
          const byId = await prisma.employee.findUnique({ where: { id: idNum } });
          if (byId) employee = byId;
        }
      }
      if (employee) {
        carData.employeeId = employee.cognitoId; // ensure referencing cognitoId FK
      } else {
        delete carData.employeeId; // make optional silently
      }
    } else if (carData.employeeId === '') {
      delete carData.employeeId;
    }
    // Auto-generate VIN if not provided (17-char alphanumeric excluding I,O,Q)
    if (!carData.vin) {
      const alphabet = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
      let gen = '';
      for (let i=0;i<17;i++) gen += alphabet[Math.floor(Math.random()*alphabet.length)];
      carData.vin = gen;
    }
    
    // Provide default for interiorColor if not specified (since it was removed from form but still required in schema)
    if (!carData.interiorColor) {
      carData.interiorColor = 'Not specified';
    }
    try {
      const newCar = await prisma.car.create({ data: carData as any });
      return NextResponse.json(newCar, { status: 201, headers: {
        'x-car-upload-files': String(photos.length),
        'x-car-upload-total-mb': totalMb.toFixed(2),
        'x-car-upload-max-single-mb': String(MAX_SINGLE_MB),
        'x-car-upload-max-total-mb': String(MAX_TOTAL_MB)
      }});
    } catch (prismaError: any) {
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('vin')) {
        return NextResponse.json({ message: 'A car with this VIN already exists. Please use a unique VIN.' }, { status: 409 });
      }
      console.error(prismaError);
      return NextResponse.json({ message: 'Failed to create car.', error: prismaError.message }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create car.' }, { status: 500 });
  }
}

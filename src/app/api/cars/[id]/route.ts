import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, DeleteObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { verifyAuth } from '@/lib/auth';
import { CAR_UPLOAD_SINGLE_MAX_MB, CAR_UPLOAD_TOTAL_MAX_MB, describeCarUploadLimits } from '@/config/uploadLimits';
import { Prisma } from '@prisma/client';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Helper to upload a file to S3
async function uploadFileToS3(file: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
    throw new Error("S3 bucket name or region is not configured.");
  }
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const safeFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
  const key = `cars/${uniquePrefix}-${safeFileName}`;
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    ACL: ObjectCannedACL.public_read,
  };

  try {
    const upload = new Upload({ client: s3Client, params });
    await upload.done();
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper to delete a file from S3
async function deleteFileFromS3(fileUrl: string): Promise<void> {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("S3 bucket name is not configured.");
  }
  
  try {
    let key: string;
    
    // Check if the URL is a full URL or just a path
    if (fileUrl.startsWith('http')) {
      // For full URLs, extract the key from the path
      const url = new URL(fileUrl);
      key = url.pathname.substring(1); // Remove leading slash
    } else {
      // For relative paths, remove any leading slash and use as-is
      key = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    }
    
    // Skip empty keys
    if (!key) {
      console.warn('Skipping empty file URL');
      return;
    }
    
    console.log(`Deleting S3 object with key: ${key}`);
    await s3Client.send(new DeleteObjectCommand({ 
      Bucket: process.env.AWS_BUCKET_NAME, 
      Key: key 
    }));
  } catch (error) {
    // Log the error but don't fail the entire operation
    console.error('S3 Deletion Error for URL:', fileUrl, error);
    // Continue with the operation even if one file fails to delete
  }
}

// GET a specific car by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 });
    }
    
  const car = await prisma.car.findUnique({
      where: { id },
      include: { dealership: true, employee: true, reviews: true },
    });

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }
    
  // Normalize legacy fuel type before returning
  const normalized = String(car.fuelType) === 'GASOLINE' ? { ...car, fuelType: 'PETROL' } : car;
  return NextResponse.json(normalized, { headers: { 'x-fueltype-normalized': String(car.fuelType) === 'GASOLINE' ? 'true' : 'false' } });
  } catch (err: any) {
    console.error("Error retrieving car:", err);
    return NextResponse.json({ message: `Error retrieving car: ${err.message}` }, { status: 500 });
  }
}

// PUT to update a car
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(request, ['SALES_MANAGER', 'ADMIN']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 });
    }

    const existingCar = await prisma.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    const formData = await request.formData();
    // Collect raw (excluding files) and accumulate multi features entries
    const raw: Record<string, any> = {};
    const featureBuffer: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'photos') continue;
      if (key === 'features') {
        const rawVal = String(value).trim();
        if (!rawVal) continue;
        if (rawVal.startsWith('[')) {
          try {
            const parsed = JSON.parse(rawVal);
            if (Array.isArray(parsed)) parsed.forEach(v=>{ const s=String(v).trim(); if(s) featureBuffer.push(s); });
            continue;
          } catch {}
        }
        rawVal.split(',').forEach(tok => { const s = tok.replace(/[\[\]"]+/g,'').trim(); if (s) featureBuffer.push(s); });
      } else {
        raw[key] = value;
      }
    }
    if (featureBuffer.length) {
      const seen = new Set<string>();
      raw.features = featureBuffer.filter(f=>{ const k=f.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; });
    }
    const photoUrlsRaw = typeof raw.photoUrls === 'string' ? raw.photoUrls : undefined;
    const photoOrderRaw = typeof raw.photoOrder === 'string' ? raw.photoOrder : undefined;
    delete raw.photoUrls; delete raw.photoOrder;
    if (typeof raw.featured === 'string') raw.featured = raw.featured === 'true';
    // Whitelist fields
  const allowed = ['make','model','vin','carType','fuelType','condition','transmission','engine','exteriorColor','interiorColor','description','status','featured','dealershipId','employeeId','mileage','price','year','features'];
    const data: any = {};
    allowed.forEach(k=>{ if (raw[k] !== undefined && raw[k] !== null && raw[k] !== '') data[k]=raw[k]; });
    if (data.year) data.year = parseInt(data.year);
    if (data.price) data.price = parseFloat(data.price);
    if (data.mileage) data.mileage = parseInt(data.mileage);
    if (data.dealershipId) data.dealershipId = parseInt(data.dealershipId);
    if (data.employeeId === '' || data.employeeId === undefined) data.employeeId = null;
    // Optional employeeId handling: resolve to cognitoId or drop silently
    if (data.employeeId) {
      const suppliedEmp = String(data.employeeId).trim();
      let employee = await prisma.employee.findUnique({ where: { cognitoId: suppliedEmp } });
      if (!employee && /^\d+$/.test(suppliedEmp)) {
        const idNum = parseInt(suppliedEmp, 10);
        if (!isNaN(idNum)) {
          const byId = await prisma.employee.findUnique({ where: { id: idNum } });
          if (byId) employee = byId;
        }
      }
      if (employee) data.employeeId = employee.cognitoId; else data.employeeId = null;
    }

    // Existing photos kept
    let keptExisting = existingCar.photoUrls || [];
    if (photoUrlsRaw) {
      try {
        const parsed = JSON.parse(photoUrlsRaw);
        if (Array.isArray(parsed)) {
          const toDelete = keptExisting.filter(u=>!parsed.includes(u));
            if (toDelete.length) await Promise.all(toDelete.map(deleteFileFromS3));
          keptExisting = parsed;
        }
      } catch {}
    }
  const newFiles: File[] = formData.getAll('photos') as File[];
  const MAX_SINGLE_MB = CAR_UPLOAD_SINGLE_MAX_MB;
  const MAX_TOTAL_MB = CAR_UPLOAD_TOTAL_MAX_MB;
  console.log('[CAR_UPLOAD_DEBUG][UPDATE]', { newCount: newFiles.length, ...describeCarUploadLimits() });
    let totalBytes = 0;
    for (const nf of newFiles) {
      totalBytes += nf.size;
      const mb = nf.size / (1024*1024);
      if (mb > MAX_SINGLE_MB) {
        return NextResponse.json({ message: `File ${nf.name} is ${mb.toFixed(1)}MB > ${MAX_SINGLE_MB}MB limit` }, { status: 400 });
      }
    }
    if (MAX_TOTAL_MB > 0) {
      const totalMb = totalBytes / (1024*1024);
      if (totalMb > MAX_TOTAL_MB) {
        return NextResponse.json({ message: `Total new upload ${totalMb.toFixed(1)}MB exceeds ${MAX_TOTAL_MB}MB limit. Upload fewer or smaller images.` }, { status: 413 });
      }
    }
    let uploadedNew: string[] = [];
    if (newFiles.length) {
      uploadedNew = await Promise.all(newFiles.map(async f => {
        const buf = await f.arrayBuffer();
        return uploadFileToS3(Buffer.from(buf), f.name, f.type);
      }));
    }
    let finalPhotos: string[] = [];
    if (photoOrderRaw) {
      try {
        const order: string[] = JSON.parse(photoOrderRaw);
        if (Array.isArray(order) && order.length) {
          order.forEach(tok => {
            if (keptExisting.includes(tok)) finalPhotos.push(tok);
            else if (/^__new_\d+__$/.test(tok)) {
              const idx = parseInt(tok.replace(/__new_|__/g,''));
              if (!isNaN(idx) && uploadedNew[idx]) finalPhotos.push(uploadedNew[idx]);
            }
          });
          uploadedNew.forEach(u=>{ if (!finalPhotos.includes(u)) finalPhotos.push(u); });
          keptExisting.forEach(u=>{ if (!finalPhotos.includes(u)) finalPhotos.push(u); });
        } else finalPhotos = [...keptExisting, ...uploadedNew];
      } catch { finalPhotos = [...keptExisting, ...uploadedNew]; }
    } else {
      finalPhotos = [...keptExisting, ...uploadedNew];
    }
    data.photoUrls = finalPhotos;
    // ENUM COMPAT: Database enum currently does NOT include PETROL yet (only legacy GASOLINE).
    // UI uses PETROL. Convert outbound (write) PETROL -> GASOLINE so Postgres accepts it.
    // When migration adding PETROL is applied, remove this block (and inverse mapping in create route) and keep value as-is.
    if (data.fuelType === 'PETROL') {
      data.fuelType = 'GASOLINE';
    } else if (data.fuelType === 'FUEL') { // very old interim token
      data.fuelType = 'GASOLINE';
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data,
      include: { dealership: true, employee: true },
    });
    return NextResponse.json(updatedCar, { headers: {
      'x-car-upload-new-files': String(newFiles.length),
      'x-car-upload-max-single-mb': String(MAX_SINGLE_MB),
      'x-car-upload-max-total-mb': String(MAX_TOTAL_MB)
    }});
  } catch (err: any) {
    console.error("Error updating car:", err);
    return NextResponse.json({ message: `Error updating car: ${err.message}` }, { status: 500 });
  }
}

// DELETE a car
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(request, ['SALES_MANAGER', 'ADMIN']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 });
    }

    const existingCar = await prisma.car.findUnique({
      where: { id },
      include: { sales: true },
    });
    if (!existingCar) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    // Block deletion if the car has a sale record — use "Mark as Sold" instead
    if (existingCar.sales) {
      return NextResponse.json(
        { message: 'This car has a sale record and cannot be deleted. Use "Mark as Sold" or "Deactivate" instead.' },
        { status: 409 }
      );
    }

    // Delete S3 photos
    if (existingCar.photoUrls && existingCar.photoUrls.length > 0) {
      await Promise.all(existingCar.photoUrls.map(deleteFileFromS3));
    }

    // Use a transaction to delete all related records, then the car
    await prisma.$transaction([
      // Remove from customer favorites (many-to-many)
      prisma.$executeRawUnsafe(
        `DELETE FROM "_CustomerFavorites" WHERE "A" = $1`,
        id
      ),
      // Delete inquiries
      prisma.inquiry.deleteMany({ where: { carId: id } }),
      // Delete test drives
      prisma.testDrive.deleteMany({ where: { carId: id } }),
      // Delete reviews
      prisma.review.deleteMany({ where: { carId: id } }),
      // Finally delete the car
      prisma.car.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Car deleted successfully", id });
  } catch (err: any) {
    console.error("Error deleting car:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return NextResponse.json(
          { message: 'Cannot delete car: it still has related records. Try deactivating it instead.' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ message: `Error deleting car: ${err.message}` }, { status: 500 });
  }
}

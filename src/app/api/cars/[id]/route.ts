import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, DeleteObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { verifyAuth } from '@/lib/auth';
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
    const key = new URL(fileUrl).pathname.substring(1);
    await s3Client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
  } catch (error) {
    console.error('S3 Deletion Error:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`);
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
    
    return NextResponse.json(car);
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
    const carData: any = {};
    for (const [key, value] of formData.entries()) {
        if (key !== 'photos') {
            carData[key] = value;
        }
    }

    let photoUrls = existingCar.photoUrls || [];
    const photoUrlsFromForm = formData.get('photoUrls');
    if (photoUrlsFromForm && typeof photoUrlsFromForm === 'string') {
        const keptPhotoUrls = JSON.parse(photoUrlsFromForm);
        const photosToDelete = photoUrls.filter((url: string) => !keptPhotoUrls.includes(url));
        if (photosToDelete.length > 0) {
            await Promise.all(photosToDelete.map(deleteFileFromS3));
        }
        photoUrls = keptPhotoUrls;
    }

    const files: File[] = formData.getAll('photos') as File[];
    if (files.length > 0) {
        const newPhotoUrls = await Promise.all(
            files.map(async file => {
                const buffer = await file.arrayBuffer();
                return uploadFileToS3(Buffer.from(buffer), file.name, file.type);
            })
        );
        photoUrls = [...photoUrls, ...newPhotoUrls];
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        ...carData,
        year: carData.year ? parseInt(carData.year) : undefined,
        price: carData.price ? parseFloat(carData.price) : undefined,
        mileage: carData.mileage ? parseInt(carData.mileage) : undefined,
        dealershipId: carData.dealershipId ? parseInt(carData.dealershipId) : undefined,
        employeeId: carData.employeeId && carData.employeeId !== "" ? carData.employeeId : null,
        features: carData.features ? (Array.isArray(carData.features) ? carData.features : carData.features.split(',')) : undefined,
        photoUrls,
      },
      include: { dealership: true, employee: true },
    });

    return NextResponse.json(updatedCar);
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

    const existingCar = await prisma.car.findUnique({ where: { id } });
    if (!existingCar) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    if (existingCar.photoUrls && existingCar.photoUrls.length > 0) {
      await Promise.all(existingCar.photoUrls.map(deleteFileFromS3));
    }

    await prisma.car.delete({ where: { id } });

    return NextResponse.json({ message: "Car deleted successfully", id });
  } catch (err: any) {
    console.error("Error deleting car:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2014') { // Related records exist
            return NextResponse.json({ message: `Cannot delete car: it is referenced by other records (e.g., sales, inquiries).` }, { status: 409 });
        }
    }
    return NextResponse.json({ message: `Error deleting car: ${err.message}` }, { status: 500 });
  }
}

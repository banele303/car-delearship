import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';
import { CAR_UPLOAD_SINGLE_MAX_MB, CAR_UPLOAD_TOTAL_MAX_MB } from '@/config/uploadLimits';

// POST /api/cars/:id/photos  (single photo per request)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  // Broaden allowed roles so standard employees can upload photos
  const authResult = await verifyAuth(req, ['SALES_MANAGER', 'ADMIN', 'EMPLOYEE', 'SALES_REP']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (isNaN(id)) return NextResponse.json({ message: 'Invalid car id' }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get('photo');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Missing photo file "photo"' }, { status: 400 });
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > CAR_UPLOAD_SINGLE_MAX_MB) {
      return NextResponse.json({ message: `File ${file.name} is ${sizeMb.toFixed(1)}MB > ${CAR_UPLOAD_SINGLE_MAX_MB}MB limit` }, { status: 400 });
    }

    // Fetch existing car
  let car = await prisma.car.findUnique({ where: { id } });
  if (!car) return NextResponse.json({ message: 'Car not found' }, { status: 404 });

    // (Optional) enforce cumulative limit against existing + new file
    if (CAR_UPLOAD_TOTAL_MAX_MB > 0) {
      // We can't know existing sizes (only URLs). Rely on per-file limit; skip cumulative here.
    }

    let url: string | null = null;
    try {
      url = await uploadToS3(file, 'cars');
    } catch (e: any) {
      return NextResponse.json({ message: 'Failed to upload to storage', error: e?.message }, { status: 500 });
    }

    // Optimistic concurrency retry loop to avoid lost updates when multiple uploads happen at once
    const MAX_RETRIES = 5;
    let finalPhotoUrls: string[] = [];
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const currentList = car.photoUrls || [];
      // Skip if already present (idempotence)
      if (currentList.includes(url)) {
        finalPhotoUrls = currentList;
        break;
      }
      const nextList = [...currentList, url];
      // Use updateMany with updatedAt match (optimistic lock)
      const updatedAt = car.updatedAt;
      const updateResult = await prisma.car.updateMany({
        where: { id, updatedAt },
        data: { photoUrls: nextList }
      });
      if (updateResult.count === 1) {
        // Success
        finalPhotoUrls = nextList;
        break;
      }
      // Another concurrent update occurred; refetch and retry
      car = await prisma.car.findUnique({ where: { id } }) as any;
      if (!car) return NextResponse.json({ message: 'Car disappeared during upload' }, { status: 404 });
      if (attempt === MAX_RETRIES - 1) {
        console.warn('[CAR PHOTO UPLOAD] Max retries reached; performing last-chance merge');
        const merged = new Set<string>([...car.photoUrls, url]);
        const forced = await prisma.car.update({ where: { id }, data: { photoUrls: Array.from(merged) }, select: { id: true, photoUrls: true } });
        finalPhotoUrls = forced.photoUrls;
        return NextResponse.json({ carId: forced.id, url, count: forced.photoUrls.length, retries: attempt + 1, forced: true });
      }
    }
    return NextResponse.json({ carId: car.id, url, count: finalPhotoUrls.length });
  } catch (err: any) {
    console.error('[CAR PHOTO UPLOAD ERROR]', err);
    return NextResponse.json({ message: 'Photo upload failed', error: err?.message }, { status: 500 });
  }
}

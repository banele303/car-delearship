import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET handler for sales with filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request, ['ADMIN', 'SALES_MANAGER', 'SALES_ASSOCIATE']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const employeeId = searchParams.get('employeeId');
    const carId = searchParams.get('carId');
    const dealershipId = searchParams.get('dealershipId');

    const query: any = {
      where: {},
      include: { car: true, customer: true, employee: true, dealership: true, financing: true },
      orderBy: { saleDate: 'desc' },
    };

    if (customerId) query.where.customerId = customerId;
    if (employeeId) query.where.employeeId = employeeId;
    if (carId) query.where.carId = parseInt(carId);
    if (dealershipId) query.where.dealershipId = parseInt(dealershipId);

    const sales = await prisma.sale.findMany(query);
    return NextResponse.json(sales);

  } catch (err: any) {
    console.error("Error retrieving sales:", err);
    return NextResponse.json({ message: `Error retrieving sales: ${err.message}` }, { status: 500 });
  }
}

// POST handler for creating a new sale
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request, ['SALES_MANAGER', 'SALES_ASSOCIATE']);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { carId, customerId, employeeId, dealershipId, salePrice, downPayment, tradeInValue, deliveryDate, financingId } = body;

    if (!carId || !customerId || !employeeId || !dealershipId || !salePrice) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if car exists and is available
    const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
    if (!car) return NextResponse.json({ message: 'Car not found' }, { status: 404 });
    if (car.status !== 'AVAILABLE') return NextResponse.json({ message: 'Car is not available for sale' }, { status: 409 });

    // 2. Create the sale and update car status in a transaction
    const [newSale, updatedCar] = await prisma.$transaction([
      prisma.sale.create({
        data: {
          carId: parseInt(carId),
          customerId,
          employeeId,
          dealershipId: parseInt(dealershipId),
          salePrice: parseFloat(salePrice),
          downPayment: downPayment ? parseFloat(downPayment) : 0,
          tradeInValue: tradeInValue ? parseFloat(tradeInValue) : 0,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          financingId: financingId ? parseInt(financingId) : null,
        },
        include: { car: true, customer: true, employee: true, dealership: true, financing: true },
      }),
      prisma.car.update({
        where: { id: parseInt(carId) },
        data: { status: 'SOLD' },
      })
    ]);

    return NextResponse.json(newSale, { status: 201 });

  } catch (err: any) {
    console.error("Error creating sale:", err);
    return NextResponse.json({ message: `Error creating sale: ${err.message}` }, { status: 500 });
  }
}

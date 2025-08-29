import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request, ['admin', 'manager']);
    
    // Check if user is authenticated and has required role
    if (!authResult.isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ error: authResult.message || 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    const { id } = params;
    const applicationId = Number(id);
    if (Number.isNaN(applicationId)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid application id' }),
        { status: 400 }
      );
    }
    
    // Get the financing application details with related data
    const application = await prisma.financingApplication.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        documents: true,
        details: true,
        sale: {
          include: { car: true }
        }
      }
    });
    
    if (!application) {
      return new NextResponse(
        JSON.stringify({ error: 'Financing application not found' }),
        { status: 404 }
      );
    }

    // Shape response for admin detail view
    if (!application) {
      return new NextResponse(
        JSON.stringify({ error: 'Financing application not found' }),
        { status: 404 }
      );
    }
  const shaped: any = {
      id: application.id,
      applicationDate: application.applicationDate?.toISOString?.() || new Date().toISOString(),
      status: application.status,
      creditScore: application.creditScore || 0,
      loanAmount: application.loanAmount,
      loanTermMonths: application.termMonths,
      interestRate: application.interestRate,
      monthlyPayment: application.monthlyPayment,
      isNSFASAccredited: false,
      customer: {
        id: application.customer?.cognitoId || application.customer?.id,
        firstName: application.details?.firstName || (application.customer?.name?.split(' ')[0] || ''),
        lastName: application.details?.lastName || (application.customer?.name?.split(' ').slice(1).join(' ') || ''),
        email: application.customer?.email || '',
        phone: application.customer?.phoneNumber || '',
        dateOfBirth: application.details?.dateOfBirth ? application.details.dateOfBirth.toISOString() : ''
      },
      car: application.sale?.car ? {
        id: application.sale.car.id,
        make: application.sale.car.make,
        model: application.sale.car.model,
        year: application.sale.car.year,
        price: application.sale.car.price,
    imageUrl: null
      } : { id: '', make: '', model: '', year: 0, price: 0, imageUrl: null },
      documents: (application.documents || []).map(d => ({
        id: d.id,
        docType: d.docType,
        originalName: d.originalName,
        url: d.url || `/api/uploads/financing/file/${encodeURIComponent(d.storedName || d.originalName)}`,
        mime: d.mime,
        size: d.size,
        uploadedAt: d.uploadedAt?.toISOString?.() || ''
      }))
    };
    return NextResponse.json(shaped);
    
  } catch (error) {
    console.error('Error fetching financing application:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

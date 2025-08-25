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
        // Fetch all customer fields (avoids selecting non-existent fields like firstName/lastName)
        customer: true
        // To include related vehicle data, add the correct relation field defined in your Prisma schema here.
      }
    });
    
    if (!application) {
      return new NextResponse(
        JSON.stringify({ error: 'Financing application not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(application);
    
  } catch (error) {
    console.error('Error fetching financing application:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

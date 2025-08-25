import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const publicFinancingSchema = z.object({
  loanAmount: z.number().min(1000),
  termMonths: z.number().min(12),
  interestRate: z.number().min(0).max(40).optional().nullable(),
  monthlyPayment: z.number().min(0).optional().nullable(),
  // Applicant
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  dateOfBirth: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  housingStatus: z.string().optional().nullable(),
  monthlyHousingPayment: z.number().optional().nullable(),
  employmentStatus: z.string().optional().nullable(),
  employerName: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  employmentYears: z.number().optional().nullable(),
  monthlyIncomeGross: z.number().optional().nullable(),
  otherIncome: z.number().optional().nullable(),
  otherIncomeSource: z.string().optional().nullable(),
  annualIncome: z.number().optional().nullable(),
  creditScore: z.number().int().optional().nullable(),
  creditScoreRange: z.string().optional().nullable(),
  downPaymentAmount: z.number().optional().nullable(),
  preferredContactMethod: z.string().optional().nullable(),
  hasTradeIn: z.boolean().optional().nullable(),
  tradeInDetails: z.string().optional().nullable(),
  coApplicantName: z.string().optional().nullable(),
  coApplicantIncome: z.number().optional().nullable(),
  coApplicantRelationship: z.string().optional().nullable(),
  consentCreditCheck: z.boolean().refine(v => v === true, 'Consent required'),
  agreeTerms: z.boolean().refine(v => v === true, 'Terms acceptance required'),
});

// Simple GET to avoid confusing 404 when hitting the endpoint directly in a browser
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'POST financing application details to this endpoint.' });
}

export async function POST(req: NextRequest) {
  try {
    // Early environment / client sanity checks
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Server misconfiguration: DATABASE_URL not set.' }, { status: 500 });
    }

    const json = await req.json();
    const data = publicFinancingSchema.parse(json);

    // Create or find pseudo customer by email (public submission not logged in)
    let customer = await prisma.customer.findFirst({ where: { email: data.email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          cognitoId: `public_${Date.now()}_${data.email.replace(/[@.]/g,'_')}`,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phoneNumber: data.phone,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postalCode: data.postalCode || undefined,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        }
      });
    }

    const financingApplication = await prisma.financingApplication.create({
      data: {
        loanAmount: data.loanAmount,
        interestRate: data.interestRate || 0,
        termMonths: data.termMonths,
        monthlyPayment: data.monthlyPayment || 0,
        customerId: customer.cognitoId,
        status: 'PENDING',
  creditScore: data.creditScore || null,
  annualIncome: data.annualIncome || null,
      }
    });

    // Persist extended detail record (model name FinancingApplicationDetail -> prisma.financingApplicationDetail)
    if (!(prisma as any).financingApplicationDetail) {
      console.error('Prisma client missing financingApplicationDetail model accessor. Ensure prisma generate succeeded.');
      return NextResponse.json({ error: 'Server model not ready. Try again shortly.' }, { status: 503 });
    }

    await (prisma as any).financingApplicationDetail.create({
      data: {
        financingApplicationId: financingApplication.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        idNumber: data.idNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        housingStatus: data.housingStatus || null,
        monthlyHousingPayment: data.monthlyHousingPayment || null,
        employmentStatus: data.employmentStatus || null,
        employerName: data.employerName || null,
        jobTitle: data.jobTitle || null,
        employmentYears: data.employmentYears || null,
        monthlyIncomeGross: data.monthlyIncomeGross || null,
        otherIncome: data.otherIncome || null,
        otherIncomeSource: data.otherIncomeSource || null,
        creditScoreRange: data.creditScoreRange || null,
        downPaymentAmount: data.downPaymentAmount || null,
        preferredContactMethod: data.preferredContactMethod || null,
        hasTradeIn: data.hasTradeIn ?? false,
        tradeInDetails: data.tradeInDetails || null,
        coApplicantName: data.coApplicantName || null,
        coApplicantIncome: data.coApplicantIncome || null,
        coApplicantRelationship: data.coApplicantRelationship || null,
        consentCreditCheck: data.consentCreditCheck,
        agreeTerms: data.agreeTerms,
      }
    });

    return NextResponse.json({ id: financingApplication.id, status: 'PENDING' }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', issues: e.issues }, { status: 400 });
    }
    if (e.code === 'P1001') {
      return NextResponse.json({ error: 'Cannot reach database. Check network / DATABASE_URL.' }, { status: 500 });
    }
    if (e instanceof Prisma.PrismaClientInitializationError || /invalid port number|Error parsing connection string/i.test(e.message)) {
      return NextResponse.json({ error: 'Invalid DATABASE_URL. Fix connection string format.' }, { status: 500 });
    }
    console.error('Public financing submission error', e);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

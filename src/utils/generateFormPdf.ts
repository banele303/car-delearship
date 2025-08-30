import { jsPDF } from 'jspdf';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrl: string | null;
}

interface Document {
  id: number;
  docType: string;
  originalName: string;
  url: string;
  mime: string;
  size: number;
  uploadedAt: string;
}

interface Application {
  id: number;
  applicationDate: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  creditScore: number;
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number;
  monthlyPayment: number;
  downPayment?: number;
  decisionDate?: string | null;
  decisionNotes?: string | null;
  isNSFASAccredited: boolean;
  customer: Customer;
  car: Car | null;
  documents?: Document[];
  details?: any; // This will contain the extended form data
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

const formatDate = (dateString: string, options?: { withTime?: boolean }): string => {
  const date = new Date(dateString);
  if (options?.withTime) {
    return date.toLocaleString('en-ZA');
  }
  return date.toLocaleDateString('en-ZA');
};

const getCreditScoreRating = (score: number) => {
  if (score >= 781) return { label: 'Excellent', color: '#22c55e' };
  if (score >= 661) return { label: 'Good', color: '#3b82f6' };
  if (score >= 601) return { label: 'Fair', color: '#f59e0b' };
  if (score >= 500) return { label: 'Poor', color: '#ef4444' };
  return { label: 'Very Poor', color: '#dc2626' };
};

export const generateFormPdf = (application: Application): void => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentY = margin;
  const lineHeight = 20;
  const sectionSpacing = 25;

  // Colors
  const primaryColor = '#1f2937';
  const headerColor = '#3b82f6';
  const lightGray = '#f3f4f6';
  const borderColor = '#d1d5db';

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Helper functions for drawing
  const addPage = () => {
    doc.addPage();
    currentY = margin;
  };

  const checkPageSpace = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      addPage();
    }
  };

  const drawHeader = () => {
    // Company header
    const headerRgb = hexToRgb(headerColor);
    doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
    doc.rect(margin, currentY, contentWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ADVANCE AUTO', margin + 20, currentY + 35);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Financing Application Form', margin + 20, currentY + 50);
    
    currentY += 80;
  };

  const drawSectionHeader = (title: string) => {
    checkPageSpace(40);
    
    const lightGrayRgb = hexToRgb(lightGray);
    doc.setFillColor(lightGrayRgb.r, lightGrayRgb.g, lightGrayRgb.b);
    doc.rect(margin, currentY, contentWidth, 30, 'F');
    
    const primaryRgb = hexToRgb(primaryColor);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 15, currentY + 20);
    
    currentY += 35;
  };

  const drawField = (label: string, value: string, width?: number) => {
    const fieldWidth = width || contentWidth / 2 - 10;
    const fieldHeight = 25;
    
    checkPageSpace(fieldHeight + 5);
    
    // Field container
    const borderRgb = hexToRgb(borderColor);
    doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
    doc.setLineWidth(1);
    doc.rect(margin, currentY, fieldWidth, fieldHeight);
    
    // Label
    const lightGrayRgb = hexToRgb(lightGray);
    doc.setFillColor(lightGrayRgb.r, lightGrayRgb.g, lightGrayRgb.b);
    doc.rect(margin, currentY, fieldWidth, 15, 'F');
    
    const primaryRgb = hexToRgb(primaryColor);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, currentY + 10);
    
    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const displayValue = value || '-';
    doc.text(displayValue, margin + 5, currentY + 22);
    
    return fieldWidth;
  };

  const drawTwoColumnFields = (field1: { label: string; value: string }, field2: { label: string; value: string }) => {
    const fieldWidth = (contentWidth - 20) / 2;
    
    drawField(field1.label, field1.value, fieldWidth);
    
    const savedY = currentY;
    currentY = savedY;
    
    // Draw second field next to first
    const secondFieldX = margin + fieldWidth + 20;
    const borderRgb = hexToRgb(borderColor);
    doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
    doc.setLineWidth(1);
    doc.rect(secondFieldX, currentY, fieldWidth, 25);
    
    // Label for second field
    const lightGrayRgb = hexToRgb(lightGray);
    doc.setFillColor(lightGrayRgb.r, lightGrayRgb.g, lightGrayRgb.b);
    doc.rect(secondFieldX, currentY, fieldWidth, 15, 'F');
    
    const primaryRgb = hexToRgb(primaryColor);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(field2.label, secondFieldX + 5, currentY + 10);
    
    // Value for second field
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const displayValue = field2.value || '-';
    doc.text(displayValue, secondFieldX + 5, currentY + 22);
    
    currentY += 30;
  };

  const drawFullWidthField = (label: string, value: string) => {
    drawField(label, value, contentWidth);
    currentY += 30;
  };

  // Start generating PDF
  drawHeader();

  // Application Information Section
  drawSectionHeader('APPLICATION INFORMATION');
  
  const creditRating = getCreditScoreRating(application.creditScore);
  
  drawTwoColumnFields(
    { label: 'Application ID', value: `#${application.id}` },
    { label: 'Status', value: application.status.toUpperCase() }
  );
  
  drawTwoColumnFields(
    { label: 'Application Date', value: formatDate(application.applicationDate, { withTime: true }) },
    { label: 'Decision Date', value: application.decisionDate ? formatDate(application.decisionDate, { withTime: true }) : 'Pending' }
  );

  currentY += sectionSpacing;

  // Loan Details Section
  drawSectionHeader('LOAN DETAILS');
  
  drawTwoColumnFields(
    { label: 'Loan Amount', value: formatCurrency(application.loanAmount) },
    { label: 'Loan Term', value: `${application.loanTermMonths} months` }
  );
  
  drawTwoColumnFields(
    { label: 'Monthly Payment', value: formatCurrency(application.monthlyPayment) },
    { label: 'Credit Score', value: `${application.creditScore} (${creditRating.label})` }
  );

  if (application.downPayment) {
    drawTwoColumnFields(
      { label: 'Down Payment', value: formatCurrency(application.downPayment) },
      { label: 'Interest Rate', value: `${application.interestRate}%` }
    );
  } else {
    drawFullWidthField('Interest Rate', `${application.interestRate}%`);
  }

  currentY += sectionSpacing;

  // Customer Information Section
  drawSectionHeader('CUSTOMER INFORMATION');
  
  const customerName = `${application.customer.firstName || ''} ${application.customer.lastName || ''}`.trim();
  
  drawFullWidthField('Full Name', customerName);
  
  drawTwoColumnFields(
    { label: 'Email Address', value: application.customer.email },
    { label: 'Phone Number', value: application.customer.phone }
  );
  
  drawFullWidthField('Date of Birth', formatDate(application.customer.dateOfBirth));

  currentY += sectionSpacing;

  // Vehicle Information Section
  if (application.car) {
    drawSectionHeader('VEHICLE INFORMATION');
    
    const vehicleInfo = `${application.car.year} ${application.car.make} ${application.car.model}`;
    
    drawFullWidthField('Vehicle', vehicleInfo);
    drawFullWidthField('Vehicle Price', formatCurrency(application.car.price));
    
    currentY += sectionSpacing;
  }

  // Extended Details Section
  if (application.details) {
    const details = application.details;
    
    drawSectionHeader('PERSONAL DETAILS');
    
    if (details.address) {
      drawFullWidthField('Address', details.address);
    }
    
    if (details.city || details.state) {
      drawTwoColumnFields(
        { label: 'City', value: details.city || '' },
        { label: 'State/Province', value: details.state || '' }
      );
    }
    
    if (details.postalCode || details.housingStatus) {
      drawTwoColumnFields(
        { label: 'Postal Code', value: details.postalCode || '' },
        { label: 'Housing Status', value: details.housingStatus || '' }
      );
    }

    currentY += sectionSpacing;

    // Employment Information
    if (details.employmentStatus || details.employerName) {
      drawSectionHeader('EMPLOYMENT INFORMATION');
      
      if (details.employmentStatus) {
        drawFullWidthField('Employment Status', details.employmentStatus);
      }
      
      if (details.employerName || details.jobTitle) {
        drawTwoColumnFields(
          { label: 'Employer Name', value: details.employerName || '' },
          { label: 'Job Title', value: details.jobTitle || '' }
        );
      }
      
      currentY += sectionSpacing;
    }

    // Financial Information
    if (details.monthlyIncomeGross || details.otherIncome || details.downPaymentAmount) {
      drawSectionHeader('FINANCIAL INFORMATION');
      
      if (details.monthlyIncomeGross) {
        drawFullWidthField('Monthly Gross Income', formatCurrency(details.monthlyIncomeGross));
      }
      
      if (details.otherIncome || details.downPaymentAmount) {
        drawTwoColumnFields(
          { label: 'Other Income', value: details.otherIncome ? formatCurrency(details.otherIncome) : '' },
          { label: 'Down Payment', value: details.downPaymentAmount ? formatCurrency(details.downPaymentAmount) : '' }
        );
      }
      
      currentY += sectionSpacing;
    }

    // Co-Applicant Information
    if (details.coApplicantName || details.coApplicantIncome) {
      drawSectionHeader('CO-APPLICANT INFORMATION');
      
      if (details.coApplicantName) {
        drawFullWidthField('Co-Applicant Name', details.coApplicantName);
      }
      
      if (details.coApplicantIncome || details.coApplicantRelationship) {
        drawTwoColumnFields(
          { label: 'Co-Applicant Income', value: details.coApplicantIncome ? formatCurrency(details.coApplicantIncome) : '' },
          { label: 'Relationship', value: details.coApplicantRelationship || '' }
        );
      }
      
      currentY += sectionSpacing;
    }

    // Additional Information from extraData
    if (details.extraData) {
      const extraEntries = Object.entries(details.extraData);
      const excludedKeys = new Set(['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'cashPrice']);
      
      const relevantEntries = extraEntries.filter(([key, value]) => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        !excludedKeys.has(key)
      );

      if (relevantEntries.length > 0) {
        drawSectionHeader('ADDITIONAL INFORMATION');
        
        relevantEntries.forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
          let valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
          
          // Check if it's a monetary value
          const isMoney = /payment|income|amount|price|cost/i.test(key) && !isNaN(Number(value));
          if (isMoney) {
            valueStr = formatCurrency(Number(value));
          }
          
          drawFullWidthField(label, valueStr);
        });
        
        currentY += sectionSpacing;
      }
    }
  }

  // Documents Section
  if (application.documents && application.documents.length > 0) {
    drawSectionHeader('SUBMITTED DOCUMENTS');
    
    application.documents.forEach(doc => {
      const docInfo = `${doc.originalName} (${(doc.size / 1024).toFixed(1)} KB)`;
      drawFullWidthField(doc.docType, docInfo);
    });
    
    currentY += sectionSpacing;
  }

  // Footer
  checkPageSpace(60);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('This document was generated automatically by Advance Auto Financing System', margin, currentY + 20);
  doc.text(`Generated on: ${new Date().toLocaleString('en-ZA')}`, margin, currentY + 35);

  // Save the PDF
  doc.save(`financing-application-${application.id}.pdf`);
};

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
    const fieldHeight = 30; // Increased height for better readability
    
    checkPageSpace(fieldHeight + 5);
    
    // Field container with stronger border
    const borderRgb = hexToRgb(borderColor);
    doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
    doc.setLineWidth(1.5);
    doc.rect(margin, currentY, fieldWidth, fieldHeight);
    
    // Label section with darker background
    const labelRgb = hexToRgb('#e5e7eb'); // Darker gray for better contrast
    doc.setFillColor(labelRgb.r, labelRgb.g, labelRgb.b);
    doc.rect(margin, currentY, fieldWidth, 18, 'F'); // Larger label area
    
    // Label text
    const primaryRgb = hexToRgb(primaryColor);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(10); // Slightly larger label font
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 8, currentY + 12);
    
    // Value text with better positioning
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const displayValue = value || '-';
    doc.text(displayValue, margin + 8, currentY + 25);
    
    return fieldWidth;
  };

  const drawTwoColumnFields = (field1: { label: string; value: string }, field2: { label: string; value: string }) => {
    const fieldWidth = (contentWidth - 20) / 2;
    
    drawField(field1.label, field1.value, fieldWidth);
    
    const savedY = currentY;
    currentY = savedY;
    
    // Draw second field next to first with improved styling
    const secondFieldX = margin + fieldWidth + 20;
    const borderRgb = hexToRgb(borderColor);
    doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
    doc.setLineWidth(1.5);
    doc.rect(secondFieldX, currentY, fieldWidth, 30); // Updated height
    
    // Label for second field with darker background
    const labelRgb = hexToRgb('#e5e7eb');
    doc.setFillColor(labelRgb.r, labelRgb.g, labelRgb.b);
    doc.rect(secondFieldX, currentY, fieldWidth, 18, 'F'); // Updated label height
    
    const primaryRgb = hexToRgb(primaryColor);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(10); // Updated font size
    doc.setFont('helvetica', 'bold');
    doc.text(field2.label, secondFieldX + 8, currentY + 12); // Updated positioning
    
    // Value for second field
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const displayValue = field2.value || '-';
    doc.text(displayValue, secondFieldX + 8, currentY + 25); // Updated positioning
    
    currentY += 35; // Updated spacing
  };

  const drawFullWidthField = (label: string, value: string) => {
    drawField(label, value, contentWidth);
    currentY += 35; // Updated spacing to match new field height
  };

  // Start generating PDF
  drawHeader();

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
    
    // Always show address
    drawFullWidthField('Address', details.address || 'None');
    
    // Always show city and state
    drawTwoColumnFields(
      { label: 'City', value: details.city || 'None' },
      { label: 'State/Province', value: details.state || 'None' }
    );
    
    // Always show postal code and housing status
    drawTwoColumnFields(
      { label: 'Postal Code', value: details.postalCode || 'None' },
      { label: 'Housing Status', value: details.housingStatus || 'None' }
    );

    currentY += sectionSpacing;

    // Employment Information - always show
    drawSectionHeader('EMPLOYMENT INFORMATION');
    
    // Always show employment status
    drawFullWidthField('Employment Status', details.employmentStatus || 'None');
    
    // Always show employer and job title
    drawTwoColumnFields(
      { label: 'Employer Name', value: details.employerName || 'None' },
      { label: 'Job Title', value: details.jobTitle || 'None' }
    );

    currentY += sectionSpacing;

    // Financial Information - always show
    drawSectionHeader('FINANCIAL INFORMATION');
    
    // Always show monthly gross income
    drawFullWidthField('Monthly Gross Income', details.monthlyIncomeGross ? formatCurrency(details.monthlyIncomeGross) : 'None');
    
    // Always show net income
    drawFullWidthField('Monthly Net Income', details.monthlyIncomeNet ? formatCurrency(details.monthlyIncomeNet) : 'None');
    
    // Always show other income only (removed down payment)
    drawFullWidthField('Other Income', details.otherIncome ? formatCurrency(details.otherIncome) : 'None');

    currentY += sectionSpacing;

    // Co-Applicant Information - always show
    drawSectionHeader('CO-APPLICANT INFORMATION');
    
    // Always show co-applicant name
    drawFullWidthField('Co-Applicant Name', details.coApplicantName || 'None');
    
    // Always show co-applicant income and relationship
    drawTwoColumnFields(
      { label: 'Co-Applicant Income', value: details.coApplicantIncome ? formatCurrency(details.coApplicantIncome) : 'None' },
      { label: 'Relationship', value: details.coApplicantRelationship || 'None' }
    );

    currentY += sectionSpacing;

    // Additional Information from extraData
    if (details.extraData) {
      const extraEntries = Object.entries(details.extraData);
      const excludedKeys = new Set([
        'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 
        'vehicleMake', 'vehicleModel', 'vehicleYear', 'cashPrice', 
        'loanAmount', 'termMonths', 'loanTermMonths', 'monthlyPayment', 'interestRate', 
        'team', 'Team', 'assignedTeam', 'salesTeam',
        // Remove these specific fields from PDF
        'fileIdDoc', 'vehicleFuelType', 'consentCheck', 'filesBankStatements', 
        'filesDriversLicense', 'legalCapacity', 'filesProofOfResidence', 
        'marketingCommunicationConsent', 'creditRecordDeclaration',
        // Additional file-related fields to exclude from ADDITIONAL INFORMATION
        'filesIdDoc', 'filesBankStatements', 'filesDriversLicense', 
        'filesProofOfResidence', 'files_id_doc', 'files_bank_statements',
        'files_drivers_license', 'files_proof_of_residence',
        // Exclude all expense fields since they'll have their own section
        'expenseRentBond', 'expenseRatesUtilities', 'expenseVehicleInstalments', 
        'expensePersonalLoans', 'expenseCreditCardRepayment', 'expenseFurniture', 
        'expenseClothing', 'expenseOverdraft', 'expenseInsurance', 'expenseTelephone', 
        'expenseTransport', 'expenseFoodEntertainment', 'expenseEducation', 
        'expenseMaintenance', 'expenseHousehold', 'expenseOther', 'totalMonthlyHouseholdExpenses'
      ]);
      
      const relevantEntries = extraEntries.filter(([key, value]) => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        !excludedKeys.has(key)
      );

      if (relevantEntries.length > 0) {
        drawSectionHeader('ADDITIONAL INFORMATION');
        
        // Process entries in pairs for two-column layout
        for (let i = 0; i < relevantEntries.length; i += 2) {
          const leftEntry = relevantEntries[i];
          const rightEntry = relevantEntries[i + 1];
          
          const leftLabel = leftEntry[0].replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
          let leftValue = typeof leftEntry[1] === 'object' ? JSON.stringify(leftEntry[1]) : String(leftEntry[1]);
          
          // Check if it's a monetary value
          const isLeftMoney = /payment|income|amount|price|cost/i.test(leftEntry[0]) && !isNaN(Number(leftEntry[1]));
          if (isLeftMoney) {
            leftValue = formatCurrency(Number(leftEntry[1]));
          }
          
          if (rightEntry) {
            // Two column layout
            const rightLabel = rightEntry[0].replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
            let rightValue = typeof rightEntry[1] === 'object' ? JSON.stringify(rightEntry[1]) : String(rightEntry[1]);
            
            const isRightMoney = /payment|income|amount|price|cost/i.test(rightEntry[0]) && !isNaN(Number(rightEntry[1]));
            if (isRightMoney) {
              rightValue = formatCurrency(Number(rightEntry[1]));
            }
            
            drawTwoColumnFields(
              { label: leftLabel, value: leftValue },
              { label: rightLabel, value: rightValue }
            );
          } else {
            // Single field for odd number of entries
            drawFullWidthField(leftLabel, leftValue);
          }
        }
        
        currentY += sectionSpacing;
      }
    }
  }

  // Always show Monthly Household Expenses Section (moved outside details conditional)
  drawSectionHeader('MONTHLY HOUSEHOLD EXPENSES');
  
  // Helper function to format expense value
  const formatExpenseValue = (value: any) => {
    if (!value || value === '' || value === '0' || value === 0) return 'None';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : formatCurrency(numValue);
  };
  
  // Get expense data with fallbacks - handle case where details might not exist
  const getExpenseValue = (fieldName: string) => {
    if (!application.details) return '';
    const details = application.details;
    return details[fieldName] || details.extraData?.[fieldName] || '';
  };
  
  // Row 1: Rent/Bond & Rates/Utilities
  drawTwoColumnFields(
    { label: 'Rent / Bond', value: formatExpenseValue(getExpenseValue('expenseRentBond')) },
    { label: 'Rates & Utilities', value: formatExpenseValue(getExpenseValue('expenseRatesUtilities')) }
  );
  
  // Row 2: Vehicle Instalments & Personal Loans
  drawTwoColumnFields(
    { label: 'Vehicle Instalments', value: formatExpenseValue(getExpenseValue('expenseVehicleInstalments')) },
    { label: 'Personal Loans', value: formatExpenseValue(getExpenseValue('expensePersonalLoans')) }
  );
  
  // Row 3: Credit Card Repayments & Furniture
  drawTwoColumnFields(
    { label: 'Credit Card Repayments', value: formatExpenseValue(getExpenseValue('expenseCreditCardRepayment')) },
    { label: 'Furniture', value: formatExpenseValue(getExpenseValue('expenseFurniture')) }
  );
  
  // Row 4: Clothing & Overdraft
  drawTwoColumnFields(
    { label: 'Clothing', value: formatExpenseValue(getExpenseValue('expenseClothing')) },
    { label: 'Overdraft', value: formatExpenseValue(getExpenseValue('expenseOverdraft')) }
  );
  
  // Row 5: Insurance & Telephone
  drawTwoColumnFields(
    { label: 'Insurance', value: formatExpenseValue(getExpenseValue('expenseInsurance')) },
    { label: 'Telephone', value: formatExpenseValue(getExpenseValue('expenseTelephone')) }
  );
  
  // Row 6: Transport & Food & Entertainment
  drawTwoColumnFields(
    { label: 'Transport', value: formatExpenseValue(getExpenseValue('expenseTransport')) },
    { label: 'Food & Entertainment', value: formatExpenseValue(getExpenseValue('expenseFoodEntertainment')) }
  );
  
  // Row 7: Education & Maintenance
  drawTwoColumnFields(
    { label: 'Education', value: formatExpenseValue(getExpenseValue('expenseEducation')) },
    { label: 'Maintenance (Alimony etc.)', value: formatExpenseValue(getExpenseValue('expenseMaintenance')) }
  );
  
  // Row 8: Household/Domestic & Other
  drawTwoColumnFields(
    { label: 'Household / Domestic', value: formatExpenseValue(getExpenseValue('expenseHousehold')) },
    { label: 'Other', value: formatExpenseValue(getExpenseValue('expenseOther')) }
  );
  
  // Total expenses - highlighted
  checkPageSpace(45);
  const totalExpenses = getExpenseValue('totalMonthlyHouseholdExpenses') || '0';
  const totalValue = formatExpenseValue(totalExpenses);
  
  // Draw total with special styling
  const lightBlueRgb = hexToRgb('#dbeafe');
  doc.setFillColor(lightBlueRgb.r, lightBlueRgb.g, lightBlueRgb.b);
  doc.rect(margin, currentY, contentWidth, 35, 'F');
  
  const borderRgb = hexToRgb('#3b82f6');
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  doc.setLineWidth(2);
  doc.rect(margin, currentY, contentWidth, 35);
  
  const primaryRgb = hexToRgb(primaryColor);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL MONTHLY HOUSEHOLD EXPENSES', margin + 15, currentY + 15);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(totalValue, margin + 15, currentY + 28);
  
  currentY += 50; // Extra spacing after expenses section

  // Documents Section
  if (application.documents && application.documents.length > 0) {
    drawSectionHeader('SUBMITTED DOCUMENTS');
    
    // Display each document on its own row for better readability
    application.documents.forEach((doc) => {
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

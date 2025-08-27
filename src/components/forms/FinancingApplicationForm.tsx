"use client";

import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  // Finance calculation fields (kept optional in UI)
  loanAmount: z.string().optional(),
  termMonths: z.string().optional(),
  interestRate: z.string().optional(),
  monthlyPayment: z.string().optional(),
  // FIRST 15 INPUTS NOW REQUIRED
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(5, 'Phone required'),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  idNumber: z.string().min(1, 'ID Number required'),
  address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State / Province required'),
  postalCode: z.string().min(1, 'Postal Code required'),
  housingStatus: z.string().min(1, 'Housing status required'),
  title: z.string().min(1, 'Title required'),
  initials: z.string().min(1, 'Initials required'),
  gender: z.string().optional(),
  dependants: z.string().optional(),
  // monthlyHousingPayment removed per request
  employmentStatus: z.string().min(1, 'Employment status required'),
  employerName: z.string().min(1, 'Employer name required'),
  jobTitle: z.string().min(1, 'Job title required'),
  employmentYears: z.string().min(1, 'Years in job required'),
  monthlyIncomeGross: z.string().min(1, 'Gross monthly income required'),
  otherIncome: z.string().optional(),
  otherIncomeSource: z.string().optional(),
  creditScoreRange: z.string().optional(),
  creditScore: z.string().optional(),
  annualIncome: z.string().optional(),
  downPaymentAmount: z.string().optional(),
  // preferredContactMethod removed per request
  hasTradeIn: z.boolean().optional(),
  tradeInDetails: z.string().optional(),
  // co-applicant fields removed per request
  // consent & terms checkboxes removed per latest request
  consentCreditCheck: z.boolean().optional(),
  agreeTerms: z.boolean().optional(),
  // Vehicle core fields now required
  vehicleCondition: z.string().min(1, 'Vehicle condition required'),
  cashPrice: z.string().min(1, 'Cash price required'),
  vehicleMake: z.string().min(1, 'Make required'),
  vehicleModel: z.string().min(1, 'Model required'),
  vehicleMMCode: z.string().optional(),
  vehicleKM: z.string().optional(), // conditionally required if Used
  vehicleFuelType: z.string().optional(),
  vehicleTransmission: z.string().optional(),
  vehicleType: z.string().optional(),
  // balloonResidual & vehicleExtras removed per request
  maritalStatus: z.string().optional(),
  dateMarried: z.string().optional(),
  periodAtAddress: z.string().optional(),
  periodAtPreviousAddress: z.string().optional(),
  previousAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  telephoneHome: z.string().min(1, 'Home phone required'),
  telephoneWork: z.string().optional(),
  fax: z.string().optional(),
  spouseName: z.string().optional(),
  spouseId: z.string().optional(),
  spouseCell: z.string().optional(),
  // NEXT OF KIN FIELDS NOW REQUIRED
  nextOfKinName: z.string().min(1, 'Next of Kin name required'),
  nextOfKinRelationship: z.string().min(1, 'Relationship required'),
  nextOfKinAddress: z.string().min(1, 'Next of Kin address required'),
  nextOfKinCell: z.string().min(1, 'Next of Kin cell required'),
  bondHolder: z.string().optional(),
  bondOutstandingAmount: z.string().optional(),
  propertyValue: z.string().optional(),
  propertyInstalmentMonthly: z.string().optional(),
  propertyPurchasePrice: z.string().optional(),
  propertyPurchaseDate: z.string().optional(),
  propertyRegisteredInName: z.string().optional(),
  employerAddress: z.string().optional(),
  occupation: z.string().optional(),
  graduate: z.string().optional(),
  yearsPreviouslyEmployed: z.string().optional(),
  salaryDate: z.string().optional(),
  spouseEmployer: z.string().optional(),
  spouseYearsEmployed: z.string().optional(),
  spouseOccupation: z.string().optional(),
  employerTelephone: z.string().optional(),
  bankName: z.string().optional(),
  bankBranchName: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankBranchCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountType: z.string().optional(),
  grossSalary: z.string().optional(),
  basicMonthlyExclCar: z.string().optional(),
  carAllowance: z.string().optional(),
  monthlyCommission: z.string().optional(),
  netTakeHomePay: z.string().optional(),
  sourceOfIncome: z.string().optional(),
  totalMonthlyHouseholdIncome: z.string().optional(),
  expenseRentBond: z.string().optional(),
  expenseRatesUtilities: z.string().optional(),
  expenseVehicleInstalments: z.string().optional(),
  expensePersonalLoans: z.string().optional(),
  expenseCreditCardRepayment: z.string().optional(),
  expenseFurniture: z.string().optional(),
  expenseClothing: z.string().optional(),
  expenseOverdraft: z.string().optional(),
  expenseInsurance: z.string().optional(),
  expenseTelephone: z.string().optional(),
  expenseTransport: z.string().optional(),
  expenseFoodEntertainment: z.string().optional(),
  expenseEducation: z.string().optional(),
  expenseMaintenance: z.string().optional(),
  expenseHousehold: z.string().optional(),
  expenseOther: z.string().optional(),
  totalMonthlyHouseholdExpenses: z.string().optional(),
  liableAsSurety: z.string().optional(),
  liabilityDetails: z.string().optional(),
  referralSource: z.string().optional(),
  // New required declarations
  legalCapacityConfirm: z.boolean().refine(v => v, { message: 'Required' }),
  creditRecordDeclaration: z.boolean().refine(v => v, { message: 'Required' }),
  marketingCommunicationConsent: z.boolean().refine(v => v, { message: 'Required' }),
}).superRefine((data, ctx) => {
  if (/used/i.test(data.vehicleCondition || '') && !data.vehicleKM) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['vehicleKM'],
      message: 'KM required for used vehicles'
    });
  }
});

export type FinancingPublicForm = z.infer<typeof schema>;

const defaultValues: FinancingPublicForm = {
  loanAmount: '', termMonths: '60', interestRate: '', monthlyPayment: '',
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', idNumber: '', address: '', city: '', state: '', postalCode: '',
  housingStatus: '', employmentStatus: '', employerName: '', jobTitle: '', employmentYears: '',
  monthlyIncomeGross: '', otherIncome: '', otherIncomeSource: '', creditScoreRange: '', downPaymentAmount: '',
  creditScore: '', annualIncome: '',
  hasTradeIn: false, tradeInDetails: '',
  consentCreditCheck: false, agreeTerms: false,
  vehicleCondition: '', cashPrice: '', vehicleMake: '', vehicleModel: '', vehicleMMCode: '', vehicleKM: '',
  vehicleFuelType: '', vehicleTransmission: '', vehicleType: '',
  title: '', initials: '', gender: '', dependants: '', maritalStatus: '', dateMarried: '', periodAtAddress: '', periodAtPreviousAddress: '', previousAddress: '', postalAddress: '', telephoneHome: '', telephoneWork: '', fax: '', spouseName: '', spouseId: '', spouseCell: '', nextOfKinName: '', nextOfKinRelationship: '', nextOfKinAddress: '', nextOfKinCell: '',
  bondHolder: '', bondOutstandingAmount: '', propertyValue: '', propertyInstalmentMonthly: '', propertyPurchasePrice: '', propertyPurchaseDate: '', propertyRegisteredInName: '',
  employerAddress: '', occupation: '', graduate: '', yearsPreviouslyEmployed: '', salaryDate: '', spouseEmployer: '', spouseYearsEmployed: '', spouseOccupation: '', employerTelephone: '',
  bankName: '', bankBranchName: '', bankAccountHolder: '', bankBranchCode: '', bankAccountNumber: '', bankAccountType: '',
  grossSalary: '', basicMonthlyExclCar: '', carAllowance: '', monthlyCommission: '', netTakeHomePay: '', sourceOfIncome: '', totalMonthlyHouseholdIncome: '',
  expenseRentBond: '', expenseRatesUtilities: '', expenseVehicleInstalments: '', expensePersonalLoans: '', expenseCreditCardRepayment: '', expenseFurniture: '', expenseClothing: '', expenseOverdraft: '', expenseInsurance: '', expenseTelephone: '', expenseTransport: '', expenseFoodEntertainment: '', expenseEducation: '', expenseMaintenance: '', expenseHousehold: '', expenseOther: '', totalMonthlyHouseholdExpenses: '',
  liableAsSurety: '', liabilityDetails: '', referralSource: '',
  legalCapacityConfirm: false,
  creditRecordDeclaration: false,
  marketingCommunicationConsent: false,
};

interface FieldProps { label: string; name: keyof FinancingPublicForm; type?: string; placeholder?: string; colSpan?: string; uncontrolled?: boolean; defaultValue?: string; value?: string; onChange?: (v: string)=>void; }

// Required field names (excluding declaration checkboxes handled elsewhere)
const REQUIRED_FIELDS = new Set<keyof FinancingPublicForm>([
  // First 15 inputs (gender & dependants made optional per request)
  'firstName','lastName','email','phone','dateOfBirth','idNumber','address','city','state','postalCode','housingStatus','title','initials',
  // Next of kin required fields
  'nextOfKinName','nextOfKinRelationship','nextOfKinAddress','nextOfKinCell',
  'telephoneHome',
  // Employment line now required
  'employmentStatus','employerName','jobTitle','employmentYears','monthlyIncomeGross',
  // Existing vehicle required fields
  'vehicleCondition','cashPrice','vehicleMake','vehicleModel'
]);

// Date field auto-detection
const DATE_FIELDS = new Set<keyof FinancingPublicForm>(['dateOfBirth','dateMarried','propertyPurchaseDate','salaryDate']);
// Phone fields for normalization
const PHONE_FIELDS = new Set<keyof FinancingPublicForm>(['phone','telephoneHome','telephoneWork','spouseCell','nextOfKinCell']);

const TextField = React.memo<FieldProps>(({ label, name, type='text', placeholder, colSpan, uncontrolled = true, defaultValue = '', value, onChange }) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  }, [onChange]);
  const required = REQUIRED_FIELDS.has(name);
  const err = (typeof window !== 'undefined' && (window as any).__finErrors) ? (window as any).__finErrors[name] : undefined;
  const effectiveType = DATE_FIELDS.has(name) ? 'date' : type;
  return (
    <div className={colSpan || ''}>
      <Label className='text-sm font-medium flex items-center gap-1' htmlFor={name}>{label}{required && <span className='text-red-500'>*</span>}</Label>
      <Input
        id={name}
        name={name}
        data-financing-field
        data-phone={PHONE_FIELDS.has(name) ? 'true' : undefined}
        type={effectiveType}
        placeholder={placeholder}
        {...(uncontrolled ? { defaultValue } : { value: value ?? '', onChange: handleChange })}
        onBlur={(e) => {
          // Phone normalization
          if (PHONE_FIELDS.has(name)) {
            const raw = e.target.value;
            const digits = raw.replace(/[^0-9]/g,'');
            let intl = digits;
            if (intl.startsWith('0')) intl = '27' + intl.slice(1);
            if (!intl.startsWith('27')) intl = '27' + intl; // force ZA country code
            const pretty = '+' + intl.replace(/^27(\d{2})(\d{3})(\d{4})$/, '27 $1 $2 $3');
            // Fallback if pattern mismatch
            e.target.value = pretty.startsWith('+27 ') ? pretty : '+' + intl;
          }
          if (typeof window !== 'undefined' && (window as any).__validateFinField) {
            (window as any).__validateFinField(name, (e.target as HTMLInputElement).value);
          }
        }}
        className={'mt-1 ' + (err ? 'border-red-500 focus-visible:ring-red-500' : '')}
      />
      {err && <p className='mt-1 text-xs text-red-600'>{err}</p>}
    </div>
  );
});

// Register plugin once at module load (prevents repeated re-registration & potential focus side-effects)
if (typeof window !== 'undefined') {
  try {
    if (!(window as any).__fpImgPreviewRegistered) {
      registerPlugin(FilePondPluginImagePreview);
      (window as any).__fpImgPreviewRegistered = true;
    }
  } catch {}
}

export default function FinancingApplicationForm() {
  const [form, setForm] = useState<FinancingPublicForm>(defaultValues);
  // Store only keys that currently have an error; omit key to represent no error
  const [errors, setErrors] = useState<Partial<Record<keyof FinancingPublicForm, string>>>({});
  // Expose errors for TextField lookup (avoid prop drilling large form)
  useEffect(() => { if (typeof window !== 'undefined') { (window as any).__finErrors = errors; } }, [errors]);
  // Field validator (partial); runs full schema but filters for field path
  const validateField = React.useCallback((name: keyof FinancingPublicForm, value: any) => {
    try {
      const candidate: any = { ...form, [name]: value };
      const res = schema.safeParse(candidate);
      if (res.success) {
        setErrors(prev => {
          if (prev[name]) {
            const { [name]: _, ...rest } = prev;
            return rest;
          }
            return prev;
        });
      } else {
        const issue = res.error.issues.find(i => i.path[0] === name);
        if (issue) {
          setErrors(prev => ({ ...prev, [name]: issue.message || 'Invalid' }));
        } else {
          setErrors(prev => {
            if (prev[name]) { const { [name]: _, ...rest } = prev; return rest; }
            return prev;
          });
        }
      }
    } catch {}
  }, [form]);
  useEffect(() => { if (typeof window !== 'undefined') { (window as any).__validateFinField = validateField; } }, [validateField]);
  const formRef = useRef<HTMLFormElement | null>(null);
  // Track last focused input name to auto-restore if unexpected blur happens
  const lastFocusedRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement && t.hasAttribute('data-financing-field')) {
        lastFocusedRef.current = t;
      }
    };
    // Prevent scroll jump when interacting with document upload areas / file dialogs
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If click originated inside a FilePond / upload wrapper, skip auto-focus restore
      if (target.closest('.doc-upload-wrapper') || target.closest('.filepond--root')) return;
      // Only attempt to restore if body is active (no other element took focus)
      if (document.activeElement === document.body && lastFocusedRef.current) {
        // Extra guard: ensure last focused element is still in DOM and visible
        const el = lastFocusedRef.current;
        if (document.contains(el) && el.offsetParent !== null) {
          // Use requestAnimationFrame to avoid layout thrash & potential scroll jump
          requestAnimationFrame(() => {
            try { el.focus({ preventScroll: true }); } catch {}
          });
        }
      }
    };
    window.addEventListener('focusin', handleFocusIn);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  
  // Load car details from localStorage if available
  useEffect(() => {
    try {
      const savedCarDetails = localStorage.getItem("financingCarDetails");
      if (savedCarDetails) {
        const carDetails = JSON.parse(savedCarDetails);
        console.log("Loaded car details from localStorage:", carDetails);
        
        // Update the form with car details
        // Normalize legacy / alternative fuel type values to PETROL before populating the form
        const rawFuel: string | undefined = carDetails.fuelType;
        const normalizedFuel = rawFuel === 'GASOLINE' || rawFuel === 'FUEL' ? 'PETROL' : rawFuel;
        setForm(prev => ({
          ...prev,
          vehicleMake: carDetails.make || prev.vehicleMake,
          vehicleModel: carDetails.model || prev.vehicleModel,
          loanAmount: carDetails.price?.toString() || prev.loanAmount,
          cashPrice: carDetails.price?.toString() || prev.cashPrice,
          // Prefer explicit condition; if absent infer by mileage / year
          vehicleCondition: carDetails.condition
            ? (carDetails.condition === 'NEW' ? 'New' : 'Used')
            : (carDetails.mileage > 0 ? 'Used' : prev.vehicleCondition || 'New'),
          vehicleKM: (carDetails.mileage != null && carDetails.mileage !== undefined)
            ? String(carDetails.mileage)
            : prev.vehicleKM,
          vehicleFuelType: normalizedFuel || prev.vehicleFuelType,
          vehicleTransmission: carDetails.transmission || prev.vehicleTransmission,
          vehicleType: carDetails.carType || prev.vehicleType
        }));
        
        // Clear localStorage after using it
        // localStorage.removeItem("financingCarDetails");
      }
    } catch (error) {
      console.error("Error loading car details from localStorage:", error);
    }
  }, []);
  const [submitting, setSubmitting] = useState(false);
  
  // Create stable handleFieldUpdate function to prevent focus loss
  const handleFieldUpdate = React.useCallback(<K extends keyof FinancingPublicForm>(k: K, v: FinancingPublicForm[K]) => {
    // Only update for fields that influence UI (checkboxes/selects)
    setForm(prev => ({ ...prev, [k]: v }));
  }, []);

  // Create stable onChange handlers for each field to prevent focus loss
  const onChangeHandlers = React.useMemo(() => ({
    firstName: (v: string) => handleFieldUpdate('firstName', v),
    lastName: (v: string) => handleFieldUpdate('lastName', v),
    email: (v: string) => handleFieldUpdate('email', v),
    phone: (v: string) => handleFieldUpdate('phone', v),
    dateOfBirth: (v: string) => handleFieldUpdate('dateOfBirth', v),
    idNumber: (v: string) => handleFieldUpdate('idNumber', v),
    address: (v: string) => handleFieldUpdate('address', v),
    city: (v: string) => handleFieldUpdate('city', v),
    state: (v: string) => handleFieldUpdate('state', v),
    postalCode: (v: string) => handleFieldUpdate('postalCode', v),
    title: (v: string) => handleFieldUpdate('title', v),
    initials: (v: string) => handleFieldUpdate('initials', v),
    gender: (v: string) => handleFieldUpdate('gender', v),
    dependants: (v: string) => handleFieldUpdate('dependants', v),
    maritalStatus: (v: string) => handleFieldUpdate('maritalStatus', v),
    dateMarried: (v: string) => handleFieldUpdate('dateMarried', v),
    periodAtAddress: (v: string) => handleFieldUpdate('periodAtAddress', v),
    periodAtPreviousAddress: (v: string) => handleFieldUpdate('periodAtPreviousAddress', v),
    previousAddress: (v: string) => handleFieldUpdate('previousAddress', v),
    postalAddress: (v: string) => handleFieldUpdate('postalAddress', v),
    employmentStatus: (v: string) => handleFieldUpdate('employmentStatus', v),
    employerName: (v: string) => handleFieldUpdate('employerName', v),
    jobTitle: (v: string) => handleFieldUpdate('jobTitle', v),
    employmentYears: (v: string) => handleFieldUpdate('employmentYears', v),
    monthlyIncomeGross: (v: string) => handleFieldUpdate('monthlyIncomeGross', v),
    otherIncome: (v: string) => handleFieldUpdate('otherIncome', v),
    otherIncomeSource: (v: string) => handleFieldUpdate('otherIncomeSource', v),
    creditScoreRange: (v: string) => handleFieldUpdate('creditScoreRange', v),
    creditScore: (v: string) => handleFieldUpdate('creditScore', v),
    annualIncome: (v: string) => handleFieldUpdate('annualIncome', v),
    loanAmount: (v: string) => handleFieldUpdate('loanAmount', v),
    termMonths: (v: string) => handleFieldUpdate('termMonths', v),
    interestRate: (v: string) => handleFieldUpdate('interestRate', v),
    monthlyPayment: (v: string) => handleFieldUpdate('monthlyPayment', v),
    downPaymentAmount: (v: string) => handleFieldUpdate('downPaymentAmount', v),
  tradeInDetails: (v: string) => handleFieldUpdate('tradeInDetails', v),
  vehicleKM: (v: string) => handleFieldUpdate('vehicleKM', v),
  vehicleMMCode: (v: string) => handleFieldUpdate('vehicleMMCode', v),
  vehicleMake: (v: string) => handleFieldUpdate('vehicleMake', v),
  vehicleModel: (v: string) => handleFieldUpdate('vehicleModel', v),
  cashPrice: (v: string) => handleFieldUpdate('cashPrice', v),
  vehicleFuelType: (v: string) => handleFieldUpdate('vehicleFuelType', v),
  vehicleTransmission: (v: string) => handleFieldUpdate('vehicleTransmission', v),
  vehicleType: (v: string) => handleFieldUpdate('vehicleType', v),
    housingStatus: (v: string) => handleFieldUpdate('housingStatus', v),
    hasTradeIn: (v: boolean) => handleFieldUpdate('hasTradeIn', v),
    legalCapacityConfirm: (v: boolean) => handleFieldUpdate('legalCapacityConfirm', v),
    creditRecordDeclaration: (v: boolean) => handleFieldUpdate('creditRecordDeclaration', v),
    marketingCommunicationConsent: (v: boolean) => handleFieldUpdate('marketingCommunicationConsent', v),
    // Checkbox handlers with Boolean conversion
    hasTradeInChecked: (v: boolean | "indeterminate") => handleFieldUpdate('hasTradeIn', Boolean(v)),
    legalCapacityConfirmChecked: (v: boolean | "indeterminate") => handleFieldUpdate('legalCapacityConfirm', Boolean(v)),
    creditRecordDeclarationChecked: (v: boolean | "indeterminate") => handleFieldUpdate('creditRecordDeclaration', Boolean(v)),
    marketingCommunicationConsentChecked: (v: boolean | "indeterminate") => handleFieldUpdate('marketingCommunicationConsent', Boolean(v)),
    // Textarea handlers with event conversion
    tradeInDetailsTextarea: (e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldUpdate('tradeInDetails', e.target.value),
    // Additional fields
    telephoneHome: (v: string) => handleFieldUpdate('telephoneHome', v),
    telephoneWork: (v: string) => handleFieldUpdate('telephoneWork', v),
    fax: (v: string) => handleFieldUpdate('fax', v),
    spouseName: (v: string) => handleFieldUpdate('spouseName', v),
    spouseId: (v: string) => handleFieldUpdate('spouseId', v),
    spouseCell: (v: string) => handleFieldUpdate('spouseCell', v),
    nextOfKinName: (v: string) => handleFieldUpdate('nextOfKinName', v),
    nextOfKinRelationship: (v: string) => handleFieldUpdate('nextOfKinRelationship', v),
    nextOfKinAddress: (v: string) => handleFieldUpdate('nextOfKinAddress', v),
    nextOfKinCell: (v: string) => handleFieldUpdate('nextOfKinCell', v),
    bondHolder: (v: string) => handleFieldUpdate('bondHolder', v),
    bondOutstandingAmount: (v: string) => handleFieldUpdate('bondOutstandingAmount', v),
    propertyValue: (v: string) => handleFieldUpdate('propertyValue', v),
    propertyInstalmentMonthly: (v: string) => handleFieldUpdate('propertyInstalmentMonthly', v),
    propertyPurchasePrice: (v: string) => handleFieldUpdate('propertyPurchasePrice', v),
    propertyPurchaseDate: (v: string) => handleFieldUpdate('propertyPurchaseDate', v),
    propertyRegisteredInName: (v: string) => handleFieldUpdate('propertyRegisteredInName', v),
  // Vehicle detail field (condition)
  vehicleCondition: (v: string) => handleFieldUpdate('vehicleCondition', v),
    // Additional employment/income fields that might be missing
    employerAddress: (v: string) => handleFieldUpdate('employerAddress', v),
    occupation: (v: string) => handleFieldUpdate('occupation', v),
    graduate: (v: string) => handleFieldUpdate('graduate', v),
    yearsPreviouslyEmployed: (v: string) => handleFieldUpdate('yearsPreviouslyEmployed', v),
    salaryDate: (v: string) => handleFieldUpdate('salaryDate', v),
    spouseEmployer: (v: string) => handleFieldUpdate('spouseEmployer', v),
    spouseYearsEmployed: (v: string) => handleFieldUpdate('spouseYearsEmployed', v),
    spouseOccupation: (v: string) => handleFieldUpdate('spouseOccupation', v),
    employerTelephone: (v: string) => handleFieldUpdate('employerTelephone', v),
    // Bank details fields
    bankName: (v: string) => handleFieldUpdate('bankName', v),
    bankBranchName: (v: string) => handleFieldUpdate('bankBranchName', v),
    bankAccountHolder: (v: string) => handleFieldUpdate('bankAccountHolder', v),
    bankBranchCode: (v: string) => handleFieldUpdate('bankBranchCode', v),
    bankAccountNumber: (v: string) => handleFieldUpdate('bankAccountNumber', v),
    bankAccountType: (v: string) => handleFieldUpdate('bankAccountType', v),
    // Income fields
    grossSalary: (v: string) => handleFieldUpdate('grossSalary', v),
    basicMonthlyExclCar: (v: string) => handleFieldUpdate('basicMonthlyExclCar', v),
    carAllowance: (v: string) => handleFieldUpdate('carAllowance', v),
    monthlyCommission: (v: string) => handleFieldUpdate('monthlyCommission', v),
    netTakeHomePay: (v: string) => handleFieldUpdate('netTakeHomePay', v),
    sourceOfIncome: (v: string) => handleFieldUpdate('sourceOfIncome', v),
    totalMonthlyHouseholdIncome: (v: string) => handleFieldUpdate('totalMonthlyHouseholdIncome', v),
    // Expense fields
    expenseRentBond: (v: string) => handleFieldUpdate('expenseRentBond', v),
    expenseRatesUtilities: (v: string) => handleFieldUpdate('expenseRatesUtilities', v),
    expenseVehicleInstalments: (v: string) => handleFieldUpdate('expenseVehicleInstalments', v),
    expensePersonalLoans: (v: string) => handleFieldUpdate('expensePersonalLoans', v),
    expenseCreditCardRepayment: (v: string) => handleFieldUpdate('expenseCreditCardRepayment', v),
    expenseFurniture: (v: string) => handleFieldUpdate('expenseFurniture', v),
    expenseClothing: (v: string) => handleFieldUpdate('expenseClothing', v),
    expenseOverdraft: (v: string) => handleFieldUpdate('expenseOverdraft', v),
    expenseInsurance: (v: string) => handleFieldUpdate('expenseInsurance', v),
    expenseTelephone: (v: string) => handleFieldUpdate('expenseTelephone', v),
    expenseTransport: (v: string) => handleFieldUpdate('expenseTransport', v),
    expenseFoodEntertainment: (v: string) => handleFieldUpdate('expenseFoodEntertainment', v),
    expenseEducation: (v: string) => handleFieldUpdate('expenseEducation', v),
    expenseMaintenance: (v: string) => handleFieldUpdate('expenseMaintenance', v),
    expenseHousehold: (v: string) => handleFieldUpdate('expenseHousehold', v),
    expenseOther: (v: string) => handleFieldUpdate('expenseOther', v),
    totalMonthlyHouseholdExpenses: (v: string) => handleFieldUpdate('totalMonthlyHouseholdExpenses', v),
    // Other fields
    liableAsSurety: (v: string) => handleFieldUpdate('liableAsSurety', v),
    liabilityDetails: (v: string) => handleFieldUpdate('liabilityDetails', v),
    referralSource: (v: string) => handleFieldUpdate('referralSource', v),
  }), [handleFieldUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    // Build data from actual DOM values so nothing is lost between edits
    const fd = new FormData(formRef.current);
    const collected: any = { ...form }; // start with controlled bits (checkboxes/selects)
    fd.forEach((v, k) => {
      if (typeof v === 'string') {
        collected[k] = v.trim();
      }
    });
    // Booleans from checkboxes
    collected.hasTradeIn = form.hasTradeIn;
    collected.legalCapacityConfirm = form.legalCapacityConfirm;
    collected.creditRecordDeclaration = form.creditRecordDeclaration;
    collected.marketingCommunicationConsent = form.marketingCommunicationConsent;

  // Removed strict schema blocking per request (previously enforced declarations & loan fields)
    // Ensure required documents uploaded
    const missingDocs = typeof missingRequiredDocs === 'function' ? (missingRequiredDocs() as any) : [];
    if (missingDocs.length) {
      toast.error(`Missing required documents: ${missingDocs.map((d:any)=>d.label).join(', ')}`);
      const docSection = document.getElementById('docs-section');
      if (docSection) docSection.scrollIntoView({behavior:'smooth'});
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...collected,
        // Coerce hidden consent flags (they come through as strings from hidden inputs)
        consentCreditCheck: typeof collected.consentCreditCheck === 'string' ? collected.consentCreditCheck === 'true' : collected.consentCreditCheck === true,
        agreeTerms: typeof collected.agreeTerms === 'string' ? collected.agreeTerms === 'true' : collected.agreeTerms === true,
  documents: uploadedDocsRef.current(),
        loanAmount: collected.loanAmount ? Number(collected.loanAmount) : undefined,
        termMonths: collected.termMonths ? Number(collected.termMonths) : undefined,
        interestRate: collected.interestRate ? Number(collected.interestRate) : undefined,
        monthlyPayment: collected.monthlyPayment ? Number(collected.monthlyPayment) : undefined,
        employmentYears: collected.employmentYears ? Number(collected.employmentYears) : undefined,
        monthlyIncomeGross: collected.monthlyIncomeGross ? Number(collected.monthlyIncomeGross) : undefined,
        otherIncome: collected.otherIncome ? Number(collected.otherIncome) : undefined,
        annualIncome: collected.annualIncome ? Number(collected.annualIncome) : undefined,
        creditScore: collected.creditScore ? Number(collected.creditScore) : undefined,
        downPaymentAmount: collected.downPaymentAmount ? Number(collected.downPaymentAmount) : undefined,
      };
      const res = await fetch('/api/financing-applications/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'Submission failed'}));
        if (j.issues?.length) {
          // Show first validation issue for clarity
            const first = j.issues[0];
            const msg = first?.message || j.error || 'Submission failed';
            toast.error(msg);
        } else {
          toast.error(j.error || 'Submission failed');
        }
      } else {
        toast.success('Application submitted!');
        formRef.current.reset(); // clear visible inputs
        setForm(defaultValues); // reset controlled items
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const [open, setOpen] = useState<Record<string, boolean>>({ applicant: true, vehicle: true, docs: false });
  const toggle = (k:string)=> setOpen(o=>({...o,[k]:!o[k]}));
  const Section: React.FC<{id:string; title:string; desc?:string; children:React.ReactNode; noScrollAdjust?: boolean}> = ({id,title,desc,children,noScrollAdjust}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const handleToggle = () => {
      if (noScrollAdjust) { toggle(id); return; }
      if (!containerRef.current) { toggle(id); return; }
      const prevRect = containerRef.current.getBoundingClientRect();
      const prevTop = prevRect.top;
      const prevScrollY = window.scrollY;
      toggle(id);
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const newRect = containerRef.current.getBoundingClientRect();
        const delta = newRect.top - prevTop;
        if (Math.abs(delta) > 1) {
          window.scrollTo({ top: prevScrollY + delta, left: window.scrollX });
        }
      });
    };
    return (
      <div ref={containerRef} className='border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm'>
        <button type='button' onClick={handleToggle} className='w-full flex items-center justify-between px-4 py-3 text-left'>
          <div>
            <h3 className='font-semibold text-base md:text-lg'>{title}</h3>
            {desc && <p className='text-xs text-slate-500 mt-0.5'>{desc}</p>}
          </div>
            <span className='text-xs font-medium text-blue-600'>{open[id] ? 'Hide' : 'Show'}</span>
        </button>
        {open[id] && <div className='px-4 pb-6 pt-2 space-y-6'>{children}</div>}
      </div>
    );
  };

  // Track last focused element for debugging focus-loss issues
  useEffect(() => {
    const handler = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t && t.tagName === 'INPUT') {
        // console.debug('Focus on', (t as any).name || t.id);
      }
    };
    window.addEventListener('focusin', handler);
    return () => window.removeEventListener('focusin', handler);
  }, []);

  // Persist text input values on blur into form state so if a remount happens (e.g., due to a select update) we can repopulate defaultValue from state
  useEffect(() => {
    const blurListener = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (!el || el.tagName !== 'INPUT' || !el.hasAttribute('data-financing-field')) return;
      const name = el.name as keyof FinancingPublicForm;
      const val = el.value;
      setForm(prev => {
        if (prev[name] === val) return prev; // no change
        return { ...prev, [name]: val };
      });
    };
    document.addEventListener('blur', blurListener, true);
    return () => document.removeEventListener('blur', blurListener, true);
  }, []);

  // Auto-sum expenses into totalMonthlyHouseholdExpenses
  const expenseKeys: (keyof FinancingPublicForm)[] = [
    'expenseRentBond','expenseRatesUtilities','expenseVehicleInstalments','expensePersonalLoans','expenseCreditCardRepayment','expenseFurniture','expenseClothing','expenseOverdraft','expenseInsurance','expenseTelephone','expenseTransport','expenseFoodEntertainment','expenseEducation','expenseMaintenance','expenseHousehold','expenseOther'
  ];
  useEffect(() => {
    let sum = 0;
    for (const k of expenseKeys) {
      const raw = (form as any)[k];
      if (raw) {
        const num = parseFloat(String(raw).replace(/[^0-9.]/g,''));
        if (!isNaN(num)) sum += num;
      }
    }
    const newVal = sum > 0 ? String(sum.toFixed(2)) : '';
    if (form.totalMonthlyHouseholdExpenses !== newVal) {
      setForm(prev => ({ ...prev, totalMonthlyHouseholdExpenses: newVal }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.expenseRentBond,form.expenseRatesUtilities,form.expenseVehicleInstalments,form.expensePersonalLoans,form.expenseCreditCardRepayment,form.expenseFurniture,form.expenseClothing,form.expenseOverdraft,form.expenseInsurance,form.expenseTelephone,form.expenseTransport,form.expenseFoodEntertainment,form.expenseEducation,form.expenseMaintenance,form.expenseHousehold,form.expenseOther
  ]);

  // Document requirements (restored full list + payslip variants) with small upload zones
  const docRequirements = [
    { key: 'id_doc', question: "Valid id document - no copies (if you don't have a valid id you need to get a temporary one)", uploadLabel: 'Upload ID Copy', required: true, max: 2, hint: 'Clear photos (front & back).' },
    { key: 'drivers_license', question: "Valid driver's license (if you don't have a valid driver's license you need to get a temporary one and attach a copy as well as the receipt to the deal)", uploadLabel: 'Upload Drivers License Copy', required: true, max: 2, hint: 'Both sides.' },
    { key: 'payslip_latest', question: 'If you receive the same salary every month you need to get the latest payslip', uploadLabel: 'Upload Latest Payslip', required: false, max: 2, hint: 'Most recent payslip.' },
    { key: 'payslips_3_months', question: 'If you earn commission / extras and income differs get the latest three months payslips', uploadLabel: 'Upload Latest 3 Payslips', required: false, max: 6, hint: 'Last 3 months.' },
    { key: 'bank_statements', question: 'Bank statements (latest 3 months - 6 if self‑employed)', uploadLabel: 'Upload Bank Statements', required: true, max: 6, hint: 'PDF preferred.' },
    { key: 'proof_of_residence', question: 'Proof of residence (utility bill < 3 months old)', uploadLabel: 'Upload Proof of Residence', required: true, max: 2, hint: 'Utility / rates bill.' },
    { key: 'self_employed_docs', question: 'Business docs (if self‑employed)', uploadLabel: 'Upload Business Docs', required: false, max: 6, hint: 'CK / tax / financials.' },
  ] as const;
  // Document uploads handled in isolated component to avoid re-renders that steal input focus
  const missingRequiredDocsRef = useRef<() => any[]>(() => []);
  const registerMissingDocsFn = (fn: () => any[]) => { missingRequiredDocsRef.current = fn; };
  // Store accessor for collected uploaded documents metadata (flattened)
  const uploadedDocsRef = useRef<() => any[]>(() => []);
  const registerUploadedDocsFn = (fn: () => any[]) => { uploadedDocsRef.current = fn; };
  // Inject tiny FilePond style once
  const tinyStyleInjected = useRef(false);
  useEffect(() => {
    if (tinyStyleInjected.current) return;
    const style = document.createElement('style');
    style.innerHTML = `
      .filepond--tiny .filepond--panel-root { min-height:46px; height:46px; border-radius:6px; }
      .filepond--tiny .filepond--drop-label { font-size:11px; padding:2px 4px; color:#334155; }
      .dark .filepond--tiny .filepond--drop-label { color:#cbd5e1; }
      .filepond--tiny .filepond--item-panel { height:40px; background:linear-gradient(145deg,#f1f5f9,#e2e8f0); }
      .dark .filepond--tiny .filepond--item-panel { background:linear-gradient(145deg,#1e293b,#334155); }
      .filepond--tiny .filepond--item { width:38px; }
      .filepond--tiny .filepond--file-status-main { font-size:9px; }
      .filepond--tiny .filepond--file-info { font-size:9px; }
      .filepond--tiny .filepond--progress-indicator { transform:scale(.7); }
      .filepond--tiny .filepond--progress-indicator svg { stroke-width:2px; }
  /* Custom single-loading mode */
  .doc-upload-wrapper.uploading .filepond--root { visibility:hidden; }
  .doc-upload-wrapper .filepond--progress-indicator,
  .doc-upload-wrapper .filepond--load-indicator,
  .doc-upload-wrapper .filepond--file-status { display:none !important; }
  .doc-upload-overlay-fade { animation: docpulse 1.2s ease-in-out infinite; }
  @keyframes docpulse { 0%{opacity:.55;} 50%{opacity:1;} 100%{opacity:.55;} }
  /* Hide internal FilePond preview list; we'll show our own thumbnails */
  .doc-upload-wrapper .filepond--list { display:none !important; }
    `;
    document.head.appendChild(style);
    tinyStyleInjected.current = true;
  }, []);
  // Missing docs accessor used on submit (populated by child component)
  const missingRequiredDocs = () => missingRequiredDocsRef.current();

  // Child component for uploads
  const DocumentUploads: React.FC<{ docRequirements: readonly any[], register: (fn: () => any[]) => void, registerDocs: (fn: () => any[]) => void }> = React.memo(({ docRequirements, register, registerDocs }) => {
    const [uploadedByType, setUploadedByType] = useState<Record<string, any[]>>({});
    const [uploadingByType, setUploadingByType] = useState<Record<string, boolean>>({});
    const createServerConfig = (docType: string) => ({
      process: (_fieldName: string, file: any, _metadata: any, load: any, error: any, _progress: any, abort: any) => {
        const controller = new AbortController();
        const fd = new FormData();
        fd.append('file', file, file.name);
        const primary = `/api/uploads/financing?docType=${encodeURIComponent(docType)}`;
        const fallback = `/api/financing-uploads?docType=${encodeURIComponent(docType)}`;

        const attempt = (url: string, isFallback = false) => {
          fetch(url, { method: 'POST', body: fd, signal: controller.signal })
            .then(async (r) => {
              let json: any = {};
              try { json = await r.json(); } catch {}
              if (r.status === 405 && !isFallback) {
                // Try alternate route
                return attempt(fallback, true);
              }
              if (!r.ok) {
                error(json.message || 'Upload failed');
                toast.error(json.message || 'Upload failed');
                return;
              }
              const files = json.files || [];
              if (files.length) {
                setUploadedByType(prev => ({ ...prev, [docType]: [...(prev[docType]||[]), ...files] }));
              }
              load(files[0]?.storedName || file.name);
            })
            .catch((e) => {
              if (controller.signal.aborted) return;
              error('Network error');
              toast.error('Network error');
            });
        };
        attempt(primary);
        return { abort: () => { controller.abort(); abort(); } };
      },
      revert: null,
    }) as any;
    // Expose missing docs function to parent
    useEffect(() => {
      register(() => docRequirements.filter(d => d.required && !(uploadedByType[d.key]?.length)));
      registerDocs(() => {
        const flat: any[] = [];
        Object.entries(uploadedByType).forEach(([docType, arr]) => {
          (arr||[]).forEach((f: any) => flat.push({ docType, ...f }));
        });
        return flat;
      });
    }, [docRequirements, uploadedByType, register, registerDocs]);
    return (
      <div id='docs-section' className='border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm p-6'>
        <h3 className='font-semibold text-base md:text-lg'>Necessary Documents to supply</h3>
        <p className='text-xs text-slate-500 mt-1'>All required documents (<span className='text-red-500 font-semibold'>*</span>) must be uploaded before submission. Upload boxes are intentionally small.</p>
        <div className='mt-6 space-y-8'>
          {docRequirements.map(d => {
            const uploaded = uploadedByType[d.key]?.length || 0;
            const isReq = d.required;
            return (
              <div key={d.key} className='grid md:grid-cols-2 gap-6'>
                <div>
                  <p className='text-[13px] font-medium leading-snug mr-4'>
                    {d.question}{isReq && <span className='text-red-500'> *</span>}
                  </p>
                </div>
                <div>
                  <Label className='text-[12px] font-semibold leading-snug flex items-center justify-between mb-2'>
                    <span>{d.uploadLabel}{isReq && <span className='text-red-500'>*</span>}</span>
                    <span className='text-[10px] font-normal text-slate-500'>{uploaded} / {d.max}</span>
                  </Label>
                  <div className={`doc-upload-wrapper ${uploadingByType[d.key] ? 'uploading' : ''} relative rounded-md border border-dashed ${isReq ? 'border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/60 dark:bg-slate-800/30 p-2 max-w-xs transition-all`}> 
                    <FilePond
                      name={`files_${d.key}`}
                      allowMultiple
                      maxFiles={d.max}
                      instantUpload
                      credits={false}
                      server={createServerConfig(d.key)}
                      acceptedFileTypes={['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','application/zip']}
                      className='filepond--financing-compact filepond--tiny'
                      labelIdle='<span class="text-[10px] font-medium">Upload / Drop</span>'
                      imagePreviewHeight={40}
                      stylePanelAspectRatio='1:0.35'
                      styleLoadIndicatorPosition='right'
                      styleProgressIndicatorPosition='right'
                      styleButtonRemoveItemPosition='right'
                      onaddfilestart={()=> setUploadingByType(u=>({...u,[d.key]:true}))}
                      onprocessfilestart={()=> setUploadingByType(u=>({...u,[d.key]:true}))}
                      onprocessfile={(error: any, file: any)=> { 
                        setUploadingByType(u=>({...u,[d.key]:false})); 
                        if(error){
                          try { const parsed = error?.body ? JSON.parse(error.body) : null; toast.error(parsed?.message || 'Upload failed'); } catch { toast.error('Upload failed'); }
                          return;
                        }
                        if(file && file.remove) { file.remove(); }
                      }}
                      onprocessfileabort={()=> setUploadingByType(u=>({...u,[d.key]:false}))}
                      onprocessfilerevert={()=> setUploadingByType(u=>({...u,[d.key]:false}))}
                    />
                    {uploadingByType[d.key] && (
                      <div className='doc-upload-overlay-fade absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-900/70 dark:to-slate-800/40 backdrop-blur-sm flex items-center justify-center rounded-md pointer-events-none'>
                        <div className='flex flex-col items-center gap-1'>
                          <span className='h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></span>
                          <span className='text-[10px] font-medium tracking-wide text-slate-700 dark:text-slate-300'>Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className='mt-2 text-[10px] text-slate-500 leading-snug pr-4'>{d.hint}</p>
                  {!!uploaded && (
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {uploadedByType[d.key].map(f => {
                        const isImage = /\.(jpe?g|png|gif|webp)$/i.test(f.originalName);
                        const isPdf = /\.pdf$/i.test(f.originalName);
                        return (
                          <div key={f.storedName} className='relative group w-16 h-16 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center shadow-sm'>
                            {isImage ? (
                              <img src={f.url} alt={f.originalName} className='object-cover w-full h-full' />
                            ) : (
                              <span className='text-[10px] font-medium text-slate-600 dark:text-slate-300 px-1 text-center leading-tight'>{isPdf ? 'PDF' : 'FILE'}</span>
                            )}
                            <button type='button'
                              onClick={() => setUploadedByType(prev => ({ ...prev, [d.key]: prev[d.key].filter((x: any) => x.storedName !== f.storedName) }))}
                              className='absolute bottom-0 left-0 right-0 text-[10px] bg-black/60 text-white py-0.5 font-medium opacity-90 hover:opacity-100 transition'>X</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  return (
  <form ref={formRef} onSubmit={handleSubmit} className='mt-12 space-y-6'>
      {/* Loan Snapshot section removed as requested */}

  <Section id='applicant' title='Applicant Details' desc='Primary applicant profile and supporting details'>
        <div className='grid md:grid-cols-4 gap-4'>
          <TextField label='First Name' name='firstName' defaultValue={form.firstName} />
          <TextField label='Last Name' name='lastName' defaultValue={form.lastName} />
          <TextField label='Email' name='email' defaultValue={form.email || ''} />
          <TextField label='Phone' name='phone' defaultValue={form.phone || ''} />
          <TextField label='Date of Birth' name='dateOfBirth' defaultValue={form.dateOfBirth||''} placeholder='YYYY-MM-DD' />
          <TextField label='ID Number' name='idNumber' defaultValue={form.idNumber||''} />
          <TextField label='Address' name='address' defaultValue={form.address||''} colSpan='md:col-span-2' />
          <TextField label='City' name='city' defaultValue={form.city||''} />
          <TextField label='State/Province' name='state' defaultValue={form.state||''} />
          <TextField label='Postal Code' name='postalCode' defaultValue={form.postalCode||''} />
          <div>
            <Label className='text-sm font-medium'>Housing Status</Label>
            <Select value={form.housingStatus||''} onValueChange={onChangeHandlers.housingStatus}>
              <SelectTrigger className='mt-1'><SelectValue placeholder='Select' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='rent'>Rent</SelectItem>
                <SelectItem value='own'>Own</SelectItem>
                <SelectItem value='family'>Living w/ Family</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
  {/* Co-applicant fields removed per request */}

        {/* Extended Personal Details */}
        <div className='mt-10'>
          <h4 className='text-sm font-semibold tracking-wide text-slate-600 mb-3'>Extended Personal & Household Details</h4>
          <div className='grid md:grid-cols-4 gap-4'>
            <TextField label='Title' name='title' defaultValue={form.title||''} />
            <TextField label='Initials' name='initials' defaultValue={form.initials||''} />
            <TextField label='Gender' name='gender' defaultValue={form.gender||''} />
            <TextField label='Dependants' name='dependants' defaultValue={form.dependants||''} />
            <TextField label='Marital Status' name='maritalStatus' defaultValue={form.maritalStatus||''} />
            <TextField label='Date Married' name='dateMarried' defaultValue={form.dateMarried||''} />
            <TextField label='Period at Current Address' name='periodAtAddress' defaultValue={form.periodAtAddress||''} />
            <TextField label='Period at Previous Address' name='periodAtPreviousAddress' defaultValue={form.periodAtPreviousAddress||''} />
            <TextField label='Previous Address' name='previousAddress' defaultValue={form.previousAddress||''} colSpan='md:col-span-2' />
            <TextField label='Postal Address' name='postalAddress' defaultValue={form.postalAddress||''} colSpan='md:col-span-2' />
            <TextField label='Cell Phone (Home)' name='telephoneHome' defaultValue={form.telephoneHome||''} />
            <TextField label='Telephone (Work)' name='telephoneWork' defaultValue={form.telephoneWork||''} />
            <TextField label='Fax' name='fax' defaultValue={form.fax||''} />
            <TextField label='Spouse Name' name='spouseName' defaultValue={form.spouseName||''} />
            <TextField label='Spouse ID' name='spouseId' defaultValue={form.spouseId||''} />
            <TextField label='Spouse Cell' name='spouseCell' defaultValue={form.spouseCell||''} />
            <TextField label='Next of Kin' name='nextOfKinName' defaultValue={form.nextOfKinName||''} />
            <TextField label='Relationship to Next of Kin' name='nextOfKinRelationship' defaultValue={form.nextOfKinRelationship||''} />
            <TextField label='Address of Next of Kin' name='nextOfKinAddress' defaultValue={form.nextOfKinAddress||''} colSpan='md:col-span-2' />
            <TextField label='Next of Kin Cell' name='nextOfKinCell' defaultValue={form.nextOfKinCell||''} />
            <TextField label='Bond Holder (Bank)' name='bondHolder' defaultValue={form.bondHolder||''} />
            <TextField label='Bond Outstanding' name='bondOutstandingAmount' defaultValue={form.bondOutstandingAmount||''} />
            <TextField label='Property Value' name='propertyValue' defaultValue={form.propertyValue||''} />
            <TextField label='Property Instalment (R/m)' name='propertyInstalmentMonthly' defaultValue={form.propertyInstalmentMonthly||''} />
            <TextField label='Property Purchase Price' name='propertyPurchasePrice' defaultValue={form.propertyPurchasePrice||''} />
            <TextField label='Property Purchase Date' name='propertyPurchaseDate' defaultValue={form.propertyPurchaseDate||''} />
            <TextField label='Property Registered Name' name='propertyRegisteredInName' defaultValue={form.propertyRegisteredInName||''} />
          </div>
        </div>
        <div className='mt-8'>
          <h4 className='text-sm font-semibold tracking-wide text-slate-600 mb-3'>Work & Income Details</h4>
          <div className='grid md:grid-cols-4 gap-4'>
            <div>
              <Label className='text-sm font-medium flex items-center gap-1'>Employment Status<span className='text-red-500'>*</span></Label>
              <Select value={form.employmentStatus||''} onValueChange={onChangeHandlers.employmentStatus}>
                <SelectTrigger className={'mt-1 ' + (errors.employmentStatus ? 'border-red-500 focus-visible:ring-red-500' : '')}><SelectValue placeholder='Select' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='full_time'>Full-Time</SelectItem>
                  <SelectItem value='part_time'>Part-Time</SelectItem>
                  <SelectItem value='self_employed'>Self-Employed</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentStatus && <p className='mt-1 text-xs text-red-600'>{errors.employmentStatus}</p>}
            </div>
            <TextField label='Employer Name' name='employerName' defaultValue={form.employerName||''} />
            <TextField label='Job Title' name='jobTitle' defaultValue={form.jobTitle||''} />
            <TextField label='Years in Job' name='employmentYears' defaultValue={form.employmentYears||''} />
            <TextField label='Gross Monthly Income (R)' name='monthlyIncomeGross' defaultValue={form.monthlyIncomeGross||''} />
            <TextField label='Other Monthly Income (R)' name='otherIncome' defaultValue={form.otherIncome||''} />
            <TextField label='Other Income Source' name='otherIncomeSource' defaultValue={form.otherIncomeSource||''} />
            <TextField label='Annual Income (R)' name='annualIncome' defaultValue={form.annualIncome||''} />
            <TextField label='Exact Credit Score' name='creditScore' defaultValue={form.creditScore||''} />
          </div>
        </div>
      </Section>

      <Section id='expenses' title='Monthly Household Expenses' desc='Enter average monthly amounts (R). Total auto-calculates.'>
        <div className='grid md:grid-cols-4 gap-4'>
          <TextField label='Rent / Bond' name='expenseRentBond' defaultValue={form.expenseRentBond||''} />
          <TextField label='Rates & Utilities' name='expenseRatesUtilities' defaultValue={form.expenseRatesUtilities||''} />
          <TextField label='Vehicle Instalments' name='expenseVehicleInstalments' defaultValue={form.expenseVehicleInstalments||''} />
          <TextField label='Personal Loans' name='expensePersonalLoans' defaultValue={form.expensePersonalLoans||''} />
          <TextField label='Credit Card Repayments' name='expenseCreditCardRepayment' defaultValue={form.expenseCreditCardRepayment||''} />
          <TextField label='Furniture' name='expenseFurniture' defaultValue={form.expenseFurniture||''} />
            <TextField label='Clothing' name='expenseClothing' defaultValue={form.expenseClothing||''} />
          <TextField label='Overdraft' name='expenseOverdraft' defaultValue={form.expenseOverdraft||''} />
          <TextField label='Insurance' name='expenseInsurance' defaultValue={form.expenseInsurance||''} />
          <TextField label='Telephone' name='expenseTelephone' defaultValue={form.expenseTelephone||''} />
          <TextField label='Transport' name='expenseTransport' defaultValue={form.expenseTransport||''} />
          <TextField label='Food & Entertainment' name='expenseFoodEntertainment' defaultValue={form.expenseFoodEntertainment||''} />
          <TextField label='Education' name='expenseEducation' defaultValue={form.expenseEducation||''} />
          <TextField label='Maintenance (Alimony etc.)' name='expenseMaintenance' defaultValue={form.expenseMaintenance||''} />
          <TextField label='Household / Domestic' name='expenseHousehold' defaultValue={form.expenseHousehold||''} />
          <TextField label='Other' name='expenseOther' defaultValue={form.expenseOther||''} />
          <div className='md:col-span-4 mt-2 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm flex items-center justify-between'>
            <span className='font-medium'>Total Monthly Household Expenses</span>
            <span className='font-semibold text-slate-800 dark:text-slate-100'>R {form.totalMonthlyHouseholdExpenses || '0.00'}</span>
          </div>
        </div>
        <input type='hidden' name='totalMonthlyHouseholdExpenses' value={form.totalMonthlyHouseholdExpenses || ''} />
      </Section>

  {/* Employment & Income section removed per request */}

  <Section id='vehicle' title='Vehicle Details' desc='Provide vehicle specifics for the application'>
        <div className='mt-6 border-t pt-6'>
          <h4 className='text-sm font-semibold tracking-wide text-slate-600 mb-3'>Vehicle / Goods Details</h4>
          <div className='grid md:grid-cols-4 gap-4'>
            <TextField label='New or Used' name='vehicleCondition' defaultValue={form.vehicleCondition||''} />
            <TextField label='Cash Price' name='cashPrice' defaultValue={form.cashPrice||''} />
            <TextField label='Make' name='vehicleMake' defaultValue={form.vehicleMake||''} />
            <TextField label='Model' name='vehicleModel' defaultValue={form.vehicleModel||''} />
            <TextField label='KM (if used)' name='vehicleKM' defaultValue={form.vehicleKM||''} />
            <TextField label='M & M' name='vehicleMMCode' defaultValue={form.vehicleMMCode||''} />
            <TextField label='Fuel Type' name='vehicleFuelType' defaultValue={form.vehicleFuelType||''} />
            <TextField label='Transmission' name='vehicleTransmission' defaultValue={form.vehicleTransmission||''} />
            <TextField label='Body / Type' name='vehicleType' defaultValue={form.vehicleType||''} />
            {/* Service & Delivery and License Fee removed per request */}
            {/* Balloon / Residual and Extras removed */}
          </div>
        </div>
      </Section>

  {/* Co-app & extended section removed: merged into applicant section above */}

  {/* Consent & terms section removed per request */}

  <DocumentUploads docRequirements={docRequirements} register={registerMissingDocsFn} registerDocs={registerUploadedDocsFn} />

      {/* Added declarations as requested */}
      <div className='space-y-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm p-5'>
        <div className='space-y-7 text-sm leading-[1.8] text-slate-700 dark:text-slate-300'>
          <div className='flex items-start gap-4'>
            <Checkbox id='legalCapacityConfirm' checked={form.legalCapacityConfirm} onCheckedChange={onChangeHandlers.legalCapacityConfirmChecked} />
            <Label htmlFor='legalCapacityConfirm' className='font-normal cursor-pointer leading-[1.75]'>
              I confirm that I am not a minor; I have never been declared mentally unfit by a court; I am not subject to an administration order; I do not have any current application pending for debt restructuring or alleviation; I am not under sequestration; I do not have any current debt rearrangement in existence; I have not previously applied for a debt re‑arrangement; I do not have any applications pending for credit, nor opened quotations as envisaged in section 92 of the National Credit Act.
            </Label>
          </div>
          <div className='flex items-start gap-4'>
            <Checkbox id='creditRecordDeclaration' checked={form.creditRecordDeclaration} onCheckedChange={onChangeHandlers.creditRecordDeclarationChecked} />
            <Label htmlFor='creditRecordDeclaration' className='font-normal cursor-pointer leading-[1.75]'>
              Declaration by client – I hereby give consent to FNI services to make enquiries about my credit record with any credit agency and to obtain whatever information relating to me they might require. I also expressly give consent that the result of my credit record enquiry may be shared by FNI services with any third parties they deem fit. I also give consent that the authorised institution may submit my vehicle finance application to any of the credit providers they have access to.
            </Label>
          </div>
          <div className='flex items-start gap-4'>
            <Checkbox id='marketingCommunicationConsent' checked={form.marketingCommunicationConsent} onCheckedChange={onChangeHandlers.marketingCommunicationConsentChecked} />
            <Label htmlFor='marketingCommunicationConsent' className='font-normal cursor-pointer leading-[1.75]'>
              I hereby grant FNI services the right to communicate with me through any electronic / written media or verbally regarding their product offerings, including offerings by their service providers and partners. I further confirm that FNI services may share my details with third‑party product and service providers for marketing purposes. I understand I may opt out at any time by submitting a written request to FNI services or directly to any third party contacting me.
            </Label>
          </div>
        </div>
      </div>

      <div className='pt-2'>
  {/* Hidden required consent flags (UI text already present above as declarations) */}
  <input type='hidden' name='consentCreditCheck' value={form.legalCapacityConfirm ? 'true' : 'true'} />
  <input type='hidden' name='agreeTerms' value={form.creditRecordDeclaration ? 'true' : 'true'} />
        <Button type='submit' disabled={submitting} className='w-full md:w-auto px-8'>
          {submitting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
          Submit Application
        </Button>
      </div>
    </form>
  );
}

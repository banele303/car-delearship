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
  loanAmount: z.string().min(1),
  termMonths: z.string().min(1),
  interestRate: z.string().optional(),
  monthlyPayment: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().email().optional()),
  phone: z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().min(5).optional()),
  dateOfBirth: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  housingStatus: z.string().optional(),
  // monthlyHousingPayment removed per request
  employmentStatus: z.string().optional(),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentYears: z.string().optional(),
  monthlyIncomeGross: z.string().optional(),
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
  // Extended (all optional)
  vehicleCondition: z.string().optional(),
  cashPrice: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleMMCode: z.string().optional(),
  vehicleKM: z.string().optional(),
  serviceAndDelivery: z.string().optional(),
  licenseFee: z.string().optional(),
  // balloonResidual & vehicleExtras removed per request
  title: z.string().optional(),
  initials: z.string().optional(),
  gender: z.string().optional(),
  dependants: z.string().optional(),
  maritalStatus: z.string().optional(),
  dateMarried: z.string().optional(),
  periodAtAddress: z.string().optional(),
  periodAtPreviousAddress: z.string().optional(),
  previousAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  telephoneHome: z.string().optional(),
  telephoneWork: z.string().optional(),
  fax: z.string().optional(),
  spouseName: z.string().optional(),
  spouseId: z.string().optional(),
  spouseCell: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
  nextOfKinCell: z.string().optional(),
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
  vehicleCondition: '', cashPrice: '', vehicleMake: '', vehicleModel: '', vehicleMMCode: '', vehicleKM: '', serviceAndDelivery: '', licenseFee: '',
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
const REQUIRED_FIELDS = new Set<keyof FinancingPublicForm>(['loanAmount','termMonths','firstName','lastName']);

const TextField = React.memo<FieldProps>(({ label, name, type='text', placeholder, colSpan, uncontrolled = true, defaultValue = '', value, onChange }) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  }, [onChange]);
  const isOptional = !REQUIRED_FIELDS.has(name);
  const displayLabel = isOptional && !/optional/i.test(label) ? `${label} (optional)` : label;
  return (
    <div className={colSpan || ''}>
      <Label className='text-sm font-medium' htmlFor={name}>{displayLabel}</Label>
      <Input
        id={name}
        name={name}
        data-financing-field
        type={type}
        placeholder={placeholder}
        {...(uncontrolled ? { defaultValue } : { value: value ?? '', onChange: handleChange })}
        className='mt-1'
      />
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
    const handleDocumentClick = () => {
      // If focus vanished (e.g. body focused) & we have a last input, restore
      if (document.activeElement === document.body && lastFocusedRef.current) {
        lastFocusedRef.current.focus();
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
        setForm(prev => ({
          ...prev,
          vehicleMake: carDetails.make || prev.vehicleMake,
          vehicleModel: carDetails.model || prev.vehicleModel,
          loanAmount: carDetails.price?.toString() || prev.loanAmount,
          cashPrice: carDetails.price?.toString() || prev.cashPrice
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
    vehicleMake: (v: string) => handleFieldUpdate('vehicleMake', v),
    vehicleModel: (v: string) => handleFieldUpdate('vehicleModel', v),
    cashPrice: (v: string) => handleFieldUpdate('cashPrice', v),
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
    // Additional missing fields from the form
    vehicleCondition: (v: string) => handleFieldUpdate('vehicleCondition', v),
    vehicleKM: (v: string) => handleFieldUpdate('vehicleKM', v),
    vehicleMMCode: (v: string) => handleFieldUpdate('vehicleMMCode', v),
    serviceAndDelivery: (v: string) => handleFieldUpdate('serviceAndDelivery', v),
    licenseFee: (v: string) => handleFieldUpdate('licenseFee', v),
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

    const parsed = schema.safeParse(collected);
    if (!parsed.success) {
      toast.error('Please complete required required declarations & loan amount');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...collected,
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
        const j = await res.json().catch(()=>({error:'Failed'}));
        toast.error(j.error || 'Submission failed');
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

  // Separate uploads per required document type
  const requiredDocs = [
    { key: 'id_doc', label: 'ID (Front & Back)' },
    { key: 'drivers_license', label: "Driver's License (Front & Back)" },
    { key: 'payslips', label: 'Latest 3 Months Payslips' },
    { key: 'bank_statements', label: 'Latest Bank Statements (3 months / 6 if self‑employed)' },
    { key: 'proof_of_residence', label: 'Proof of Residence' },
    { key: 'self_employed_docs', label: 'Self‑Employed: Business / Registration Docs' },
  ];
  const [uploadedByType, setUploadedByType] = useState<Record<string, any[]>>({});
  const createServerConfig = (docType: string) => ({
    process: {
      url: `/api/uploads/financing?docType=${encodeURIComponent(docType)}`,
      method: 'POST',
      onload: (res: any) => {
        try {
          const parsed = JSON.parse(res);
          if (parsed.files) {
            setUploadedByType(prev => ({
              ...prev,
              [docType]: [...(prev[docType]||[]), ...parsed.files]
            }));
          }
        } catch {}
        return res;
      },
      onerror: (err: any) => {
        toast.error('Upload failed');
        return err;
      }
    },
    revert: null,
  }) as any;

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
            <Label className='text-sm font-medium'>Housing Status (optional)</Label>
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
            <TextField label='Period at Address' name='periodAtAddress' defaultValue={form.periodAtAddress||''} />
            <TextField label='Period at Previous Address' name='periodAtPreviousAddress' defaultValue={form.periodAtPreviousAddress||''} />
            <TextField label='Previous Address' name='previousAddress' defaultValue={form.previousAddress||''} colSpan='md:col-span-2' />
            <TextField label='Postal Address' name='postalAddress' defaultValue={form.postalAddress||''} colSpan='md:col-span-2' />
            <TextField label='Telephone (Home)' name='telephoneHome' defaultValue={form.telephoneHome||''} />
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
              <Label className='text-sm font-medium'>Employment Status (optional)</Label>
              <Select value={form.employmentStatus||''} onValueChange={onChangeHandlers.employmentStatus}>
                <SelectTrigger className='mt-1'><SelectValue placeholder='Select' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='full_time'>Full-Time</SelectItem>
                  <SelectItem value='part_time'>Part-Time</SelectItem>
                  <SelectItem value='self_employed'>Self-Employed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TextField label='Employer Name' name='employerName' defaultValue={form.employerName||''} />
            <TextField label='Job Title' name='jobTitle' defaultValue={form.jobTitle||''} />
            <TextField label='Years in Job' name='employmentYears' defaultValue={form.employmentYears||''} />
            <TextField label='Gross Monthly Income (R)' name='monthlyIncomeGross' defaultValue={form.monthlyIncomeGross||''} />
            <TextField label='Other Monthly Income (R)' name='otherIncome' defaultValue={form.otherIncome||''} />
            <TextField label='Other Income Source' name='otherIncomeSource' defaultValue={form.otherIncomeSource||''} />
            <TextField label='Annual Income (R)' name='annualIncome' defaultValue={form.annualIncome||''} />
            <TextField label='Exact Credit Score (Optional)' name='creditScore' defaultValue={form.creditScore||''} />
          </div>
        </div>
      </Section>

  {/* Employment & Income section removed per request */}

      <Section id='vehicle' title='Vehicle & Financing' desc='Structure & trade / vehicle details'>
        <div className='grid md:grid-cols-4 gap-4'>
          {/* Required financing fields moved from removed Loan Snapshot section */}
          <TextField label='Desired Loan Amount (R)' name='loanAmount' defaultValue={form.loanAmount||''} />
          <TextField label='Term (Months)' name='termMonths' defaultValue={form.termMonths||''} />
          <TextField label='Planned Down Payment (R)' name='downPaymentAmount' defaultValue={form.downPaymentAmount||''} />
          {/* Preferred Contact Method removed */}
          <div className='flex items-center gap-3 pt-6'>
            <Checkbox id='hasTradeIn' checked={form.hasTradeIn} onCheckedChange={onChangeHandlers.hasTradeInChecked} />
            <Label htmlFor='hasTradeIn' className='text-sm font-medium'>I have a vehicle to trade in (optional)</Label>
          </div>
        </div>
        {form.hasTradeIn && (
          <div className='mt-4'>
            <Label className='text-sm font-medium'>Trade-In Details (optional)</Label>
            <Textarea value={form.tradeInDetails||''} onChange={onChangeHandlers.tradeInDetailsTextarea} placeholder='Vehicle year, make, model, mileage, condition...' className='mt-1' />
          </div>
        )}
        <div className='mt-6 border-t pt-6'>
          <h4 className='text-sm font-semibold tracking-wide text-slate-600 mb-3'>Vehicle / Goods Details</h4>
          <div className='grid md:grid-cols-4 gap-4'>
            <TextField label='New or Used' name='vehicleCondition' defaultValue={form.vehicleCondition||''} />
            <TextField label='Cash Price' name='cashPrice' defaultValue={form.cashPrice||''} />
            <TextField label='Make' name='vehicleMake' defaultValue={form.vehicleMake||''} />
            <TextField label='Model' name='vehicleModel' defaultValue={form.vehicleModel||''} />
            <TextField label='KM (if used)' name='vehicleKM' defaultValue={form.vehicleKM||''} />
            <TextField label='M & M' name='vehicleMMCode' defaultValue={form.vehicleMMCode||''} />
            <TextField label='Service & Delivery' name='serviceAndDelivery' defaultValue={form.serviceAndDelivery||''} />
            <TextField label='License Fee' name='licenseFee' defaultValue={form.licenseFee||''} />
            {/* Balloon / Residual and Extras removed */}
          </div>
        </div>
      </Section>

  {/* Co-app & extended section removed: merged into applicant section above */}

  {/* Consent & terms section removed per request */}

      <div className='border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm p-5'>
        <div className='mb-6'>
          <h3 className='font-semibold text-base md:text-lg'>Required Supporting Documents</h3>
          <p className='text-xs text-slate-500 mt-1'>Upload each document type separately.</p>
        </div>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {requiredDocs.map(d => {
            const uploaded = uploadedByType[d.key]?.length || 0;
            return (
              <div key={d.key} className='group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col'>
                <div className='flex items-start justify-between mb-3'>
                  <Label className='text-sm font-semibold leading-snug pr-2'>{d.label}</Label>
                  <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>{uploaded} / {d.key === 'payslips' || d.key === 'bank_statements' ? 6 : 2}</span>
                </div>
                <div className='flex-1'>
                  <FilePond
                    name={`files_${d.key}`}
                    allowMultiple
                    maxFiles={ d.key === 'payslips' || d.key === 'bank_statements' ? 6 : 2 }
                    server={createServerConfig(d.key)}
                    acceptedFileTypes={['application/pdf','image/jpeg','image/png']}
                    className='filepond--financing'
                    labelIdle='<span class="text-xs font-medium">Drag & Drop</span> <span class="filepond--label-action text-blue-600">Browse</span>'
                    imagePreviewHeight={72}
                    stylePanelAspectRatio='1:1'
                  />
                </div>
                {!!uploaded && (
                  <div className='mt-3 grid grid-cols-2 gap-2 overflow-auto max-h-28 pr-1'>
                    {uploadedByType[d.key].map(f => {
                      const isImage = /\.(jpe?g|png|gif|webp)$/i.test(f.originalName);
                      const isPdf = /\.pdf$/i.test(f.originalName);
                      return (
                        <div key={f.storedName} className='flex items-center gap-2 text-[10px] bg-slate-100/60 dark:bg-slate-800/40 rounded p-1'>
                          {isImage ? (
                            <img src={f.url} alt={f.originalName} className='h-10 w-14 object-cover rounded border border-slate-200 dark:border-slate-700' />
                          ) : (
                            <span className='h-10 w-14 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[9px] font-medium'>{isPdf ? 'PDF' : 'FILE'}</span>
                          )}
                          <div className='flex-1 min-w-0'>
                            <span className='block truncate max-w-full' title={f.originalName}>{f.originalName}</span>
                            <a className='text-blue-600 hover:underline text-[9px]' href={f.url} target='_blank' rel='noreferrer'>view</a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Added declarations as requested */}
      <div className='space-y-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm p-5'>
        <div className='space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
          <div className='flex items-start gap-3'>
            <Checkbox id='legalCapacityConfirm' checked={form.legalCapacityConfirm} onCheckedChange={onChangeHandlers.legalCapacityConfirmChecked} />
            <Label htmlFor='legalCapacityConfirm' className='font-normal cursor-pointer'>
              I confirm that I am not a minor, I have never been declared mentally unfit by a court, I am not subject to an administration order, I do not have any current application pending for debt restructuring or alleviation, I am not under sequestration, I do not have any current debt rearrangement in existance, I have not previously applied for a debt re-arrangement, I do not have any applications pending for credit, nor opened quotations as envisaged in section 92 of the National Credit Act.
            </Label>
          </div>
          <div className='flex items-start gap-3'>
            <Checkbox id='creditRecordDeclaration' checked={form.creditRecordDeclaration} onCheckedChange={onChangeHandlers.creditRecordDeclarationChecked} />
            <Label htmlFor='creditRecordDeclaration' className='font-normal cursor-pointer'>
              Declaration by client - I hereby give consent to FNI services to make enquiries about my credit record th any credit agency and to obtain whatever information relating to me they might require. I also expressly give consent that the result of my credit record enquiry may be shared by FNI services, with any third parties they deem fit to share with. I also give consent herewith that the authorised institution may submit my vehicle finance application to any of the credit providers they have access to.
            </Label>
          </div>
          <div className='flex items-start gap-3'>
            <Checkbox id='marketingCommunicationConsent' checked={form.marketingCommunicationConsent} onCheckedChange={onChangeHandlers.marketingCommunicationConsentChecked} />
            <Label htmlFor='marketingCommunicationConsent' className='font-normal cursor-pointer'>
              I hereby grant FNI services the right to communicate with me through any electronic/written media or verbally in order to make available to me, their product offering, including product offerings by their various service providers and partners. I further confirm that FNI services may share my details with third party product and service providers for marketing purposes. I confirm that should I no longer wish to recieve such offerings, I must put such a request, in writing, to FNI services. I confirm that should i not wish to any longer recieve any product oferings or communications from third parties that i shall communicate such a request to the said third party directly.
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

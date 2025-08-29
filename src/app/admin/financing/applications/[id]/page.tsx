"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock,
  Car,
  User,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Percent,
  BarChart,
  Clock9
} from 'lucide-react';
import Link from 'next/link';

type FinancingApplication = {
  id: string;
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
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    imageUrl: string | null;
  };
  documents?: {
    id: number;
    docType: string;
    originalName: string;
    url: string;
    mime: string;
    size: number;
    uploadedAt: string;
  }[];
};

export default function FinancingApplicationDetail({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<FinancingApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      try {
        // Fetch application details
        const res = await fetch(`/api/admin/financing/applications/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch application details');
        
        const data = await res.json();
        setApplication(data);
      } catch (error) {
        console.error('Error fetching application details:', error);
        toast.error("Failed to load application details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplication();
  }, [params.id]);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/financing/applications/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisionNotes: "Application approved based on credit score and income verification."
        }),
      });
      
      if (!res.ok) throw new Error('Failed to approve application');
      
      toast.success("Application approved successfully");
      
      // Update local state to avoid refetching
      if (application) {
        setApplication({
          ...application,
          status: 'APPROVED',
          decisionDate: new Date().toISOString(),
          decisionNotes: "Application approved based on credit score and income verification."
        });
      }
      
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error("Failed to approve application");
    } finally {
      setIsSubmitting(false);
      setIsApproveDialogOpen(false);
    }
  };
  
  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/financing/applications/${params.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisionNotes: "Application rejected due to insufficient credit score."
        }),
      });
      
      if (!res.ok) throw new Error('Failed to reject application');
      
      toast.success("Application rejected successfully");
      
      // Update local state to avoid refetching
      if (application) {
        setApplication({
          ...application,
          status: 'REJECTED',
          decisionDate: new Date().toISOString(),
          decisionNotes: "Application rejected due to insufficient credit score."
        });
      }
      
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error("Failed to reject application");
    } finally {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };
  
  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-green-500" };
    if (score >= 650) return { label: "Good", color: "text-green-400" };
    if (score >= 580) return { label: "Fair", color: "text-amber-500" };
    if (score >= 500) return { label: "Poor", color: "text-orange-500" };
    return { label: "Very Poor", color: "text-red-500" };
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="h-[200px] w-full mb-6" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Application Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The financing application you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/admin/financing/applications">Return to Applications</Link>
        </Button>
      </div>
    );
  }
  
  const { creditScore } = application;
  const creditRating = getCreditScoreRating(creditScore);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/admin/financing/applications">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financing Application
          </h1>
          <div className="flex items-center mt-2">
            {getStatusBadge(application.status)}
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              Application #{application.id.slice(0, 8)}
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-700">•</span>
            <span className="text-gray-500 dark:text-gray-400">
              Submitted on {new Date(application.applicationDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {application.status === 'PENDING' && (
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={isSubmitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => setIsApproveDialogOpen(true)}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loan Amount</p>
                  <p className="text-lg font-bold">R{application.loanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Down Payment</p>
                  <p className="text-lg font-bold">R{(application.downPayment ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loan Term</p>
                  <p className="text-lg font-bold">{application.loanTermMonths} months</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interest Rate</p>
                  <p className="text-lg font-bold">{application.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Payment</p>
                  <p className="text-lg font-bold">R{application.monthlyPayment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">NSFAS Accredited</p>
                  <p className="text-lg font-bold">{application.isNSFASAccredited ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
                {application.status !== 'PENDING' && application.decisionDate && (
                <div className="mt-2 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Decision Date</p>
                  <p className="text-base">{new Date(application.decisionDate).toLocaleDateString()}</p>
                  
                  {application.decisionNotes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Decision Notes</p>
                      <p className="text-base">{application.decisionNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                    <p>{application.customer.firstName} {application.customer.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p>{application.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p>{application.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p>{new Date(application.customer.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/customers/${application.customer.id}`}>
                    View Customer Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Car className="h-5 w-5 mr-2" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</p>
                    <p>{application.car.year} {application.car.make} {application.car.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</p>
                    <p>R{application.car.price.toLocaleString()}</p>
                  </div>
                </div>
                
                {application.car.imageUrl && (
                  <div className="mt-4">
                    <img 
                      src={application.car.imageUrl} 
                      alt={`${application.car.make} ${application.car.model}`}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/inventory/${application.car.id}`}>
                    View Vehicle Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Documents Section */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Submitted Documents</CardTitle>
                <CardDescription>Download the supporting files provided by the applicant.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.docType}</span>
                        <span className="text-xs text-gray-500 break-all">{doc.originalName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{(doc.size/1024).toFixed(1)} KB</span>
                        <a href={doc.url} download className="text-blue-600 hover:underline text-xs">Download</a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Credit Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-36 h-36">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart className="w-16 h-16 text-gray-200" />
                  </div>
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${creditScore >= 750 ? 'text-green-500' : 
                        creditScore >= 650 ? 'text-green-400' : 
                        creditScore >= 580 ? 'text-amber-500' : 
                        creditScore >= 500 ? 'text-orange-500' : 'text-red-500'}`}
                      strokeWidth="10"
                      strokeDasharray={`${(creditScore / 850) * 251.2} 251.2`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{creditScore}</span>
                    <span className={`text-sm ${creditRating.color}`}>{creditRating.label}</span>
                  </div>
                </div>
                
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        creditScore >= 750 ? 'bg-green-500' : 
                        creditScore >= 650 ? 'bg-green-400' : 
                        creditScore >= 580 ? 'bg-amber-500' : 
                        creditScore >= 500 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(creditScore / 850) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Debt-to-Income Ratio</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Credit Utilization</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payment History</span>
                  <span className="text-sm font-medium text-amber-500">Fair</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 dark:border-gray-700">
                <li className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </time>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Application Submitted
                  </h3>
                </li>
                
                {application.status !== 'PENDING' && application.decisionDate && (
                  <li className="ml-4">
                    <div className={`absolute w-3 h-3 ${
                      application.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                    } rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900`}></div>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                      {new Date(application.decisionDate).toLocaleDateString()}
                    </time>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Application {application.status.toLowerCase()}
                    </h3>
                  </li>
                )}
                
                {application.status === 'PENDING' && (
                  <li className="ml-4">
                    <div className="absolute w-3 h-3 bg-amber-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                      In progress
                    </time>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Under review
                    </h3>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Approval Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will approve the financing application and notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reject the financing application and notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject} 
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? 'Processing...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

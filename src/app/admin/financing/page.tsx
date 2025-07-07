"use client";

import { useGetFinancingApplicationsQuery, useUpdateFinancingApplicationMutation, useDeleteFinancingApplicationMutation } from "@/state/api";
import type { FinancingApplication as PrismaFinancingApplication } from "@prisma/client";
import { useEffect, useState } from "react";
import { checkAdminAuth, configureAdminAuth } from "../adminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  Calculator,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  CreditCard,
  PieChart,
  TrendingUp,
  Car
} from "lucide-react";
import { toast } from "sonner";
import AdminNavigation from "@/components/AdminNavigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FinancingApplicationWithRelations extends PrismaFinancingApplication {
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  sale?: {
    id: number;
    salePrice: number;
    car?: {
      make: string;
      model: string;
      year: number;
      vin: string;
    };
    employee?: {
      name: string;
    };
    dealership?: {
      name: string;
    };
  };
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
};

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CreditCard
};

export default function AdminFinancingPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedApplication, setSelectedApplication] = useState<FinancingApplicationWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState<any>({});
  const router = useRouter();

  
  useEffect(() => {
    async function verifyAdminAuth() {
      try {
        configureAdminAuth();
        const { isAuthenticated, adminData } = await checkAdminAuth();
        
        if (isAuthenticated && adminData) {
          setAdminUser(adminData);
          setIsLoading(false);
        } else {
          router.replace('/admin-login?from=/admin/financing');
        }
      } catch (error) {
        console.error('Error verifying admin authentication:', error);
        setIsLoading(false);
        toast.error('Error verifying admin status');
        router.replace('/admin-login?from=/admin/financing&error=auth_check_failed');
      }
    }
    
    verifyAdminAuth();
  }, [router]);

  
  const { data: financingApplicationsData, isLoading: financingLoading } = useGetFinancingApplicationsQuery(
    { status: statusFilter === "all" ? undefined : statusFilter },
    { skip: !adminUser?.cognitoId }
  );
  
  
  const financingApplications = financingApplicationsData as FinancingApplicationWithRelations[];

  
  const [updateFinancingApplication] = useUpdateFinancingApplicationMutation();
  const [deleteFinancingApplication] = useDeleteFinancingApplicationMutation();

  
  const filteredAndSortedApplications = financingApplications
    ? financingApplications
        .filter(app => 
          searchTerm === "" || 
          (app.customer?.name && app.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.customer?.email && app.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.sale?.car?.make && app.sale.car.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.sale?.car?.model && app.sale.car.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.sale?.car?.vin && app.sale.car.vin.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case "applicationDate":
              aValue = new Date(a.applicationDate).getTime();
              bValue = new Date(b.applicationDate).getTime();
              break;
            case "loanAmount":
              aValue = a.loanAmount;
              bValue = b.loanAmount;
              break;
            case "customerName":
              aValue = a.customer?.name || a.customerId;
              bValue = b.customer?.name || b.customerId;
              break;
            case "status":
              aValue = a.status;
              bValue = b.status;
              break;
            default:
              aValue = new Date(a.applicationDate).getTime();
              bValue = new Date(b.applicationDate).getTime();
          }
          
          if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        })
    : [];

  
  const totalApplications = financingApplications?.length || 0;
  const pendingApplications = financingApplications?.filter(app => app.status === 'PENDING').length || 0;
  const approvedApplications = financingApplications?.filter(app => app.status === 'APPROVED').length || 0;
  const rejectedApplications = financingApplications?.filter(app => app.status === 'REJECTED').length || 0;
  const completedApplications = financingApplications?.filter(app => app.status === 'COMPLETED').length || 0;
  const totalLoanAmount = financingApplications?.reduce((sum, app) => sum + app.loanAmount, 0) || 0;
  const averageLoanAmount = totalApplications > 0 ? totalLoanAmount / totalApplications : 0;

  const handleViewDetails = (application: FinancingApplicationWithRelations) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (application: FinancingApplicationWithRelations) => {
    setSelectedApplication(application);
    setUpdateData({
      status: application.status,
      loanAmount: application.loanAmount,
      interestRate: application.interestRate,
      termMonths: application.termMonths,
      monthlyPayment: application.monthlyPayment,
      creditScore: application.creditScore || "",
      annualIncome: application.annualIncome || ""
    });
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedApplication) return;

    try {
      await updateFinancingApplication({
        id: selectedApplication.id.toString(),
        ...updateData,
        creditScore: updateData.creditScore ? parseInt(updateData.creditScore) : undefined,
        annualIncome: updateData.annualIncome ? parseFloat(updateData.annualIncome) : undefined
      });
      setIsUpdateModalOpen(false);
      setSelectedApplication(null);
      setUpdateData({});
    } catch (error) {
      console.error('Error updating financing application:', error);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this financing application?')) {
      try {
        await deleteFinancingApplication(id.toString());
      } catch (error) {
        console.error('Error deleting financing application:', error);
      }
    }
  };

  const isDataLoading = isLoading || financingLoading;

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financing Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage car financing applications and approvals
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Approved Applications
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{approvedApplications}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {completedApplications} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Loan Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalLoanAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg: {averageLoanAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Rejected Applications
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedApplications}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalApplications > 0 ? Math.round((rejectedApplications / totalApplications) * 100) : 0}% rejection rate
              </p>
            </CardContent>
          </Card>
        </div>

        
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by customer, car, or VIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicationDate">Application Date</SelectItem>
                    <SelectItem value="loanAmount">Loan Amount</SelectItem>
                    <SelectItem value="customerName">Customer Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort Order
                </Label>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financing Applications ({filteredAndSortedApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedApplications.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">No financing applications found</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Financing applications will appear here when customers apply"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedApplications.map((application) => {
                  const StatusIcon = statusIcons[application.status];
                  return (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-6 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {application.customer?.name || `Customer ${application.customerId}`}
                            </h3>
                            <Badge className={`${statusColors[application.status]} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {application.loanAmount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(application.applicationDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {application.termMonths} months
                            </span>
                            {application.sale?.car && (
                              <span className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                {application.sale.car.year} {application.sale.car.make} {application.sale.car.model}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(application)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteApplication(application.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Financing Application Details</DialogTitle>
              <DialogDescription>
                Complete information about the financing application
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Customer
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.customer?.name || `Customer ${selectedApplication.customerId}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <Badge className={`${statusColors[selectedApplication.status]} border-0 mt-1`}>
                      {selectedApplication.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Loan Amount
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.loanAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Interest Rate
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.interestRate}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Term
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.termMonths} months
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Payment
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.monthlyPayment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Credit Score
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.creditScore || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Annual Income
                    </Label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedApplication.annualIncome ? selectedApplication.annualIncome.toLocaleString() : 'Not provided'}
                    </p>
                  </div>
                </div>
                {selectedApplication.sale?.car && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vehicle Information
                    </Label>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.sale.car.year} {selectedApplication.sale.car.make} {selectedApplication.sale.car.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        VIN: {selectedApplication.sale.car.vin}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Financing Application</DialogTitle>
              <DialogDescription>
                Modify the financing application details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={updateData.loanAmount}
                  onChange={(e) => setUpdateData({...updateData, loanAmount: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={updateData.interestRate}
                  onChange={(e) => setUpdateData({...updateData, interestRate: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="termMonths">Term (months)</Label>
                <Input
                  id="termMonths"
                  type="number"
                  value={updateData.termMonths}
                  onChange={(e) => setUpdateData({...updateData, termMonths: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  step="0.01"
                  value={updateData.monthlyPayment}
                  onChange={(e) => setUpdateData({...updateData, monthlyPayment: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitUpdate}>
                  Update Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

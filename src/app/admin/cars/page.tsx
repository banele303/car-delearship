"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Car, 
  Gauge, 
  MapPin,
  Building,
  User,
  Filter,
  ArrowUpDown,
  Fuel, 
  Key, 
  Home,
  DollarSign,
  Plus, 
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'; 
interface Car {
  id: number;
  make: string;
  model: string;
  price: number;
  year: number;
  vin: string;
  photoUrls?: string[];
  status?: string;
  carType: string;
  fuelType: string;
  dealership?: {
    id: number;
    name: string;
    city: string;
    state?: string;
  };
  employee?: {
    id: number;
    name: string;
  };
}

import { useGetCarsQuery, useGetAuthUserQuery } from '@/state/api';
import { configureAdminAuth, fetchAuthSession } from '../../admin/adminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminCarsPage() { 
  const router = useRouter();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState('make');
  const [sortOrder, setSortOrder] = useState('asc');
  
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        
        configureAdminAuth();
        
        
        const session = await fetchAuthSession();
        if (!session.tokens) {
          console.error("No valid auth session found");
          router.push("/admin-login");
          return;
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error("Error initializing admin auth:", error);
        router.push("/admin-login");
      }
    };
    
    initAuth();
  }, [router]);
  
  
  const { data: authUser, isLoading: authLoading, error: authError } = useGetAuthUserQuery(undefined, {
    skip: !authInitialized
  });
  
  const { data: cars, isLoading: carsLoading, error } = useGetCarsQuery(undefined, {
    skip: !authInitialized || !authUser
  });
  
  
  interface EnhancedCar {
    id: number;
    make: string;
    model: string;
    price: number;
    year: number;
    vin: string;
    photoUrls?: string[];
    status?: string;
    carType: string;
    fuelType: string;
    dealership?: {
      id: number;
      name: string;
      city: string;
      state?: string;
    };
    employee?: {
      id: number;
      name: string;
    };
  }

  
  const cities = cars ? [...new Set(cars.map((car: EnhancedCar) =>
    car.dealership?.city || 'Unknown'))] : []; 

  
  const filteredCars = cars?.filter((car) => {
    const enhancedCar = car as EnhancedCar;
    const employeeId = (car as any).employeeId || '';
    const matchesSearch = 
      enhancedCar.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enhancedCar.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enhancedCar.dealership?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enhancedCar.dealership?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enhancedCar.employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !filterCity || enhancedCar.dealership?.city === filterCity;
    
    return matchesSearch && matchesCity;
  }) || []; 

  
  const sortedCars = filteredCars.sort((a: EnhancedCar, b: EnhancedCar) => {
    let comparison = 0;
    
    if (sortBy === "make") {
      comparison = a.make.localeCompare(b.make);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "year") {
      comparison = a.year - b.year;
    } else if (sortBy === "dealership") {
      comparison = (a.dealership?.name || '').localeCompare(b.dealership?.name || '');
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  
  const handleDeleteCar = async () => {
    if (!selectedCar) return;

    setIsDeleting(true);
    try {
      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(`/api/cars/${selectedCar.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete car');
      }

      toast.success('Car deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedCar(null);
      
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting car:', error);
      toast.error(error.message || 'Failed to delete car');
    } finally {
      setIsDeleting(false);
    }
  };

  
  const openDeleteDialog = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteDialogOpen(true);
  };
  
  
  if (!authInitialized) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-xl shadow-sm">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        <Skeleton className="h-12 w-full rounded-lg" />
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-visible">
          <div className="overflow-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-18" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-14" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <div>
                          <Skeleton className="h-4 w-28 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg max-w-md text-center">
          <h3 className="font-semibold mb-2">Authentication Error</h3>
          <p className="text-sm">Your admin session could not be verified. Please sign in again.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/admin-login')} variant="default">
            Sign In
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  
  if (authLoading || carsLoading) { 
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-xl shadow-sm">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        <Skeleton className="h-12 w-full rounded-lg" />
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-18" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-14" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(8)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <div>
                          <Skeleton className="h-4 w-28 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg max-w-md text-center">
          <h3 className="font-semibold mb-2">Error Loading Cars</h3> 
          <p className="text-sm">{(error as any)?.data?.message || "Failed to load cars. Please try again later."}</p> 
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }
  
  
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg max-w-md text-center">
          <h3 className="font-semibold mb-2">Admin Session Required</h3>
          <p className="text-sm">Please sign in with your admin credentials to view this page.</p>
        </div>
        <Button onClick={() => router.push('/admin-login')} variant="default">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Cars Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and manage all cars across the platform
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin')}
            className="border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/admin/cars/add')} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Car
          </Button>
        </div>
      </div>
      
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cars by make, model, VIN, or employee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>{filterCity || "All Cities"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setFilterCity("")}>
                All Cities
              </DropdownMenuItem>
              {cities.map((city) => (
                <DropdownMenuItem key={city} onClick={() => setFilterCity(city)}>
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort by: {sortBy}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="make">Make</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="year">Year</SelectItem> 
              <SelectItem value="dealership">Dealership</SelectItem> 
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="h-10 w-10"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>
      
      
      <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center">
        <Filter className="h-4 w-4 mr-2 text-blue-500" />
        Showing <span className="font-semibold mx-1 text-blue-600 dark:text-blue-400">{sortedCars.length}</span> of <span className="font-semibold mx-1 text-blue-600 dark:text-blue-400">{cars?.length || 0}</span> cars
      </div>
      
      
      <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-visible">
        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Dealership</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCars.length > 0 ? (
                sortedCars.map((car: EnhancedCar) => ( 
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          {car.photoUrls && car.photoUrls.length > 0 ? (
                            <Image
                              src={car.photoUrls[0]}
                              alt={`${car.make} ${car.model}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-slate-200 dark:bg-slate-700 h-full w-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-slate-400" /> 
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{`${car.year} ${car.make} ${car.model}`}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            VIN: {car.vin}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm">{car.dealership?.name || 'No dealership available'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {car.dealership?.city || 'Unknown'}{car.dealership?.state ? `, ${car.dealership.state}` : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{car.employee?.name || (car as any).employeeId || "Unknown"}</span> 
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4 text-slate-400" /> 
                          <span>{car.carType}</span> 
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-4 w-4 text-slate-400" /> 
                          <span>{car.fuelType}</span> 
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">R{car.price.toLocaleString()}</div> 
                      <div className="text-xs text-slate-500 dark:text-slate-400"></div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={car.status === "AVAILABLE" ? "default" : 
                               car.status === "SOLD" ? "secondary" : "outline"}
                      >
                        {car.status || "AVAILABLE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="relative">
                      <div className="dropdown-container" style={{ position: 'relative' }}>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === car.id ? null : car.id);
                          }}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {openDropdownId === car.id && (
                          <div 
                            className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              zIndex: 50,
                            }}
                          >
                            <div 
                              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                router.push(`/admin/cars/edit/${car.id}`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </div>
                            <div 
                              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                openDeleteDialog(car);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {searchTerm || filterCity ? (
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-slate-300 dark:text-slateon-600" />
                        <p>No cars match your search criteria</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchTerm("");
                            setFilterCity("");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Car className="h-8 w-8 text-slate-300 dark:text-slate-600" /> 
                        <p>No cars found in the system</p> 
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg group">
          <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cars</p> 
                <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{cars?.length || 0}</h3> 
              </div>
              <div className="h-12 w-12 bg-blue-200 dark:bg-blue-800/50 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" /> 
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg group">
          <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 group-hover:from-purple-100 group-hover:to-purple-200 dark:group-hover:from-purple-900/30 dark:group-hover:to-purple-800/30 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Employees</p> 
                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                  {cars ? new Set(cars.map(c => (c as any).employeeId || 'Unknown')).size : 0} 
                </h3>
              </div>
              <div className="h-12 w-12 bg-purple-200 dark:bg-purple-800/50 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg group">
          <CardContent className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 group-hover:from-green-100 group-hover:to-green-200 dark:group-hover:from-green-900/30 dark:group-hover:to-green-800/30 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Price</p> 
                <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                  {cars && cars.length > 0
                    ? `R${(cars.reduce((sum, c) => sum + c.price, 0) / cars.length).toLocaleString()}` 
                    : "R0"}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-200 dark:bg-green-800/50 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this car? This action cannot be undone.
              {selectedCar && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="font-medium">{selectedCar.make} {selectedCar.model} ({selectedCar.year})</div>
                  <div className="text-sm text-slate-500">VIN: {selectedCar.vin}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Car
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, XCircle, Car } from "lucide-react";
import { configureAdminAuth, fetchAuthSession } from "../../../admin/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/ui/skeletons";
import Image from "next/image";

export default function AddCarPage() {
  const router = useRouter();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    vin: "",
    carType: "SEDAN",
    fuelType: "GASOLINE",
    condition: "USED",
    transmission: "AUTOMATIC",
    engine: "",
    exteriorColor: "",
    interiorColor: "",
    mileage: "",
    description: "",
    dealershipId: "",
    employeeId: "",
    status: "AVAILABLE",
  });

  
  interface Dealership {
    id: number;
    name: string;
    city: string;
  }
  
  interface Employee {
    id: number;
    name: string;
  }
  
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  
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
        
        
        fetchDealerships();
        fetchEmployees();
      } catch (error) {
        console.error("Error initializing admin auth:", error);
        router.push("/admin-login");
      }
    };
    
    initAuth();
  }, [router]);

  
  const fetchDealerships = async () => {
    try {
      const response = await fetch('/api/dealerships');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setDealerships(data);
        
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, dealershipId: data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error("Error fetching dealerships:", error);
    }
  };

  
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setEmployees(data);
        
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, employeeId: data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

  

type CarType = "SEDAN" | "SUV" | "HATCHBACK" | "COUPE" | "CONVERTIBLE" | "TRUCK" | "VAN";
type FuelType = "GASOLINE" | "DIESEL" | "HYBRID" | "ELECTRIC";
type CarCondition = "NEW" | "USED" | "CERTIFIED_PRE_OWNED" | "DEALER_DEMO";
type Transmission = "MANUAL" | "AUTOMATIC" | "CVT" | "DUAL_CLUTCH";
type CarStatus = "AVAILABLE" | "SOLD" | "RESERVED" | "MAINTENANCE";

interface CarFormData {
    make: string;
    model: string;
    year: number;
    price: string;
    vin: string;
    carType: CarType;
    fuelType: FuelType;
    condition: CarCondition;
    transmission: Transmission;
    engine: string;
    exteriorColor: string;
    interiorColor: string;
    mileage: string;
    description: string;
    dealershipId: string;
    employeeId: string;
    status: CarStatus;
}

const handleSelectChange = (name: keyof CarFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
};

  
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
        setPhotoFiles(Array.from(e.target.files));
    }
};

  
interface CarResponse {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    vin: string;
    carType: CarType;
    fuelType: FuelType;
    mileage: number;
    description: string;
    dealershipId: number;
    employeeId: number;
    status: CarStatus;
}

interface ErrorResponse {
    message: string;
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
        
        const submitFormData = new FormData();
        
        
        submitFormData.append('make', formData.make);
        submitFormData.append('model', formData.model);
        submitFormData.append('year', formData.year.toString());
        submitFormData.append('price', formData.price || '0');
        submitFormData.append('vin', formData.vin);
        submitFormData.append('carType', formData.carType);
        submitFormData.append('fuelType', formData.fuelType);
        submitFormData.append('condition', formData.condition);
        submitFormData.append('transmission', formData.transmission);
        submitFormData.append('engine', formData.engine);
        submitFormData.append('exteriorColor', formData.exteriorColor);
        submitFormData.append('interiorColor', formData.interiorColor);
        submitFormData.append('mileage', formData.mileage || '0');
        submitFormData.append('description', formData.description);
        submitFormData.append('dealershipId', formData.dealershipId);
        if (formData.employeeId) {
            submitFormData.append('employeeId', formData.employeeId);
        }
        submitFormData.append('status', formData.status);

        
        photoFiles.forEach(file => {
            submitFormData.append('photos', file);
        });

        
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) {
            toast.error("Authentication required. Please log in again.");
            return;
        }

        
        const carResponse = await fetch('/api/cars', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: submitFormData, 
        });

        if (!carResponse.ok) {
            const error: ErrorResponse = await carResponse.json();
            throw new Error(error.message || 'Failed to create car');
        }

        const car: CarResponse = await carResponse.json();

        toast.success('Car added successfully!');
        router.push('/admin/cars');
    } catch (error) {
        console.error('Error adding car:', error);
        if (error instanceof Error) {
            toast.error(error.message || 'Failed to add car');
        } else {
            toast.error('Failed to add car');
        }
    } finally {
        setIsLoading(false);
    }
};

  
  if (!authInitialized) {
    return <FormSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Car
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create a new car listing in the system
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/cars')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cars
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>Enter the basic information about the car</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input 
                  id="make" 
                  name="make" 
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="Toyota, Honda, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Corolla, Civic, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input 
                  id="price" 
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 250000"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input 
                  id="mileage" 
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carType">Car Type</Label>
                <Select 
                  value={formData.carType}
                  onValueChange={(value) => handleSelectChange("carType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select car type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEDAN">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                    <SelectItem value="COUPE">Coupe</SelectItem>
                    <SelectItem value="CONVERTIBLE">Convertible</SelectItem>
                    <SelectItem value="TRUCK">Truck</SelectItem>
                    <SelectItem value="VAN">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select 
                  value={formData.fuelType}
                  onValueChange={(value) => handleSelectChange("fuelType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Gasoline</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select 
                  value={formData.condition}
                  onValueChange={(value) => handleSelectChange("condition", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="USED">Used</SelectItem>
                    <SelectItem value="CERTIFIED_PRE_OWNED">Certified Pre-Owned</SelectItem>
                    <SelectItem value="DEALER_DEMO">Dealer Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select 
                  value={formData.transmission}
                  onValueChange={(value) => handleSelectChange("transmission", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="DUAL_CLUTCH">Dual Clutch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine">Engine</Label>
                <Input 
                  id="engine" 
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  placeholder="e.g. 2.0L Turbo"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exteriorColor">Exterior Color</Label>
                <Input 
                  id="exteriorColor" 
                  name="exteriorColor"
                  value={formData.exteriorColor}
                  onChange={handleChange}
                  placeholder="e.g. White, Black, Silver"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interiorColor">Interior Color</Label>
                <Input 
                  id="interiorColor" 
                  name="interiorColor"
                  value={formData.interiorColor}
                  onChange={handleChange}
                  placeholder="e.g. Black, Beige, Gray"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input 
                id="vin" 
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="Vehicle Identification Number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed information about the car..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>Assign this car to a dealership and employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealershipId">Dealership</Label>
                <Select 
                  value={formData.dealershipId}
                  onValueChange={(value) => handleSelectChange("dealershipId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealership" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealerships.map((dealership) => (
                      <SelectItem key={dealership.id} value={dealership.id.toString()}>
                        {dealership.name} ({dealership.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select 
                  value={formData.employeeId}
                  onValueChange={(value) => handleSelectChange("employeeId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="MAINTENANCE">In Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Upload photos of the car</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photos">Car Photos</Label>
              <Input 
                id="photos" 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">You can select multiple photos at once</p>
            </div>
            
            {photoFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Photos ({photoFiles.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`} 
                        width={80}
                        height={80}
                        className="h-full w-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => setPhotoFiles(photoFiles.filter((_, i) => i !== index))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/admin/cars')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Car
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

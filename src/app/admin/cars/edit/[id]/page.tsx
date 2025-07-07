"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, XCircle, Car } from "lucide-react";
import { configureAdminAuth, fetchAuthSession } from "../../../../admin/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  vin: string;
  carType: string;
  fuelType: string;
  condition: string;
  transmission: string;
  engine: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  description: string;
  dealershipId: number;
  employeeId: number;
  status: string;
  photoUrls: string[];
}

interface Dealership {
  id: number;
  name: string;
  city: string;
}

interface Employee {
  id: number;
  name: string;
}

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [car, setCar] = useState<Car | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  
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

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  
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

  
  const fetchCarData = useCallback(async (carId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cars/${carId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch car data');
      }
      const carData = await response.json();
      setCar(carData);
      setExistingPhotos(carData.photoUrls || []);
      
      
      setFormData({
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price.toString(),
        vin: carData.vin,
        carType: carData.carType,
        fuelType: carData.fuelType,
        condition: carData.condition,
        transmission: carData.transmission,
        engine: carData.engine,
        exteriorColor: carData.exteriorColor,
        interiorColor: carData.interiorColor,
        mileage: carData.mileage.toString(),
        description: carData.description || "",
        dealershipId: carData.dealershipId.toString(),
        employeeId: carData.employeeId?.toString() || "",
        status: carData.status,
      });
    } catch (error) {
      console.error("Error fetching car:", error);
      toast.error("Failed to load car data");
      router.push("/admin/cars");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  
  useEffect(() => {
    if (authInitialized && resolvedParams) {
      fetchCarData(resolvedParams.id);
      fetchDealerships();
      fetchEmployees();
    }
  }, [authInitialized, resolvedParams, fetchCarData]);

  
  const fetchDealerships = async () => {
    try {
      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        console.error("No auth token available for dealerships fetch");
        return;
      }

      const response = await fetch('/api/dealerships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setDealerships(data);
      }
    } catch (error) {
      console.error("Error fetching dealerships:", error);
    }
  };

  
  const fetchEmployees = async () => {
    try {
      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        console.error("No auth token available for employees fetch");
        return;
      }

      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotoFiles(Array.from(e.target.files));
    }
  };

  
  const removeExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resolvedParams) return;
    
    setIsLoading(true);

    try {
      const submitFormData = new FormData();
      
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitFormData.append(key, value.toString());
        }
      });

      
      submitFormData.append('photoUrls', JSON.stringify(existingPhotos));

      
      photoFiles.forEach(file => {
        submitFormData.append('photos', file);
      });

      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(`/api/cars/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update car');
      }

      toast.success('Car updated successfully!');
      router.push('/admin/cars');
    } catch (error) {
      console.error('Error updating car:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update car');
      } else {
        toast.error('Failed to update car');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!authInitialized || isLoading) {
    return <FormSkeleton />;
  }

  if (!car) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-slate-500">Car not found</p>
          <Button onClick={() => router.push('/admin/cars')} className="mt-4">
            Back to Cars
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Car
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Update car information
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
            <CardDescription>Update the car information</CardDescription>
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
            <CardDescription>Update car assignment</CardDescription>
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
            <CardDescription>Manage car photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {existingPhotos.length > 0 && (
              <div className="space-y-2">
                <Label>Current Photos</Label>
                <div className="flex flex-wrap gap-2">
                  {existingPhotos.map((photoUrl, index) => (
                    <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image 
                        src={photoUrl} 
                        alt={`Current photo ${index}`} 
                        width={80}
                        height={80}
                        className="h-full w-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => removeExistingPhoto(photoUrl)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            <div className="space-y-2">
              <Label htmlFor="photos">Add New Photos</Label>
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
                <Label>New Photos ({photoFiles.length})</Label>
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
                <span className="animate-spin mr-2">⏳</span> Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Car
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

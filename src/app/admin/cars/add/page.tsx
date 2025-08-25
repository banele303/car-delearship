"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, XCircle, Car } from "lucide-react";
import { configureAdminAuth, fetchAuthSession } from "../../../admin/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  featured: false,
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
  const [dealershipFetchStatus, setDealershipFetchStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [dealershipFetchError, setDealershipFetchError] = useState<string>('');

  // Central photo cap (adjust here if business rules change)
  const MAX_PHOTOS = 25; // Updated cap per request

  
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
      setDealershipFetchStatus('loading');
      setDealershipFetchError('');
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await fetch('/api/dealerships', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (!response.ok) {
        const txt = await response.text();
        console.error('Failed to load dealerships', txt);
        setDealershipFetchStatus('error');
        setDealershipFetchError(`HTTP ${response.status}`);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length) {
        setDealerships(data);
        setFormData(prev => ({ ...prev, dealershipId: prev.dealershipId || data[0].id.toString() }));
        setDealershipFetchStatus('success');
      } else {
        console.warn('No dealerships returned');
        setDealerships([]);
        setDealershipFetchStatus('success');
      }
    } catch (error) {
      console.error("Error fetching dealerships:", error);
      setDealershipFetchStatus('error');
      setDealershipFetchError((error as Error).message);
    }
  };

  
  const fetchEmployees = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await fetch('/api/employees', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (response.status === 401) {
        console.warn('Unauthorized fetching employees (401) – ensure user has ADMIN or SALES_MANAGER role');
        return; // suppress toast spam here
      }
      if (!response.ok) {
        const txt = await response.text();
        console.error('Failed employees fetch', response.status, txt);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setEmployees(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, employeeId: prev.employeeId || data[0].id.toString() }));
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
  featured: boolean;
}

const handleSelectChange = (name: keyof CarFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
};

  
// Client-side limits (mirrors server; can be relaxed via env vars exposed if needed)
const MAX_SINGLE_FILE_MB = Number(process.env.NEXT_PUBLIC_CAR_UPLOAD_SINGLE_MAX_MB || 10);
const MAX_TOTAL_MB = Number(process.env.NEXT_PUBLIC_CAR_UPLOAD_TOTAL_MAX_MB || 80);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  if (!e.target.files) return;
  const newlySelected = Array.from(e.target.files);

  // Filter invalid types & oversize
  const valid: File[] = [];
  newlySelected.forEach(f => {
    const sizeMb = f.size / (1024 * 1024);
    if (!f.type.startsWith('image/')) {
      toast.error(`${f.name}: not an image – skipped`);
      return;
    }
    if (sizeMb > MAX_SINGLE_FILE_MB) {
      toast.error(`${f.name}: ${sizeMb.toFixed(1)}MB > ${MAX_SINGLE_FILE_MB}MB limit – skipped`);
      return;
    }
    valid.push(f);
  });

  // Merge unique by name+size
  const merged: File[] = [];
  const seen = new Set<string>();
  [...photoFiles, ...valid].forEach(f => {
    const key = `${f.name}-${f.size}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(f);
    }
  });

  // Enforce photo count limit
  let finalList = merged;
  if (merged.length > MAX_PHOTOS) {
    finalList = merged.slice(0, MAX_PHOTOS);
    const rejected = merged.length - MAX_PHOTOS;
    toast.error(`Photo cap ${MAX_PHOTOS}: trimmed ${rejected} excess.`);
  }

  // Enforce total size limit
  const totalBytes = finalList.reduce((sum, f) => sum + f.size, 0);
  const totalMb = totalBytes / (1024 * 1024);
  if (totalMb > MAX_TOTAL_MB) {
    // Trim from the end until under cap
    const trimmed: File[] = [];
    let running = 0;
    for (const f of finalList) {
      if ((running + f.size) / (1024 * 1024) > MAX_TOTAL_MB) {
        break;
      }
      trimmed.push(f);
      running += f.size;
    }
    toast.error(`Total size ${totalMb.toFixed(1)}MB > ${MAX_TOTAL_MB}MB. Keeping first ${trimmed.length} images.`);
    finalList = trimmed;
  }

  setPhotoFiles(finalList);
  toast.success(`Selected ${finalList.length} image${finalList.length!==1?'s':''} (≈${(finalList.reduce((s,f)=>s+f.size,0)/(1024*1024)).toFixed(1)}MB).`);
  e.target.value = ""; // allow re-select same files
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
    // Basic client-side validations to avoid Prisma FK errors
  // dealershipId now optional per request: only validate if provided
  const hasDealership = formData.dealershipId && !isNaN(Number(formData.dealershipId)) && Number(formData.dealershipId) > 0;
        
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
    if (hasDealership) {
      submitFormData.append('dealershipId', formData.dealershipId);
    }
        if (formData.employeeId) {
            submitFormData.append('employeeId', formData.employeeId);
        }
        submitFormData.append('status', formData.status);
  submitFormData.append('featured', formData.featured ? 'true' : 'false');

        
        photoFiles.forEach(file => {
            submitFormData.append('photos', file);
        });

        
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) {
            toast.error("Authentication required. Please log in again.");
            return;
        }

        
        // Pre-upload using presigned URLs to avoid hitting API body size limits
        let uploadedUrls: string[] = [];
        let presignFailed = false;
        if (photoFiles.length) {
          try {
            const presign = await fetch('/api/uploads/presign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ files: photoFiles.map(f => ({ name: f.name, type: f.type })) })
            });
            if (!presign.ok) {
              const t = await presign.text();
              presignFailed = true;
              console.warn('Presign failed', presign.status, t);
            } else {
              const presignData = await presign.json();
              const items: { uploadUrl: string; url: string; contentType: string }[] = presignData.files || [];
              for (let i=0;i<items.length;i++) {
                const f = photoFiles[i];
                const { uploadUrl, url, contentType } = items[i];
                const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: f });
                if (!putRes.ok) {
                  throw new Error(`Upload failed (${putRes.status}) for ${f.name}`);
                }
                uploadedUrls.push(url);
              }
            }
          } catch (err) {
            presignFailed = true;
            console.warn('Presign exception fallback to multipart', err);
          }
        }

        const payload = {
          ...formData,
          year: formData.year,
          price: Number(formData.price || '0'),
          mileage: Number(formData.mileage || '0'),
          featured: formData.featured,
          photoUrls: uploadedUrls,
        };
        if (!hasDealership) delete (payload as any).dealershipId;
        let carResponse: Response;
        if (!presignFailed) {
          carResponse = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          // Fallback legacy multipart if presign route not available
          const fd = new FormData();
          Object.entries(formData).forEach(([k,v]) => {
            if (k === 'featured') return; // handle separately
            fd.append(k, String(v));
          });
          fd.append('featured', formData.featured ? 'true':'false');
          if (!hasDealership) fd.delete('dealershipId');
          photoFiles.forEach(f=>fd.append('photos', f));
          carResponse = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
          });
          if (presignFailed) {
            toast.message('Using fallback upload', { description: 'Presign route failed; sent legacy multipart.' });
          }
        }

        if (!carResponse.ok) {
          const raw = await carResponse.text();
          let message = raw;
          try {
            const parsed = JSON.parse(raw);
            message = parsed.message || parsed.error || raw;
          } catch {
            if (carResponse.status === 413) {
              message = 'Upload too large (413). (Legacy path)';
            }
          }
          throw new Error(message.slice(0,300));
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
                  placeholder="e.g. 139900"
                  required
                  min="0"
                  step="100"  /* allow prices ending in 900 etc */
                />
                <p className="text-[11px] text-slate-500">You can enter any price (now supports amounts like 139900). Rounded to nearest Rand.</p>
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
                    <SelectItem value="GASOLINE">Petrol</SelectItem>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="dealershipId">Dealership</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px]" onClick={fetchDealerships} disabled={dealershipFetchStatus==='loading'}>
                    {dealershipFetchStatus==='loading' ? 'Refreshing…' : 'Refresh'}
                  </Button>
                </div>
                <Select 
                  value={formData.dealershipId}
                  onValueChange={(value) => handleSelectChange("dealershipId", value)}
                  disabled={!dealerships.length}
                >
                  <SelectTrigger className={!dealerships.length ? 'opacity-60' : ''}>
                    <SelectValue placeholder={dealerships.length ? 'Select dealership' : 'No dealerships found'} />
                  </SelectTrigger>
                  <SelectContent>
                    {dealerships.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500">No dealerships available. Create one first.</div>
                    )}
                    {dealerships.map((dealership) => (
                      <SelectItem key={dealership.id} value={dealership.id.toString()}>
                        {dealership.name} ({dealership.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500">Selected ID: {formData.dealershipId || '—'} • Loaded: {dealerships.length} • Status: {dealershipFetchStatus}{dealershipFetchError ? ` (${dealershipFetchError})` : ''}</p>
                {dealershipFetchStatus==='success' && !dealerships.length && (
                  <p className="text-[11px] text-amber-600">You must create a dealership before you can assign one to a car.</p>
                )}
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
            <div className="space-y-2">
              <Label htmlFor="featured">Featured</Label>
              <div className="flex items-center gap-3 py-2">
                <Switch id="featured" checked={formData.featured} onCheckedChange={(v)=>setFormData(prev=>({...prev, featured: v}))} />
                <span className="text-sm text-slate-600 dark:text-slate-300">Show in Featured Vehicles section</span>
              </div>
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
              {/* Drag & drop + click uploader */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fileList = e.dataTransfer.files;
                  // Create synthetic event object with target.files for reuse of handler
                  const input = document.createElement('input');
                  const dataTransfer = new DataTransfer();
                  Array.from(fileList).forEach(f => dataTransfer.items.add(f));
                  input.files = dataTransfer.files;
                  handleFileChange({ target: input } as any);
                }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 dark:hover:border-blue-500/60 transition-colors"
                onClick={() => document.getElementById('photos')?.click()}
              >
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Drag & drop images here or click to browse</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">PNG/JPG up to 5MB each • Max {MAX_PHOTOS} images total</p>
                <Input
                  id="photos"
                  type="file"
                  multiple={true}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">You can add up to {MAX_PHOTOS} photos. Add more later to append until the cap.</p>
              {photoFiles.length >= MAX_PHOTOS && (
                <p className="text-xs text-amber-600 mt-1">Maximum {MAX_PHOTOS} images reached.</p>
              )}
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

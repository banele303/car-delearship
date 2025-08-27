"use client";

import { useState, useRef } from "react";
import { batchCompress } from "@/lib/imageCompression";
import { CAR_UPLOAD_SINGLE_MAX_MB, CAR_UPLOAD_TOTAL_MAX_MB, CAR_UPLOAD_MAX_FILES } from "@/config/uploadLimits";
import { toast } from "sonner";
import { Car } from "@/types/prismaTypes"; 
import Image from "next/image";
import { useCreateCarMutation } from "@/state/api";
import { useRouter } from "next/navigation";

interface CarFormProps {
  initialData?: Car;
}

export const CarForm = ({ initialData }: CarFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialData?.photoUrls || []
  );
  const [createCar, { isLoading: isSubmitting }] = useCreateCarMutation();
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<{done:number,total:number,name:string}|null>(null);
  const router = useRouter();

  const MAX_SINGLE_MB = CAR_UPLOAD_SINGLE_MAX_MB;
  const MAX_TOTAL_MB = CAR_UPLOAD_TOTAL_MAX_MB;
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Pre-validate count + sizes before compression
    if (selectedFiles.length + files.length > CAR_UPLOAD_MAX_FILES) {
      toast.error(`Too many photos. Limit is ${CAR_UPLOAD_MAX_FILES}.`);
      return;
    }
    // Pre-validate sizes before compression
    for (const f of files) {
      const mb = f.size / (1024 * 1024);
      if (mb > MAX_SINGLE_MB) {
        toast.error(`File ${f.name} is ${(mb).toFixed(1)}MB > ${MAX_SINGLE_MB}MB limit.`);
        return;
      }
    }
    const combinedBytes = [...selectedFiles, ...files].reduce((a,f)=>a+f.size,0);
    if (combinedBytes / (1024*1024) > MAX_TOTAL_MB) {
      toast.error(`Total selected size exceeds ${MAX_TOTAL_MB}MB. Remove some images.`);
      return;
    }
    setIsCompressing(true);
    setCompressionProgress({done:0,total:files.length,name:''});
    const compressed = await batchCompress(files, (done,total,name)=>{
      setCompressionProgress({done,total,name});
    }, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
    setIsCompressing(false);
    setCompressionProgress(null);
    setSelectedFiles(compressed);
    const newPreviewUrls = compressed.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    // Split: send metadata first (no photos) to avoid large multipart 413
    const allInputs = new FormData(formRef.current);
    const metadata = new FormData();
    for (const [k,v] of allInputs.entries()) {
      if (k === 'photos') continue;
      metadata.append(k,v);
    }
    toast.loading('Creating car...');
    let createdCar: any = null;
    try {
      createdCar = await createCar(metadata).unwrap();
    } catch (err:any) {
      toast.dismiss();
      toast.error(err?.data?.message || 'Failed to create car.');
      console.error('Create car error:', err);
      return;
    }
    toast.dismiss();
    if (!selectedFiles.length) {
      toast.success('Car created successfully!');
      router.push('/admin/cars');
      return;
    }
    // Sequential photo uploads
    let success = 0; let failed = 0;
    toast.loading(`Uploading 0/${selectedFiles.length} photos...`);
    for (let i=0;i<selectedFiles.length;i++) {
      const f = selectedFiles[i];
      const fd = new FormData();
      fd.append('photo', f);
      try {
        const res = await fetch(`/api/cars/${createdCar.id}/photos`, { method: 'POST', body: fd });
        if (!res.ok) {
          failed++; console.error('Photo upload failed', await res.text());
        } else {
          success++;
        }
      } catch (e) {
        failed++; console.error('Photo upload exception', e);
      }
      toast.message(`Uploading ${i+1}/${selectedFiles.length} photos...`, { description: `${success} success, ${failed} failed` });
    }
    toast.dismiss();
    if (failed === 0) {
      toast.success('Car and photos uploaded successfully.');
    } else if (success === 0) {
      toast.error('All photo uploads failed. You can edit the car to add photos later.');
    } else {
      toast.warning(`${success} photos uploaded, ${failed} failed. You can retry in edit page.` as any);
    }
    router.push('/admin/cars');
  };

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Car Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              VIN
            </label>
            <input
              type="text"
              name="vin"
              defaultValue={initialData?.vin}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Make
            </label>
            <input
              type="text"
              name="make"
              defaultValue={initialData?.make}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              name="model"
              defaultValue={initialData?.model}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              name="year"
              defaultValue={initialData?.year}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mileage (km)
            </label>
            <input
              type="number"
              name="mileage"
              defaultValue={initialData?.mileage}
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              name="condition"
              defaultValue={initialData?.condition}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="CERTIFIED_PRE_OWNED">Certified Pre-Owned</option>
              <option value="DEALER_DEMO">Dealer Demo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Car Type
            </label>
            <select
              name="carType"
              defaultValue={initialData?.carType}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="COUPE">Coupe</option>
              <option value="CONVERTIBLE">Convertible</option>
              <option value="WAGON">Wagon</option>
              <option value="PICKUP_TRUCK">Pickup Truck</option>
              <option value="VAN">Van</option>
              <option value="MINIVAN">Minivan</option>
              <option value="CROSSOVER">Crossover</option>
              <option value="SPORTS_CAR">Sports Car</option>
              <option value="LUXURY">Luxury</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fuel
            </label>
            <select
              name="fuelType"
              defaultValue={initialData?.fuelType}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="FUEL">Fuel</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
              <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
              <option value="HYDROGEN">Hydrogen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transmission
            </label>
            <select
              name="transmission"
              defaultValue={initialData?.transmission}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="CVT">CVT</option>
              <option value="DUAL_CLUTCH">Dual-Clutch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Engine
            </label>
            <input
              type="text"
              name="engine"
              defaultValue={initialData?.engine}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Exterior Color
            </label>
            <input
              type="text"
              name="exteriorColor"
              defaultValue={initialData?.exteriorColor}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interior Color
            </label>
            <input
              type="text"
              name="interiorColor"
              defaultValue={initialData?.interiorColor}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Features (comma-separated)
            </label>
            <input
              type="text"
              name="features"
              defaultValue={initialData?.features?.join(", ")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dealership ID
            </label>
            <input
              type="number"
              name="dealershipId"
              defaultValue={initialData?.dealershipId}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee ID (Optional)
            </label>
            <input
              type="text"
              name="employeeId"
              defaultValue={initialData?.employeeId || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Photos</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Car photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized={
                      url.startsWith("blob:") || url.startsWith("data:")
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Add More Photos
            </label>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isCompressing}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-.sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isCompressing ? `Compressing ${compressionProgress?.done || 0}/${compressionProgress?.total || 0}` : isSubmitting ? "Saving..." : "Create Car"}
        </button>
      </div>
    </form>
  );
};
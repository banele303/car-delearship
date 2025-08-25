"use client";

import { useState, useRef } from "react";
import { Car } from "@/types/prismaTypes"; 
import Image from "next/image";
import { useCreateCarMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    selectedFiles.forEach((file) => {
      formData.append("photos", file);
    });

    
    if (initialData?.photoUrls) {
      formData.append("photoUrls", JSON.stringify(previewUrls));
    }

    try {
      await createCar(formData).unwrap();
      toast.success("Car created successfully!");
      router.push("/admin/cars");
    } catch (error) {
      toast.error("Failed to create car.");
      console.error(error);
    }
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
              <option value="GASOLINE">Fuel</option>
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
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-.sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Create Car"}
        </button>
      </div>
    </form>
  );
};
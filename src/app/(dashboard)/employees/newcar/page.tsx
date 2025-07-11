"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { fetchAuthSession } from "aws-amplify/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateFormField } from "@/components/CreateFormField";
import { CustomFormField } from "@/components/FormField";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";


import {
  Car,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ImageDown,
  X,
  CircleDollarSign,
  CheckCircle2,
  Gauge,
  Users,
  Fuel,
  Settings,
} from "lucide-react";


import { type CarFormData, carSchema } from "@/lib/schemas"; 
import { useCreateCarMutation, useGetAuthUserQuery } from "@/state/api"; 
import { CarCondition, CarType, FuelType, Transmission, CarStatus } from "@/lib/constants"; 



interface FormStepProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const FormStep = ({
  title,
  icon,
  children,
  isActive,
  isCompleted,
  stepNumber,
  totalSteps,
  onStepClick,
}: FormStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`${isActive ? 'block' : 'hidden'} w-full`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onStepClick && onStepClick(stepNumber)}
            role="button"
            tabIndex={0}
            aria-label={`Go to step ${stepNumber}: ${title}`}
          >
            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-600/20 text-green-400' : 'bg-[#1E2A45] text-[#4F9CF9]'}`}>
              {isCompleted ? <CheckCircle2 size={20} /> : icon}
            </div>
            <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">{title}</h2>
          </div>
          <div className="text-sm text-gray-400">
            Step {stepNumber} of {totalSteps}
          </div>
        </div>
        <Progress value={(stepNumber / totalSteps) * 100} className="h-1.5 mb-6 bg-[#1E2A45]" />
      </div>
      <div className="p-6 border border-[#1E2A45] rounded-xl bg-[#0B1120]/60 shadow-lg">
        {children}
      </div>
    </motion.div>
  );
};


interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
}

const StepNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isSubmitting,
  isLastStep,
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button
          type="button"
          onClick={onPrev}
          className="bg-[#1E2A45] hover:bg-[#2A3A55] text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} />
          Previous
        </Button>
      )}
      
      {currentStep === 1 && <div></div>}
      
      <Button
        type={isLastStep ? "submit" : "button"}
        onClick={isLastStep ? undefined : onNext}
        className="bg-gradient-to-r from-[#0070F3] to-[#4F9CF9] hover:from-[#0060D3] hover:to-[#3F8CE9] text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 ml-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : isLastStep ? (
          <>
            <Check className="w-4 h-4" />
            Submit
          </>
        ) : (
          <>
            Next
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
};


const NewCar = () => { 
  const [createCar, { isLoading: isCreatingCar }] = useCreateCarMutation(); 
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); 
  const router = useRouter();
  
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 4; 

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema), 
    defaultValues: {
      vin: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      condition: CarCondition.NEW,
      carType: CarType.SEDAN,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      exteriorColor: "",
      interiorColor: "",
      description: "",
      features: [],
      photoUrls: [],
      status: CarStatus.AVAILABLE,
      dealershipId: 1, 
      employeeId: "",
    },
    mode: "onChange", 
  });
  
  
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const formState: CarFormData = form.getValues();
    
    switch(step) {
      case 1: 
        isValid = typeof formState.vin === 'string' && formState.vin.trim() !== '' &&
                  typeof formState.make === 'string' && formState.make.trim() !== '' &&
                  typeof formState.model === 'string' && formState.model.trim() !== '' &&
                  Number(formState.year) > 1900 &&
                  Number(formState.price) > 0 &&
                  Number(formState.mileage) >= 0;
        break;
      case 2: 
        isValid = !!formState.condition && !!formState.carType &&
                  !!formState.fuelType && !!formState.transmission &&
                  typeof formState.description === 'string' && formState.description.trim() !== '';
        break;
      case 3: 
        isValid = ((formState.features?.length ?? 0) > 0) &&
                  (uploadedFiles.length > 0 || (formState.photoUrls?.length ?? 0) > 0);
        break;
      case 4: 
        isValid = Number(formState.dealershipId) > 0;
        break;
      default:
        isValid = true;
    }
    
    return isValid;
  };
  
  
  const goToStep = (step: number) => {
    if (step < 1 || step > totalSteps) return;
    
    
    if (step > currentStep) {
      
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i)) {
          toast.error(`Please complete all required fields in Step ${i} before proceeding`, {
            position: "top-center",
            duration: 3000,
          });
          return;
        }
        
        if (!completedSteps.includes(i)) {
          setCompletedSteps((prev) => [...prev, i]);
        }
      }
    }
    
    
    setCurrentStep(step);
  };
  
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(currentStep + 1);
      } else {
        toast.error(`Please complete all required fields for Step ${currentStep} before proceeding`, {
          position: "top-center",
          duration: 3000,
        });
      }
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
    }
  };

  
  const handleRemoveFeature = (featureToRemove: string) => {
    const currentFeatures = form.getValues("features") || [];
    const updatedFeatures = currentFeatures.filter(
      (feature) => feature !== featureToRemove
    );
    form.setValue("features", updatedFeatures);
  };

  const onSubmit = async (data: CarFormData) => { 
    if (submitting) return;
    
    
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields before submitting", {
        position: "top-center",
        duration: 3000,
      });
      setSubmitting(false);
      return;
    }

    try {
      setSubmitting(true);

      if (!authUser?.cognitoInfo?.userId) {
        toast.error("You must be logged in to create a car listing", {
          className: "bg-red-500 text-white font-medium",
          position: "top-center",
          duration: 4000,
        });
        setSubmitting(false);
        return;
      }

      
      let photoFiles: File[] = [];
      if (data.photoUrls) {
        const files = data.photoUrls as unknown as FileList;
        if (files && files.length) {
          photoFiles = Array.from(files);
          console.log(`Extracted ${photoFiles.length} photo files`);
        }
      }

      
      const carData = {
        ...data,
        employeeId: authUser.cognitoInfo.userId, 
        features: Array.isArray(data.features) ? data.features : [],
        photoUrls: [], 
      };

      
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      
      const createResponse = await fetch('/api/vehicles', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(carData),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Error creating car:', errorData);
        throw new Error(errorData.message || 'Failed to create car');
      }
      
      const carResponse = await createResponse.json();
      console.log("Car created successfully:", carResponse);

      
      if (photoFiles.length > 0) {
        console.log(`Uploading ${photoFiles.length} photos for car ID ${carResponse.id}`);
        const uploadedPhotos = [];
        let failedUploads = 0;
        
        for (const file of photoFiles) {
          try {
            const photoFormData = new FormData();
            photoFormData.append('photo', file);
            photoFormData.append('carId', carResponse.id.toString()); 
            
            const uploadResponse = await fetch(`/api/vehicles/${carResponse.id}/photos`, { 
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
              body: photoFormData,
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              console.error(`Error uploading photo ${file.name}:`, errorData);
              failedUploads++;
              continue;
            }
            
            const photoData = await uploadResponse.json();
            console.log(`Successfully uploaded photo ${file.name}:`, photoData);
            uploadedPhotos.push(photoData.photoUrl);
          } catch (error) {
            console.error(`Error uploading photo ${file.name}:`, error);
            failedUploads++;
          }
        }
        
        console.log(`Uploaded ${uploadedPhotos.length} photos. Failed: ${failedUploads}`);
        if (failedUploads > 0) {
          toast.error(`Failed to upload ${failedUploads} photo(s)`);
        }
      }

      
      form.reset();
      setUploadedFiles([]);

      
      router.push("/employees/inventory"); 

      
      toast.success(
        `Car "${data.make} ${data.model}" created successfully`,
        {
          className: "bg-green-500 text-white font-medium",
          position: "top-center",
          duration: 4000,
        }
      );

    } catch (error: any) {
      console.error("Error during car creation process:", error);
      toast.error(
        error?.data?.message || "Failed to complete car creation. Please try again.",
        {
          className: "bg-red-500 text-white font-medium",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  
  const labelStyle = "text-sm font-medium text-gray-200";

  
  const inputStyle =
    "bg-[#0B1120] text-white border-[#1E2A45] focus:border-[#4F9CF9] focus:ring-[#4F9CF9] rounded-md";

  return (
    <div className="min-h-screen text-white ">
      <Toaster richColors position="top-center" />
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white bg-[#0B1120]/80 hover:bg-[#1E2A45] rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Add New Car</h1>
              <p className="text-gray-400 mt-1">Create a new car listing with our step-by-step form</p>
            </div>
          </div>
        </div>
        
        
        <div className="mb-8 hidden md:flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNum = index + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = completedSteps.includes(stepNum);
            
            return (
              <div 
                key={stepNum} 
                className="flex flex-col items-center cursor-pointer" 
                onClick={() => goToStep(stepNum)}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${stepNum}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-blue-500 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-[#1E2A45] text-gray-400'}`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                </div>
                <div className={`text-xs ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                  {stepNum === 1 && 'Basic Info'}
                  {stepNum === 2 && 'Details'}
                  {stepNum === 3 && 'Features & Photos'}
                  {stepNum === 4 && 'Dealership Info'}
                </div>
              </div>
            );
          })}
        </div>

        
        <div className=" rounded-xl p-6 shadow-xl border border-[#1E2A45]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormStep 
                title="Basic Information" 
                icon={<Car size={20} />} 
                isActive={currentStep === 1}
                isCompleted={completedSteps.includes(1)}
                stepNumber={1}
                totalSteps={totalSteps}
                onStepClick={goToStep}
              >
                <div className="space-y-6">
                  <CreateFormField
                    name="vin"
                    label="VIN"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="Enter Vehicle Identification Number"
                  />
                  <CreateFormField
                    name="make"
                    label="Make"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., Toyota"
                  />
                  <CreateFormField
                    name="model"
                    label="Model"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., Camry"
                  />
                  <CreateFormField
                    name="year"
                    label="Year"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., 2023"
                  />
                  <CreateFormField
                    name="price"
                    label="Price"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., 25000"
                  />
                  <CreateFormField
                    name="mileage"
                    label="Mileage (km)"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., 50000"
                  />
                </div>
                
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                  isSubmitting={submitting}
                  isLastStep={false}
                />
              </FormStep>

              
              <FormStep 
                title="Car Details" 
                icon={<Settings size={20} />} 
                isActive={currentStep === 2}
                isCompleted={completedSteps.includes(2)}
                stepNumber={2}
                totalSteps={totalSteps}
                onStepClick={goToStep}
              >
                <div className="space-y-6">
                  <CreateFormField
                    name="condition"
                    label="Condition"
                    type="select"
                    options={Object.keys(CarCondition).map((key) => ({
                      value: key,
                      label: key.replace(/_/g, ' '),
                    }))}
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} h-10`}
                  />
                  <CreateFormField
                    name="carType"
                    label="Car Type"
                    type="select"
                    options={Object.keys(CarType).map((key) => ({
                      value: key,
                      label: key.replace(/_/g, ' '),
                    }))}
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} h-10`}
                  />
                  <CreateFormField
                    name="fuelType"
                    label="Fuel Type"
                    type="select"
                    options={Object.keys(FuelType).map((key) => ({
                      value: key,
                      label: key.replace(/_/g, ' '),
                    }))}
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} h-10`}
                  />
                  <CreateFormField
                    name="transmission"
                    label="Transmission"
                    type="select"
                    options={Object.keys(Transmission).map((key) => ({
                      value: key,
                      label: key.replace(/_/g, ' '),
                    }))}
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} h-10`}
                  />
                  <CreateFormField
                    name="engine"
                    label="Engine (Optional)"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., 2.0L Turbo"
                  />
                  <CreateFormField
                    name="exteriorColor"
                    label="Exterior Color (Optional)"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., Blue"
                  />
                  <CreateFormField
                    name="interiorColor"
                    label="Interior Color (Optional)"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="e.g., Black Leather"
                  />
                  <CreateFormField
                    name="description"
                    label="Description"
                    type="textarea"
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} min-h-[100px] resize-y`}
                    placeholder="Provide a detailed description of the car..."
                  />
                </div>
                
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                  isSubmitting={submitting}
                  isLastStep={false}
                />
              </FormStep>

              
              <FormStep 
                title="Features & Photos" 
                icon={<Sparkles size={20} />}
                isActive={currentStep === 3}
                isCompleted={completedSteps.includes(3)}
                stepNumber={3}
                totalSteps={totalSteps}
                onStepClick={goToStep}
              >
                <div className="space-y-6">
                  <div>
                    <CreateFormField
                      name="features"
                      label="Features (comma-separated)"
                      type="text"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      placeholder="e.g., Bluetooth, Sunroof, Navigation"
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("features", value.split(',').map(f => f.trim()).filter(f => f !== ''));
                      }}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.watch("features")?.map((feature, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#1E3A8A]/30 text-[#60A5FA] border-[#1E3A8A] px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" />
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                            className="ml-1 hover:bg-[#1E3A8A] rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <CustomFormField
                      name="photoUrls" 
                      label="Upload Photos"
                      type="file"
                      accept="image/*"
                      multiple
                      labelClassName={labelStyle}
                      inputClassName="hidden" 
                      onChange={handleFileChange} 
                      render={({ field }) => ( 
                        <div className="mt-2">
                          <label
                            htmlFor={field.name}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#1E2A45] rounded-lg cursor-pointer bg-[#0B1120]/50 hover:bg-[#0B1120] transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-[#4F9CF9]" />
                              <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                            <input
                              id={field.name}
                              type="file"
                              className="hidden"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                field.onChange(e.target.files); 
                                handleFileChange(e);             
                              }}
                            />
                          </label>
                        </div>
                      )}
                    />

                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Selected car files ({uploadedFiles.length}):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative bg-[#0B1120] rounded-md p-1 h-20 flex items-center justify-center overflow-hidden"
                            >
                              <Image
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index}`}
                                width={300}
                                height={200}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                  isSubmitting={submitting}
                  isLastStep={false}
                />
              </FormStep>

              
              <FormStep 
                title="Dealership Information" 
                icon={<MapPin size={20} />}
                isActive={currentStep === 4}
                isCompleted={completedSteps.includes(4)}
                stepNumber={4}
                totalSteps={totalSteps}
                onStepClick={goToStep}
              >
                <div className="space-y-4">
                  <CreateFormField
                    name="dealershipId"
                    label="Dealership ID"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="Enter Dealership ID"
                  />
                </div>
                
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                  isSubmitting={submitting}
                  isLastStep={true}
                />
              </FormStep>

              
              <div className="mt-8 mb-4 bg-[#0B1120]/80 p-4 rounded-lg border border-[#1E2A45] shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-white">Form Progress</h3>
                  <span className="text-sm text-blue-400">
                    {completedSteps.length} of {totalSteps} steps completed
                  </span>
                </div>
                <Progress 
                  value={(completedSteps.length / totalSteps) * 100} 
                  className="h-2 bg-[#1E2A45]" 
                />
                
                
                <div className="flex justify-between mt-2">
                  {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isCompleted = completedSteps.includes(stepNum);
                    
                    return (
                      <div 
                        key={stepNum} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isCompleted ? 'bg-green-500 text-white' : 'bg-[#1E2A45] text-gray-400'} cursor-pointer transition-colors`}
                        onClick={() => {
                          
                          if (isCompleted || stepNum === Math.min(currentStep + 1, totalSteps)) {
                            setCurrentStep(stepNum);
                          } else if (stepNum < currentStep) {
                            setCurrentStep(stepNum);
                          }
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={14} /> : stepNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewCar; 

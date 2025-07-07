"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Fuel, Gauge, Car, MapPin, Phone, Heart, Share2, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCarQuery, useAddFavoriteCarMutation, useRemoveFavoriteCarMutation } from "@/state/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import TestDriveForm from "@/components/forms/TestDriveForm";
import ReserveCarForm from "@/components/forms/ReserveCarForm";
import CarReviewForm from "@/components/forms/CarReviewForm";
import CarReviews from "@/components/CarReviews";

const CarDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const carId = parseInt(params.id as string);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTestDriveFormOpen, setIsTestDriveFormOpen] = useState(false);
  const [isReserveFormOpen, setIsReserveFormOpen] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  
  const { data: car, isLoading, error } = useGetCarQuery(carId);
  
  
  const [addFavorite] = useAddFavoriteCarMutation();
  const [removeFavorite] = useRemoveFavoriteCarMutation();

  const formatPrice = (price: number) => {
    return `R ${price.toLocaleString()}`;
  };

  const handleScheduleTestDrive = () => {
    console.log("Schedule test drive button clicked");
    setIsTestDriveFormOpen(true);
  };

  const handleContactDealer = () => {
    console.log("Reserve car button clicked");
    setIsReserveFormOpen(true);
  };

  const handleWriteReview = () => {
    console.log("Write review button clicked");
    setIsReviewFormOpen(true);
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite({ cognitoId: "temp-user-id", carId }).unwrap();
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addFavorite({ cognitoId: "temp-user-id", carId }).unwrap();
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car?.year} ${car?.make} ${car?.model}`,
        text: `Check out this ${car?.year} ${car?.make} ${car?.model} for ${formatPrice(car?.price || 0)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  
  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Car not found</p>
          <Button onClick={() => router.push('/cars')}>Back to Cars</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cars
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              
              <div className="relative h-64 md:h-96">
                <Image
                  src={car.photoUrls?.[selectedImageIndex] || "/placeholder.jpg"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`bg-white/90 hover:bg-white ${isFavorite ? 'text-red-500' : 'text-gray-700'}`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-700"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                {car.photoUrls && car.photoUrls.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedImageIndex + 1} of {car.photoUrls.length}
                  </div>
                )}
              </div>

              
              {car.photoUrls && car.photoUrls.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex gap-2 overflow-x-auto">
                    {car.photoUrls.slice(0, 6).map((photo, index) => (
                      <div
                        key={index}
                        className={`relative w-20 h-16 rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 ${
                          selectedImageIndex === index 
                            ? 'ring-2 ring-blue-500 opacity-100' 
                            : 'hover:opacity-80'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={photo}
                          alt={`${car.make} ${car.model} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {car.photoUrls.length > 6 && (
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          +{car.photoUrls.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-2xl">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                  <div className="text-center">
                    <Gauge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mileage</p>
                    <p className="font-semibold">{car.mileage?.toLocaleString() || 0} km</p>
                  </div>
                  <div className="text-center">
                    <Fuel className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                    <p className="font-semibold">{car.fuelType}</p>
                  </div>
                  <div className="text-center">
                    <Car className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transmission</p>
                    <p className="font-semibold">{car.transmission}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                
                {car.features && car.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Features & Equipment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            
            <CarReviews carId={carId} />
          </div>

          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {car.year} {car.make} {car.model}
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        {car.status}
                      </Badge>
                      {car.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{car.averageRating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-4xl font-bold text-[#00acee]">
                      {formatPrice(car.price)}
                    </p>
                  </div>

                  <Separator className="mb-6" />

                  
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-[#00acee] hover:bg-[#0099d4] text-white py-3 text-lg font-semibold"
                      onClick={handleScheduleTestDrive}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Schedule Test Drive
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-[#00acee] text-[#00acee] hover:bg-[#00acee] hover:text-white py-3 text-lg font-semibold"
                      onClick={handleContactDealer}
                    >
                      Reserve Car
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white py-3 text-lg font-semibold"
                      onClick={handleWriteReview}
                    >
                      <Star className="mr-2 h-5 w-5" />
                      Write Review
                    </Button>

                    <Button
                      variant="ghost"
                      className={`w-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isFavorite ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                      }`}
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  
                  {car.dealershipId && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Dealership</h3>
                      <div className="space-y-2">
                        <p className="font-medium">Dealership ID: {car.dealershipId}</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Contact dealer for more information
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      
      {car && (
        <TestDriveForm
          isOpen={isTestDriveFormOpen}
          onClose={() => setIsTestDriveFormOpen(false)}
          carId={carId}
          carDetails={{
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
          }}
        />
      )}

      
      {car && (
        <ReserveCarForm
          isOpen={isReserveFormOpen}
          onClose={() => setIsReserveFormOpen(false)}
          carId={carId}
          carDetails={{
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
          }}
        />
      )}

      
      {car && (
        <CarReviewForm
          isOpen={isReviewFormOpen}
          onClose={() => setIsReviewFormOpen(false)}
          carId={carId}
          carDetails={{
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
          }}
        />
      )}
    </div>
  );
};

export default CarDetailPage;

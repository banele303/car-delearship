"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, DollarSign, Heart, Share2, Calendar, Gauge, Fuel, Car, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCarQuery, useAddFavoriteCarMutation, useRemoveFavoriteCarMutation, useGetCarsQuery } from "@/state/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReserveCarForm from "@/components/forms/ReserveCarForm";

const CarDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const carId = parseInt(params.id as string);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReserveFormOpen, setIsReserveFormOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // (Moved car queries above photos usage to avoid ReferenceError)

  
  const { data: car, isLoading, error } = useGetCarQuery(carId);
  // Fetch a small list of recent cars (excluding current) for the bottom section
  const { data: recentCars } = useGetCarsQuery({ limit: 8 });
  // Derive photos only after car is available (fallback to placeholder)
  const photos = car?.photoUrls && car.photoUrls.length > 0 ? car.photoUrls : ["/placeholder.jpg"];

  const goPrev = useCallback(() => {
    if (!photos.length) return;
    setSelectedImageIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    setLightboxIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    if (!photos.length) return;
    setSelectedImageIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
    setLightboxIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen, goNext, goPrev]);
  
  
  const [addFavorite] = useAddFavoriteCarMutation();
  const [removeFavorite] = useRemoveFavoriteCarMutation();

  const formatPrice = (price: number) => {
    return `R ${price.toLocaleString()}`;
  };

  const handleApplyForFinancing = () => {
    try {
      console.log("Apply for financing button clicked");
      
      // Store car details in localStorage to be used on the financing page
      if (car) {
        const carDetails = {
          carId: carId,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          condition: car.condition, // NEW / USED / etc.
          mileage: car.mileage,
          fuelType: car.fuelType,
            transmission: car.transmission,
          carType: car.carType,
          exteriorColor: car.exteriorColor,
          interiorColor: car.interiorColor,
          status: car.status,
          vin: car.vin
        };
        localStorage.setItem("financingCarDetails", JSON.stringify(carDetails));
      }
      
      // Redirect to financing page
      router.push("/financing");
    } catch (error) {
      console.error("Error in handleApplyForFinancing:", error);
      toast.error("Failed to navigate to financing page");
    }
  };

  const handleContactDealer = () => {
    console.log("Reserve car button clicked");
    setIsReserveFormOpen(true);
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
      <Loader2 className="h-12 w-12 animate-spin text-[#00A211] mx-auto mb-4" />
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
          
          <div className="lg:col-span-2 space-y-6">
            {/* Main image area with constrained max width and subtle decorations */}
            <div className="relative mx-auto w-full max-w-4xl">
              <div className="group rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <div className="relative aspect-[16/9] cursor-pointer" onClick={(e) => {
                  // avoid triggering from button clicks
                  if ((e.target as HTMLElement).closest('button')) return;
                  openLightbox(selectedImageIndex);
                }}>
                  <Image
                    src={photos[selectedImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                  {/* Navigation Arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        aria-label="Previous image"
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                      </button>
                      <button
                        aria-label="Next image"
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className={`bg-white/90 hover:bg-white shadow-sm ${isFavorite ? 'text-red-500' : 'text-gray-700'}`}
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-gray-700 shadow-sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {car.photoUrls && car.photoUrls.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                      {selectedImageIndex + 1} / {car.photoUrls.length}
                    </div>
                  )}
                  {/* Decorative glow */}
                  <div className="absolute -inset-1 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00A211]/20 via-transparent to-[#00A211]/20 blur-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
      {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
        {photos.slice(0, 8).map((photo, index) => (
                  <button
                    type="button"
                    key={index}
                    className={`relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-[#00A211] border-[#00A211]/50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#00A211]/60'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={photo}
                      alt={`${car.make} ${car.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 ring-2 ring-[#00A211] rounded-xl pointer-events-none" />
                    )}
                  </button>
                ))}
        {photos.length > 8 && (
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-300">
          +{photos.length - 8}
                  </div>
                )}
              </div>
            )}

            
            <Card className="mt-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#00A211] to-[#00A211]/60">
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center group">
                    <Calendar className="h-8 w-8 text-[#00A211] mx-auto mb-2 transition-transform group-hover:scale-110" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                  <div className="text-center group">
                    <Gauge className="h-8 w-8 text-[#00A211] mx-auto mb-2 transition-transform group-hover:scale-110" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mileage</p>
                    <p className="font-semibold">{car.mileage?.toLocaleString() || 0} km</p>
                  </div>
                  <div className="text-center group">
                    <Fuel className="h-8 w-8 text-[#00A211] mx-auto mb-2 transition-transform group-hover:scale-110" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                    <p className="font-semibold">{car.fuelType}</p>
                  </div>
                  <div className="text-center group">
                    <Car className="h-8 w-8 text-[#00A211] mx-auto mb-2 transition-transform group-hover:scale-110" />
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
                          <Shield className="h-4 w-4 text-[#00A211]" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            
            {/* Customer Reviews section removed as requested */}

            {/* Recent Vehicles Section */}
            {recentCars && recentCars.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00A211] to-[#00A211]/60">Recent Vehicles</h2>
                </div>
                <div className="relative">
                  <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {recentCars
                      .filter(rc => rc.id !== car.id)
                      .slice(0, 10)
                      .map(rc => (
                        <motion.div
                          key={rc.id}
                          whileHover={{ y: -6 }}
                          className="group relative w-64 flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all"
                          onClick={() => router.push(`/cars/${rc.id}`)}
                        >
                          <div className="relative h-40 w-full overflow-hidden">
                            <Image
                              src={rc.photoUrls?.[0] || '/placeholder.jpg'}
                              alt={`${rc.make} ${rc.model}`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                            <div className="absolute top-2 left-2 flex gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#00A211]/90 text-white shadow">{rc.status}</span>
                              {rc.averageRating && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-400/90 text-black flex items-center gap-1">
                                  <Star className="h-3 w-3" /> {rc.averageRating}
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-sm font-semibold text-white drop-shadow">{rc.year} {rc.make}</p>
                              <p className="text-xs text-white/80 line-clamp-1">{rc.model}</p>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-lg font-bold text-[#00A211]">R {rc.price.toLocaleString()}</p>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2 gap-y-1">
                              <span>{(rc.mileage || 0).toLocaleString()} km</span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span>{rc.fuelType}</span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span>{rc.transmission}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <button
                                className="text-xs font-medium px-3 py-1 rounded-full bg-[#00A211]/10 text-[#00A211] hover:bg-[#00A211]/20 transition-colors"
                                onClick={(e) => { e.stopPropagation(); router.push(`/cars/${rc.id}`); }}
                              >
                                View
                              </button>
                              <div className="h-2 w-2 rounded-full bg-[#00A211]/60 group-hover:scale-125 transition-transform" />
                            </div>
                          </div>
                          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#00A211]/30 via-transparent to-[#00A211]/30 blur-sm" />
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            )}
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
                    <p className="text-4xl font-bold text-[#00A211]">
                      {formatPrice(car.price)}
                    </p>
                  </div>

                  <Separator className="mb-6" />

                  
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-[#00A211] hover:bg-[#00870E] text-white py-3 text-lg font-semibold shadow-sm hover:shadow-md transition-colors"
                      onClick={handleApplyForFinancing}
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      Apply for Financing
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-[#00A211] text-[#00A211] hover:bg-[#00A211] hover:text-white py-3 text-lg font-semibold transition-colors"
                      onClick={handleContactDealer}
                    >
                      Interested Inquire
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
                          <DollarSign className="h-4 w-4 text-gray-500" />
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

      
  {/* Removed FinancingForm modal as we now redirect to the financing page */}

      
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

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
          >
            <div className="absolute inset-0" onClick={closeLightbox} />
            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
              <div className="relative w-full max-w-6xl aspect-[16/9]">
                <Image
                  src={photos[lightboxIndex]}
                  alt={`Photo ${lightboxIndex + 1}`}
                  fill
                  className="object-contain select-none"
                  priority
                />
              </div>
              {photos.length > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button
                    aria-label="Next image"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </>
              )}
              <button
                aria-label="Close lightbox"
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </div>
            {photos.length > 1 && (
              <div className="relative z-10 flex gap-2 px-6 pb-6 overflow-x-auto">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border ${i === lightboxIndex ? 'border-[#00A211] ring-2 ring-[#00A211]' : 'border-white/20 hover:border-white/40'}`}
                    onClick={() => { setLightboxIndex(i); setSelectedImageIndex(i); }}
                  >
                    <Image src={p} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 tracking-wide">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetailPage;

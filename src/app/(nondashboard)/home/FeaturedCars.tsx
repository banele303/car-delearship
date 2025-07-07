"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Car, Fuel, Calendar, Clock, Heart, MapPin, ArrowRight, Phone, Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useGetCarsQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import TestDriveForm from "@/components/forms/TestDriveForm";
import ReserveCarForm from "@/components/forms/ReserveCarForm";

const FeaturedCars = () => {
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isTestDriveFormOpen, setIsTestDriveFormOpen] = useState(false);
  const [isReserveFormOpen, setIsReserveFormOpen] = useState(false);
  
  // Fetch cars from the API - limit to 6 featured cars
  const { data: cars, isLoading, error } = useGetCarsQuery({ 
    limit: 6,
    featured: true // You can add this filter to your API if needed
  });

  const formatPrice = (price: number) => {
    // Simple, consistent formatting that won't cause hydration issues
    return `R ${price.toLocaleString('en-US')}`;
  };

  const handleViewDetails = (carId: number) => {
    router.push(`/cars/${carId}`);
  };

  const handleViewAllCars = () => {
    router.push('/cars');
  };

  const handleScheduleTestDrive = (car: any) => {
    setSelectedCar(car);
    setIsTestDriveFormOpen(true);
  };

  const handleReserveCar = (car: any) => {
    setSelectedCar(car);
    setIsReserveFormOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our handpicked selection of premium vehicles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Sorry, we couldn&apos;t load the featured vehicles at this time.
            </p>
            <Button 
              onClick={handleViewAllCars}
              className="bg-[#00acee] hover:bg-[#0099d4] text-white px-8 py-3"
            >
              <Car size={20} className="mr-2" />
              View All Cars
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const featuredCars = cars?.slice(0, 6) || [];

  // Debug: Log the first car to see the data structure
  if (featuredCars.length > 0) {
    console.log("First car data:", featuredCars[0]);
    console.log("First car photoUrls:", featuredCars[0].photoUrls);
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Vehicles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our handpicked selection of premium vehicles
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={car.photoUrls && car.photoUrls.length > 0 ? car.photoUrls[0] : "/placeholder.jpg"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.log("Image failed to load:", car.photoUrls?.[0]);
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
                <div className="absolute top-4 left-4 bg-[#00acee] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {car.condition || "Available"}
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                  <Heart size={20} className="text-gray-600" />
                </button>
              </div>

              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <div className="text-2xl font-bold text-[#00acee]">
                    {formatPrice(car.price)}
                  </div>
                </div>

                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-1" />
                    {car.year}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="mr-1" />
                    {car.mileage?.toLocaleString() || 0} km
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Fuel size={16} className="mr-1" />
                    {car.fuelType || "Petrol"}
                  </div>
                </div>

                
                {(car as any).dealership && (
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <MapPin size={16} className="mr-1" />
                      {(car as any).dealership.city}, {(car as any).dealership.state}
                    </div>
                  </div>
                )}

                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {car.features?.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                      >
                        {feature}
                      </span>
                    )) || (
                      /* Default features if none are specified */
                      <React.Fragment>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                          {car.transmission || "Manual"}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                          {car.exteriorColor || "Various"}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                          {car.engine || "Standard"}
                        </span>
                      </React.Fragment>
                    )}
                    {car.features && car.features.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{car.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(car.id)}
                    className="border-[#00acee] text-[#00acee] hover:bg-[#00acee] hover:text-white"
                  >
                    View Details
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleScheduleTestDrive(car)}
                      className="bg-[#00acee] hover:bg-[#0099d4] text-white"
                    >
                      <CalendarIcon size={14} className="mr-1" />
                      Test Drive
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleReserveCar(car)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Phone size={14} className="mr-1" />
                      Reserve
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button 
            size="lg"
            onClick={handleViewAllCars}
            className="bg-[#00acee] hover:bg-[#0099d4] text-white px-8 py-3"
          >
            <Car size={20} className="mr-2" />
            View All Cars
          </Button>
        </motion.div>
      </div>

      
      {selectedCar && (
        <TestDriveForm
          isOpen={isTestDriveFormOpen}
          onClose={() => setIsTestDriveFormOpen(false)}
          carId={selectedCar.id}
          carDetails={{
            make: selectedCar.make,
            model: selectedCar.model,
            year: selectedCar.year,
            price: selectedCar.price,
          }}
        />
      )}

      
      {selectedCar && (
        <ReserveCarForm
          isOpen={isReserveFormOpen}
          onClose={() => setIsReserveFormOpen(false)}
          carId={selectedCar.id}
          carDetails={{
            make: selectedCar.make,
            model: selectedCar.model,
            year: selectedCar.year,
            price: selectedCar.price,
          }}
        />
      )}
    </section>
  );
};

export default FeaturedCars;

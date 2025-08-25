"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Car, Camera, Gauge, Cog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  // Fetch all cars (featured or not)
  const { data: cars, isLoading, error } = useGetCarsQuery({});

  const formatPrice = (price: number) => `R ${price.toLocaleString("en-US")}`;

  const handleViewAllCars = () => router.push("/cars");
  const handleScheduleTestDrive = (car: any) => { setSelectedCar(car); setIsTestDriveFormOpen(true); };
  const handleReserveCar = (car: any) => { setSelectedCar(car); setIsReserveFormOpen(true); };

  const Skeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 overflow-hidden">
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-5">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
        <div className="h-7 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">All Cars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">All Cars</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Sorry, we couldn't load the cars at this time.</p>
            <Button onClick={handleViewAllCars} className="bg-[#00A211] hover:brightness-110 text-white px-8 py-3">
              <Car size={20} className="mr-2" /> View All Cars
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const allCars = cars || [];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">All Cars</h2>
        </motion.div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCars.map((car: any, index: number) => (
            <motion.div key={car.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-[#00A211]/50 transition-all duration-300">
              <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700">
                <Image src={Array.isArray(car.photoUrls) && car.photoUrls.length > 0 ? car.photoUrls[0] : "/placeholder.jpg"} alt={`${car.make} ${car.model}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                {Array.isArray(car.photoUrls) && car.photoUrls.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                    <Camera size={14} /> {car.photoUrls.length}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  <Link
                    href={`/cars/${car.id}`}
                    aria-label={`View details for ${car.year} ${car.make} ${car.model}`}
                    className="block hover:text-[#00A211] focus:outline-none focus:ring-2 focus:ring-[#00A211]/40 rounded-sm transition-colors"
                  >
                    {car.year} {car.make} {car.model}
                  </Link>
                </h3>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(car.price)}
                </div>

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center rounded-md bg-[#00A211] text-white px-3 py-1 font-semibold">{car.year}</span>
                    <span className="inline-flex items-center text-gray-600 dark:text-gray-300">
                      <Gauge size={14} className="mr-1 opacity-70" /> {car.mileage ? `${car.mileage.toLocaleString()} km` : "—"}
                    </span>
                    <span className="inline-flex items-center text-gray-600 dark:text-gray-300">
                      <Cog size={14} className="mr-1 opacity-70" /> {car.transmission || "Manual"}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    className="w-full h-11 bg-[#00A211] hover:brightness-110 text-white rounded-xl font-semibold"
                    onClick={() => handleReserveCar(car)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }} className="text-center mt-12">
          <Button size="lg" onClick={handleViewAllCars} className="bg-[#00A211] hover:brightness-110 text-white px-8 py-3">
            <Car size={20} className="mr-2" /> View All Cars
          </Button>
        </motion.div>
      </div>

      {selectedCar && (
        <TestDriveForm
          isOpen={isTestDriveFormOpen}
          onClose={() => setIsTestDriveFormOpen(false)}
          carId={selectedCar.id}
          carDetails={{ make: selectedCar.make, model: selectedCar.model, year: selectedCar.year, price: selectedCar.price }}
        />
      )}

      {selectedCar && (
        <ReserveCarForm
          isOpen={isReserveFormOpen}
          onClose={() => setIsReserveFormOpen(false)}
          carId={selectedCar.id}
          carDetails={{ make: selectedCar.make, model: selectedCar.model, year: selectedCar.year, price: selectedCar.price }}
        />
      )}
    </section>
  );
};

export default FeaturedCars;

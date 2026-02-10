"use client";
import React, { useState } from "react";
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
  const { data: cars, isLoading, error, refetch, isError } = useGetCarsQuery({});

  // Pagination (client-side) for All Cars section
  const pageSize = 12; // display about 12 cards per page
  const [currentPage, setCurrentPage] = useState(1);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    const err: any = error;
    const status = err?.status ?? err?.originalStatus;
    const message = typeof err?.data === 'string' ? err.data : (err?.data?.message || err?.error || 'Unknown error');
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Sorry, we couldn&apos;t load the cars at this time.</p>
            <div className="max-w-xl mx-auto text-left text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4 mb-6 text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">Debug Info:</p>
              <p>Status: {status ?? 'N/A'}</p>
              <p className="break-all">Message: {message}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => refetch()} variant="outline" className="border-[#00A211] text-[#00A211] hover:bg-[#00A211] hover:text-white px-6 py-3">
                Retry
              </Button>
              <Button onClick={handleViewAllCars} className="bg-[#00A211] hover:brightness-110 text-white px-8 py-3">
                <Car size={20} className="mr-2" /> Browse Cars
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const allCars = cars || [];
  const totalPages = Math.ceil(allCars.length / pageSize) || 1;
  const paginatedCars = allCars.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const goToPage = (p: number) => {
    setCurrentPage(p);
    // Scroll to top of section when page changes for better UX
    if (typeof window !== 'undefined') {
      const el = document.getElementById('all-cars-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
  <section id="all-cars-section" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCars.map((car: any) => (
            <div
              key={car.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-[#00A211]/50 transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00A211]/40"
              onClick={() => router.push(`/cars/${car.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); router.push(`/cars/${car.id}`); } }}
              aria-label={`View details for ${car.year} ${car.make} ${car.model}`}
            >
              <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700">
                <Image
                  src={Array.isArray(car.photoUrls) && car.photoUrls.length > 0 ? car.photoUrls[0] : "/placeholder.jpg"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
                {Array.isArray(car.photoUrls) && car.photoUrls.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                    <Camera size={14} /> {car.photoUrls.length}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#00A211] transition-colors">
                  {car.year} {car.make} {car.model}
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
                    onClick={(e) => { e.stopPropagation(); handleReserveCar(car); }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {allCars.length > pageSize && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >Prev</Button>
              {Array.from({ length: totalPages }).slice(0, 8).map((_, i) => {
                const pageNumber = i + 1;
                if (totalPages > 8) {
                  const shouldShow = pageNumber <= 2 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1;
                  if (!shouldShow) {
                    if (pageNumber === 3 || pageNumber === totalPages - 1) {
                      return <span key={pageNumber} className="px-2 text-gray-400">…</span>;
                    }
                    return null;
                  }
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(pageNumber)}
                  >{pageNumber}</Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >Next</Button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</div>
            <Button size="sm" onClick={handleViewAllCars} className="bg-[#00A211] hover:brightness-110 text-white px-6">
              <Car size={16} className="mr-2" /> Full Inventory
            </Button>
          </div>
        )}
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

"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const FeaturedDealer = () => {
  const dealerships = [
    {
      id: 1,
  name: "Advanced Auto Trader Johannesburg",
      address: "123 Main Street, Sandton, Johannesburg",
      phone: "+27 11 123 4567",
      email: "jhb@sacar.co.za",
      hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-4PM, Sun: Closed",
      rating: 4.8,
      reviews: 324,
      image: "/placeholder.jpg",
      specialties: ["Luxury Cars", "Electric Vehicles", "Financing"]
    },
    {
      id: 2,
  name: "Advanced Auto Trader Cape Town",
      address: "456 Waterfront Drive, V&A Waterfront, Cape Town",
      phone: "+27 21 456 7890",
      email: "cpt@sacar.co.za",
      hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-4PM, Sun: Closed",
      rating: 4.9,
      reviews: 256,
      image: "/placeholder.jpg",
      specialties: ["Premium SUVs", "Sports Cars", "Trade-ins"]
    },
    {
      id: 3,
  name: "Advanced Auto Trader Pretoria",
      address: "789 Church Street, Pretoria Central",
      phone: "+27 12 789 0123",
      email: "pta@sacar.co.za",
      hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-4PM, Sun: Closed",
      rating: 4.7,
      reviews: 189,
      image: "/placeholder.jpg",
      specialties: ["Family Cars", "Commercial Vehicles", "Service"]
    }
  ];

  // Pick unique random images from public/ for each dealership card
  const cityImages = [
    "/Johannesburg.jpg",
    "/durban.png",
    "/pretoria.png",
    "/Bloemfontein.jpg",
  ];

  const randomImages = useMemo(() => {
    const shuffled = [...cityImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, dealerships.length);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Dealership Locations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visit one of our premium locations across South Africa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {dealerships.map((dealer, index) => (
            <motion.div
              key={dealer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={randomImages[index] || "/landing-discover-bg.jpg"}
                  alt={`${dealer.name} exterior`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{dealer.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="text-sm">{dealer.rating} ({dealer.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              
              <div className="p-6">
                
                <div className="flex items-start mb-3">
                  <MapPin size={18} className="text-[#00A211] mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {dealer.address}
                  </span>
                </div>

                
                <div className="flex items-center mb-3">
                  <Phone size={18} className="text-[#00A211] mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {dealer.phone}
                  </span>
                </div>

                
                <div className="flex items-center mb-3">
                  <Mail size={18} className="text-[#00A211] mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {dealer.email}
                  </span>
                </div>

                
                <div className="flex items-start mb-4">
                  <Clock size={18} className="text-[#00A211] mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {dealer.hours}
                  </span>
                </div>

                
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Specialties:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dealer.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="bg-[#00A211]/10 dark:bg-[#00A211]/20 text-[#00780d] dark:text-[#00A211] px-2 py-1 rounded-md text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#00A211] text-[#00A211] hover:bg-[#00A211] hover:text-white"
                  >
                    Get Directions
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-[#00A211] hover:brightness-110 text-white"
                  >
                    Contact Us
                  </Button>
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
            className="bg-[#00A211] hover:brightness-110 text-white px-8 py-3"
          >
            <MapPin size={20} className="mr-2" />
            Find All Locations
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDealer;

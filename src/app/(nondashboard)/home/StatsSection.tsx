"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Users, Award, MapPin } from "lucide-react";

const StatsSection = () => {
  const [dynamicStats, setDynamicStats] = useState({
    vehicles: "500+",
    dealerships: "5"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        
        const carsResponse = await fetch('/api/cars');
        if (carsResponse.ok) {
          const cars = await carsResponse.json();
          const vehicleCount = cars.length;
          setDynamicStats(prev => ({
            ...prev,
            vehicles: vehicleCount > 0 ? `${vehicleCount}+` : "500+"
          }));
        }

        
        const dealershipsResponse = await fetch('/api/dealerships');
        if (dealershipsResponse.ok) {
          const dealerships = await dealershipsResponse.json();
          const dealershipCount = dealerships.length;
          setDynamicStats(prev => ({
            ...prev,
            dealerships: dealershipCount > 0 ? dealershipCount.toString() : "5"
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      icon: <Car size={32} />,
      number: dynamicStats.vehicles,
      label: "Premium Vehicles",
      description: "Quality cars in our inventory"
    },
    {
      icon: <Users size={32} />,
      number: "10,000+",
      label: "Happy Customers",
      description: "Satisfied with our service"
    },
    {
      icon: <Award size={32} />,
      number: "15+",
      label: "Years Experience",
      description: "In automotive industry"
    },
    {
      icon: <MapPin size={32} />,
      number: dynamicStats.dealerships,
      label: "Dealership Locations",
      description: "Across South Africa"
    }
  ];

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
            Why Choose SaCar Dealership?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Leading South Africa in quality automotive sales with unmatched customer service
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-[#00acee] mb-4 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Cape Town",
      rating: 5,
      comment: "Exceptional service from start to finish! The team at SaCar helped me find the perfect BMW for my family. Professional, knowledgeable, and honest throughout the entire process.",
      image: "/placeholder.jpg",
      car: "2023 BMW X5"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Johannesburg",
      rating: 5,
      comment: "I've bought 3 cars from SaCar over the years. They consistently deliver quality vehicles and outstanding customer service. The financing options made it very affordable.",
      image: "/placeholder.jpg",
      car: "2024 Mercedes C-Class"
    },
    {
      id: 3,
      name: "Priya Patel",
      location: "Pretoria",
      rating: 5,
      comment: "As a first-time car buyer, I was nervous about the process. The SaCar team was patient, explained everything clearly, and helped me get a great deal on my Toyota Prius.",
      image: "/placeholder.jpg",
      car: "2023 Toyota Prius"
    },
    {
      id: 4,
      name: "David van der Merwe",
      location: "Durban",
      rating: 5,
      comment: "The trade-in value they offered for my old car was very fair, and the new Audi I purchased has been fantastic. Highly recommend SaCar to anyone looking for quality vehicles.",
      image: "/placeholder.jpg",
      car: "2024 Audi A4"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from satisfied customers who found their perfect car with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              
              <div className="text-[#00acee] mb-4">
                <Quote size={32} />
              </div>

              
              <div className="mb-4">
                {renderStars(testimonial.rating)}
              </div>

              
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-sm leading-relaxed">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              
              <div className="flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/placeholder.jpg"
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.location}
                  </div>
                  <div className="text-xs text-[#00acee] font-medium">
                    Purchased: {testimonial.car}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-[#00acee]/10 to-blue-600/10 dark:from-[#00acee]/20 dark:to-blue-600/20 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-[#00acee] mb-2">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#00acee] mb-2">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#00acee] mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">5-Star Reviews</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

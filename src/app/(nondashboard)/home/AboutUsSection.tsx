"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutUsSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-gray-950" aria-labelledby="about-heading">
      <div className="container mx-auto px-6 lg:px-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-gray-700 dark:text-gray-300"
        >
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--primary))_100%)]">
            About Us
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
            <p>
              Advance Auto is a trusted dealership with clients from all corners of the country. Located at 2A Amanda Avenue in Gleneagles - Joburg South, we take pride in selling affordable and quality cars. We are happy to be at your service and look forward to helping you buy your next car with us.
            </p>
            <p>
              We understand that mobility is a need and buying a car is one of the biggest commitments. Buying a car with us unlocks and creates opportunities for you. Mobility provides sense of pride, comfort and convenience. It widens our perspective and also gives us memories to cherish forever.
            </p>
            <p>
              Come to Advance Auto for best service and customer experience!!!
            </p>
            <p className="font-semibold mt-8">Advance Auto<br/>Cars You Can Trust</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

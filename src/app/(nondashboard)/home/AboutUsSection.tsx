"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutUsSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden" aria-labelledby="about-heading">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_40%_40%,#16a34a,transparent_60%)]" />
      <div className="container mx-auto px-6 lg:px-10 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Image side (restored) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary))_0%,transparent_70%)] rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-emerald-500/10 shadow-xl h-[300px] sm:h-[340px] md:h-[380px] lg:h-[420px] xl:h-[440px]">
              <Image
                src="/about-image.jpeg"
                alt="Advance Auto dealership overview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0" />
              <div className="absolute bottom-4 left-4 text-white drop-shadow">
                <p className="text-sm font-medium tracking-wide uppercase">Since 2024</p>
                <p className="text-xs text-emerald-100">Driven by trust & service</p>
              </div>
            </div>
          </motion.div>
          {/* Content side with updated text only */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 id="about-heading" className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--primary))_100%)]">About Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg max-w-xl">
              Advance Auto is a trusted dealership with clients from all corners of the country. Located at 2A Amanda Avenue in Gleneagles - Joburg South, we take pride in selling affordable and quality cars. We are happy to be at your service and look forward to helping you buy your next car with us.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              We understand that mobility is a need and buying a car is one of the biggest commitments. Buying a car with us unlocks and creates opportunities for you. Mobility provides sense of pride, comfort and convenience. It widens our perspective and also gives us memories to cherish forever.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              Come to Advance Auto for best service and customer experience!!!
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Advance Auto<br/>Cars You Can Trust</p>
            <div className="grid sm:grid-cols-3 gap-5 pt-4">
              {[
                { label: 'Vehicles Curated', value: '500+' },
                { label: 'Customer Rating', value: '4.9★' },
                { label: 'Avg. Delivery Time', value: '48h' }
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 dark:bg-[hsl(var(--primary))]/10 px-4 py-5 backdrop-blur-sm">
                  <p className="text-xl font-semibold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">{stat.value}</p>
                  <p className="text-[11px] tracking-wide uppercase font-medium text-[hsl(var(--primary))]/70 dark:text-[hsl(var(--primary))]/60">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 flex flex-wrap gap-3 text-xs font-medium">
              {['Transparent Pricing','Multi‑Point Inspection','Flexible Finance','After‑Sale Support'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/15 dark:text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30">{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

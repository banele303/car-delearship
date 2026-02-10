"use client";

import React from "react";

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-gray-950 py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-[hsl(var(--primary))]">About Us</h1>
        <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Advance Auto is a trusted dealership with clients from all corners of the country. Located at 2A Amanda Avenue in Gleneagles - Joburg South, we take pride in selling affordable and quality cars. We are happy to be at your service and look forward to helping you buy your next car with us.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          We understand that mobility is a need and buying a car is one of the biggest commitments. Buying a car with us unlocks and creates opportunities for you. Mobility provides sense of pride, comfort and convenience. It widens our perspective and also gives us memories to cherish forever.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Come to Advance Auto for best service and customer experience!!!
        </p>
        <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-semibold mt-10">Advance Auto<br/>Cars You Can Trust</p>
      </div>
    </main>
  );
}
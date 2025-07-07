import React from "react";
import HeroSection from "./HeroSection";
import CallToActionSection from "./CallToActionSection";
import FooterSection from "./FooterSection";
import FeaturedDealer from "./FeaturedDealer";
import TestimonialsSection from "./TestimonialsSection";
import FeaturedCars from "./FeaturedCars";
import StatsSection from "./StatsSection";

function Home() { 
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeaturedCars />
      <FeaturedDealer />
      <TestimonialsSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
}

export default Home; 
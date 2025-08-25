import React from "react";
import HeroSection from "./HeroSection";
import CallToActionSection from "./CallToActionSection";
import FeaturedDealer from "./FeaturedDealer";
import TestimonialsSection from "./TestimonialsSection";
import FeaturedCars from "./FeaturedCars";
import StatsSection from "./StatsSection";

function Home() { 
  return (
    <div>
      <HeroSection />
      
  <FeaturedCars />
  <StatsSection />
      <FeaturedDealer />
      <TestimonialsSection />
      <CallToActionSection />
  {/* FooterSection removed: global footer handles site-wide footer */}
    </div>
  );
}

export default Home; 
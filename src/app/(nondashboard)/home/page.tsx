import React from "react";
import HeroSection from "./HeroSection";
// CallToActionSection removed per request
import FAQShared from "@/components/FAQShared";
import FeaturedDealer from "./FeaturedDealer";
import TestimonialsSection from "./TestimonialsSection";
import FeaturedCars from "./FeaturedCars";
import ReferralCalloutSection from "./ReferralCalloutSection";
import AboutUsSection from "./AboutUsSection";
import StatsSection from "./StatsSection";

function Home() { 
  return (
    <div>
  <HeroSection />
  <FeaturedCars />
  <AboutUsSection />
  <ReferralCalloutSection />
  <StatsSection />
      <FeaturedDealer />
      <TestimonialsSection />
  <FAQShared />
    </div>
  );
}

export default Home; 
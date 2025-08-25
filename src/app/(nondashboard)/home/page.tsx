import React from "react";
import HeroSection from "./HeroSection";
// CallToActionSection removed per request
import FAQSection from "./FAQSection";
import SiteFooter from "./SiteFooter";
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
  <ReferralCalloutSection />
  <AboutUsSection />
  <StatsSection />
      <FeaturedDealer />
      <TestimonialsSection />
  <FAQSection />
  <SiteFooter />
    </div>
  );
}

export default Home; 
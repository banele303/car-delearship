"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FinancingApplicationForm from "@/components/forms/FinancingApplicationForm";
import { Button } from "@/components/ui/button";

export default function FinancingPage() {
  const handleApplyNow = () => {
    const el = document.getElementById("financing-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white">
  <section className="relative bg-gradient-to-r from-[#00A211] to-[#00780d] py-16 md:py-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Financing Application</h1>
            <p className="text-lg text-[#c6f9ce] max-w-2xl mx-auto mb-8">Complete the secure form below. Our finance team will review and contact you with the best options.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#00A211] hover:bg-gray-100" onClick={handleApplyNow}>
                Start Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#00A211]" asChild>
                <Link href="/loan-calculator">Loan Calculator</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50" id="financing-form">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Application Form</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Provide all requested information to speed up review. Fields marked with <span className="text-red-500 font-semibold">*</span> are required.</p>
          </div>
          <div id="financing-form-root">
            <FinancingApplicationForm />
          </div>
        </div>
      </section>

  {/* FooterSection removed to avoid duplicate footers (global footer already in layout) */}
    </div>
  );
}

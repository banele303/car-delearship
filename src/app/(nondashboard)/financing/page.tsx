"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  FileText, 
  CreditCard, 
  TrendingUp,
  Users,
  Shield,
  Award,
  ArrowRight,
  Percent,
  Car,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import FooterSection from "../home/FooterSection";

export default function FinancingPage() {
  // Calculator state
  const [loanAmount, setLoanAmount] = useState([250000]);
  const [downPayment, setDownPayment] = useState([50000]);
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState([9.5]);
  const [creditScore, setCreditScore] = useState("good");

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const principal = loanAmount[0] - downPayment[0];
    const monthlyRate = interestRate[0] / 100 / 12;
    const numberOfPayments = parseInt(loanTerm);
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment = monthlyPayment * parseInt(loanTerm);
  const totalInterest = totalPayment - (loanAmount[0] - downPayment[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyNow = () => {
    toast.success("Financing application started! We'll contact you soon.");
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00acee] to-[#004d71] py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-blue-200 text-sm font-medium mb-4">
                  Drive Your Dreams Today
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Car Financing Made Simple
                </h1>
                <p className="text-lg text-blue-100 max-w-lg mb-8">
                  Get pre-approved in minutes with competitive rates and flexible terms. 
                  Your perfect car is just a click away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#00acee] hover:bg-gray-100"
                    onClick={handleApplyNow}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-[#00acee]"
                  >
                    Calculate Payment
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2 flex justify-end">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Image
                  src="/hero-1.jpg"
                  alt="Car financing illustration"
                  width={600}
                  height={400}
                  className="object-cover rounded-xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Auto Loan Calculator
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate your estimated monthly payment and see how different loan terms affect your budget.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Input */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#00acee]" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Vehicle Price: {formatCurrency(loanAmount[0])}
                  </Label>
                  <Slider
                    value={loanAmount}
                    onValueChange={setLoanAmount}
                    max={1000000}
                    min={50000}
                    step={10000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>R50,000</span>
                    <span>R1,000,000</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Down Payment: {formatCurrency(downPayment[0])}
                  </Label>
                  <Slider
                    value={downPayment}
                    onValueChange={setDownPayment}
                    max={loanAmount[0] * 0.5}
                    min={0}
                    step={5000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>R0</span>
                    <span>{formatCurrency(loanAmount[0] * 0.5)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Loan Term
                  </Label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="36">36 months (3 years)</SelectItem>
                      <SelectItem value="48">48 months (4 years)</SelectItem>
                      <SelectItem value="60">60 months (5 years)</SelectItem>
                      <SelectItem value="72">72 months (6 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Interest Rate: {interestRate[0]}%
                  </Label>
                  <Slider
                    value={interestRate}
                    onValueChange={setInterestRate}
                    max={20}
                    min={5}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>20%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Credit Score
                  </Label>
                  <Select value={creditScore} onValueChange={setCreditScore}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (750+)</SelectItem>
                      <SelectItem value="good">Good (700-749)</SelectItem>
                      <SelectItem value="fair">Fair (650-699)</SelectItem>
                      <SelectItem value="poor">Poor (600-649)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Results */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#00acee]" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#00acee] text-white p-4 rounded-lg text-center">
                    <div className="text-sm opacity-90">Monthly Payment</div>
                    <div className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Loan Amount</div>
                      <div className="text-lg font-semibold">{formatCurrency(loanAmount[0] - downPayment[0])}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total Interest</div>
                      <div className="text-lg font-semibold">{formatCurrency(totalInterest)}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Payment</div>
                    <div className="text-lg font-semibold">{formatCurrency(totalPayment)}</div>
                  </div>

                  <Button 
                    className="w-full bg-[#00acee] hover:bg-[#004d71]"
                    onClick={handleApplyNow}
                  >
                    Get Pre-Approved
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Financing Options
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the financing option that best fits your needs and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Traditional Loan */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-[#00acee]" />
                </div>
                <CardTitle className="text-xl">Traditional Auto Loan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-[#00acee]">6.5% - 12%</div>
                    <Badge variant="secondary">APR</Badge>
                  </div>
                  <p className="text-gray-600">
                    Fixed monthly payments with competitive interest rates for qualified buyers.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Terms up to 72 months
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      No prepayment penalties
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Quick approval process
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lease */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-[#00acee] border-2">
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#00acee]">Popular</Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Lease Option</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-green-600">Lower</div>
                    <Badge variant="secondary">Monthly</Badge>
                  </div>
                  <p className="text-gray-600">
                    Lower monthly payments with the option to buy at the end of the lease.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      2-4 year terms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Warranty coverage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Latest models available
                    </li>
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Get Quote
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bad Credit */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Bad Credit Financing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-yellow-600">12% - 20%</div>
                    <Badge variant="secondary">APR</Badge>
                  </div>
                  <p className="text-gray-600">
                    Special financing programs for customers with credit challenges.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Credit rebuilding opportunity
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Flexible down payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Second chance approval
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Financing?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make car financing simple, fast, and affordable with our customer-first approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00acee] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Approval</h3>
              <p className="text-gray-600">Get pre-approved in as little as 60 seconds online.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00acee] rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Competitive Rates</h3>
              <p className="text-gray-600">We offer some of the lowest rates in the market.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00acee] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
              <p className="text-gray-600">Bank-level security protects your personal information.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00acee] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Our financing experts are here to help every step of the way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Application Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get financing for your dream car in just 3 easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00acee] to-[#004d71] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Apply Online</h3>
              <p className="text-gray-600 mb-4">
                Fill out our quick online application form with your basic information.
              </p>
              <FileText className="h-8 w-8 text-[#00acee] mx-auto" />
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00acee] to-[#004d71] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Pre-Approved</h3>
              <p className="text-gray-600 mb-4">
                Receive instant pre-approval and know your budget before you shop.
              </p>
              <CheckCircle className="h-8 w-8 text-[#00acee] mx-auto" />
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00acee] to-[#004d71] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Drive Away</h3>
              <p className="text-gray-600 mb-4">
                Complete the paperwork and drive away in your new car the same day.
              </p>
              <Car className="h-8 w-8 text-[#00acee] mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#00acee] to-[#004d71]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Take the first step towards owning your dream car. Get pre-approved today and shop with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-[#00acee] hover:bg-gray-100"
              onClick={handleApplyNow}
            >
              Apply for Financing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#00acee]"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call (011) 123-4567
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Have Questions? We&apos;re Here to Help
            </h2>
            <p className="text-gray-600 mb-8">
              Our financing specialists are available to answer any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#00acee]" />
                <span className="font-semibold">(011) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#00acee]" />
                <span className="font-semibold">financing@sacar.co.za</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

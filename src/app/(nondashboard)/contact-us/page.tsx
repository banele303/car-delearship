"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import FooterSection from "@/app/(nondashboard)/home/FooterSection"; 

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      
      <section className="relative h-[40vh] md:h-[50vh] bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        
        <Image
          src="/landing-splash.jpg" 
          alt="Contact Us"
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Contact SaCar Dealership</h1> 
          <p className="text-lg md:text-xl max-w-2xl text-center">
            Have questions about our cars or services? We&apos;re here to help you find your dream car.
          </p> 
        </div>
      </section>

      
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-lg">Phone</h3>
                  <p className="text-slate-600 mt-1">+27 11 123 4567</p> 
                  <p className="text-slate-600">Monday to Friday, 8am to 5pm</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-lg">Email</h3>
                  <p className="text-slate-600 mt-1">info@sacar.com</p> 
                  <p className="text-slate-600">We&apos;ll respond as soon as possible</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-lg">Our Location</h3>
                  <p className="text-slate-600 mt-1">2A Amanda Ave, Gleneagles</p>
                  <p className="text-slate-600">Johannesburg South, 2091, South Africa</p>
                  <a
                    href="https://www.google.com/maps/dir//2A+Amanda+Ave,+Gleneagles,+Johannesburg+South,+2091" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    aria-label="Get directions to our only dealership location"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
            
            
            <div className="h-[300px] rounded-xl overflow-hidden shadow-md mt-8 relative group">
              <iframe
                title="SaCar Dealership Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.502550063525!2d28.00395!3d-26.29845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef6f7f5c9c2b5b1%3A0x0000000000000000!2s2A%20Amanda%20Ave%2C%20Gleneagles%2C%20Johannesburg%20South%2C%202091%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1724544000000!5m2!1sen!2sza"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-blue-600/10 to-transparent" />
            </div>
          </div>
          
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">Send Us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700">Thank you for contacting us. We&apos;ll get back to you as soon as possible.</p>
                <Button 
                  className="mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 11 123 4567"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Inquiry about a car, test drive, financing..." 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Please provide details about your inquiry..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Find answers to the most common questions about buying a car and our services.
            </p> 
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How can I browse your car inventory?",
                answer: "You can browse our full inventory by visiting the 'Inventory' section of our website. Use the search and filter options to find the perfect car for your needs."
              },
              {
                question: "What financing options do you offer?",
                answer: "We offer a variety of financing solutions, including traditional car loans and lease options. Our finance team can help you find the best rates and terms to fit your budget. Visit our 'Financing' page for more details."
              },
              {
                question: "How do I schedule a test drive?",
                answer: "You can schedule a test drive directly from any car's detail page or by contacting us through this form. Let us know which car you're interested in and your preferred time."
              },
              {
                question: "Do you accept trade-ins?",
                answer: "Yes, we do! We offer competitive trade-in values for your current vehicle. You can get an estimate on our 'Trade-In' page or during your visit to our dealership."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <FooterSection />
    </div>
  );
}
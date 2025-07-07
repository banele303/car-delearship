"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Clock,
  Shield,
  Award,
  Users
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-[#00acee]" />
              <span className="text-2xl font-bold">SACAR</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner in finding the perfect vehicle. We offer premium cars 
              with exceptional service and unbeatable prices across South Africa.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-[#00acee] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-[#00acee] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-[#00acee] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-[#00acee] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/financing" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  Financing
                </Link>
              </li>
              <li>
                <Link href="/trade-in" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  Trade-In
                </Link>
              </li>
            </ul>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Car className="h-4 w-4 text-[#00acee]" />
                Car Sales
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Shield className="h-4 w-4 text-[#00acee]" />
                Extended Warranty
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Award className="h-4 w-4 text-[#00acee]" />
                Quality Inspection
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Users className="h-4 w-4 text-[#00acee]" />
                Customer Support
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4 text-[#00acee]" />
                Test Drives
              </li>
            </ul>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#00acee] mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>123 Main Street</p>
                  <p>Johannesburg, 2000</p>
                  <p>South Africa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00acee]" />
                <a href="tel:+27123456789" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  +27 12 345 6789
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00acee]" />
                <a href="mailto:info@sacar.co.za" className="text-gray-400 hover:text-[#00acee] transition-colors">
                  info@sacar.co.za
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00acee]" />
                <div className="text-gray-400">
                  <p>Mon - Fri: 8AM - 6PM</p>
                  <p>Sat: 9AM - 4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-[#00acee]">10K+</div>
              <div className="text-sm text-gray-400">Cars Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00acee]">98%</div>
              <div className="text-sm text-gray-400">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00acee]">15+</div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00acee]">50+</div>
              <div className="text-sm text-gray-400">Dealership Partners</div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-2 md:mb-0">
              <p>&copy; 2025 SACAR Dealership. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-[#00acee] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#00acee] transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-[#00acee] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

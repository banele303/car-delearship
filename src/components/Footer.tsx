"use client";
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-14 pb-10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site Footer</h2>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid gap-12 md:gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/Advance_Auto_logoo.png" alt="Advance Auto" className="h-10 w-auto" />
              <span className="text-lg font-semibold text-white">Advance Auto</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">Quality vehicles, transparent service, and a tailored buying experience in Johannesburg South.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link href="/inventory" className="hover:text-white">Showroom</Link></li>
              <li><Link href="/financing" className="hover:text-white">Finance Application</Link></li>
              <li><Link href="/contact-us" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /> 2A Amanda Ave, Gleneagles, Johannesburg South</li>
              <li className="flex items-center gap-2"><Phone size={14} /> <a href="tel:+27680720424" className="hover:text-white">068 072 0424</a></li>
              <li className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:info@advanceauto.co.za" className="hover:text-white">info@advanceauto.co.za</a></li>
            </ul>
          </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-white uppercase mb-4">Follow</h3>
              <div className="flex items-center gap-4 text-gray-400">
                <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook size={20} /></a>
                <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram size={20} /></a>
                <a href="#" aria-label="YouTube" className="hover:text-white"><Youtube size={20} /></a>
              </div>
            </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {year} Advance Auto. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  );
}

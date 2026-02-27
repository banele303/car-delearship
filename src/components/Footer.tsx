"use client";
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

// Minimal TikTok icon (monochrome) since lucide-react doesn't export one yet
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M232 97.7c-24.6 0-48.2-7.5-61.9-22.6V170a86 86 0 1 1-86-86 88 88 0 0 1 12.4.9V121a50.9 50.9 0 0 0-12.4-1.6 49 49 0 1 0 49 49V24h38.6a62.4 62.4 0 0 0 .9 11.1c2.6 16.2 11.3 29.9 24.4 39.1 10.5 7.4 24 12 34.9 12Z" />
  </svg>
);

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-14 pb-10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site Footer</h2>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid gap-12 md:gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/Advance_Auto_logoo.png" alt="Advanced Auto" className="h-10 w-auto" />
              <span className="text-lg font-semibold text-white">Advanced Auto</span>
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
              <li className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:info@advancedauto.co.za" className="hover:text-white">info@advancedauto.co.za</a></li>
            </ul>
          </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-white uppercase mb-4">Follow</h3>
              <div className="flex items-center gap-4 text-gray-400">
                <a href="https://www.facebook.com/share/1Dzk6oHqXE/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white"><Facebook size={20} /></a>
                <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram size={20} /></a>
                <a href="https://www.tiktok.com/@adv1auto?_t=ZS-8zEF81vzNFC&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-white"><TikTokIcon size={20} /></a>
              </div>
            </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {year} Advanced Auto. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  );
}

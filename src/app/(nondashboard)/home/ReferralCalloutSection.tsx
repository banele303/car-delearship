"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Share2, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const perks = [
  {
    icon: Users,
    title: 'Invite Friends & Family',
    desc: 'Share your unique referral link or send a quick introduction. No limit on how many people you can refer.'
  },
  {
    icon: Gift,
    title: 'Earn R1,000+ Per Deal',
    desc: 'Get a cash reward or service credit for every successful financed vehicle purchased through your referral.'
  },
  {
    icon: Share2,
    title: 'Share Easily',
    desc: 'Use WhatsApp, Email, or social media. We track everything for you—simple and transparent.'
  },
  {
    icon: Trophy,
    title: 'Tier Bonuses',
    desc: 'Hit 5, 10, or 20 referrals and unlock boosted payouts & loyalty perks.'
  },
];

export default function ReferralCalloutSection() {
  return (
    <section className="relative py-20 bg-transparent" aria-labelledby="referral-heading">
      <div className="mx-auto px-6 lg:px-10 max-w-6xl">
        <div className="relative rounded-3xl overflow-hidden border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))] text-white px-8 md:px-12 py-14">
          <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-overlay">
            <div className="absolute -top-24 -left-12 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative grid gap-14 lg:grid-cols-2 items-center">
            {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-xs tracking-wide font-semibold uppercase">
              <Share2 size={14} /> Referral Program
            </span>
            <h2 id="referral-heading" className="text-3xl md:text-4xl font-bold leading-tight">
                Earn <span className="text-white/90 underline decoration-white/40">R1,000+</span> for Every Successful Referral
            </h2>
            <p className="text-white/90 text-lg max-w-lg leading-relaxed">
              Love what we do? Turn your network into opportunity. Refer a buyer who completes a financed vehicle purchase and receive a generous reward. There&apos;s no cap—keep earning with every deal.
            </p>
            <ul className="space-y-3 text-sm text-white/85">
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-white" /> Paid out within 7 days after a qualifying purchase is finalized.</li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-white text-[hsl(var(--primary))] font-semibold px-6 py-3 rounded-full shadow hover:shadow-lg hover:bg-white/90 transition-colors"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link
                href="/financing"
                className="inline-flex items-center gap-2 border border-white/40 px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                View Financing
              </Link>
            </div>
            <p className="text-[11px] text-white/70 max-w-md">* Example reward shown. Actual payout may vary by vehicle category & finance approval value. Terms apply.</p>
          </motion.div>
            {/* Right perks grid removed as requested */}
          </div>
        </div>
      </div>
    </section>
  );
}

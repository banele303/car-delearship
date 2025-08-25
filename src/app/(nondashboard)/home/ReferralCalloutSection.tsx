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
    title: 'Earn R8,000+ Per Deal',
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
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white" aria-labelledby="referral-heading">
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-teal-400/30 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-2 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs tracking-wide font-semibold uppercase">
              <Share2 size={14} /> Referral Program
            </span>
            <h2 id="referral-heading" className="text-3xl md:text-4xl font-bold leading-tight">
              Earn <span className="text-yellow-300">R8,000+</span> for Every Successful Referral
            </h2>
            <p className="text-emerald-50/90 text-lg max-w-lg leading-relaxed">
              Love what we do? Turn your network into opportunity. Refer a buyer who completes a financed vehicle purchase and receive a generous reward. There&apos;s no cap—keep earning with every deal.
            </p>
            <ul className="space-y-3 text-sm text-emerald-50/80">
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-300" /> Paid out within 7 days after a qualifying purchase is finalized.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-300" /> Choose cash, service credits, or accessory vouchers.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-300" /> Higher tiers unlock boosted payouts & exclusive invites.</li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-white text-emerald-900 font-semibold px-6 py-3 rounded-full shadow hover:shadow-lg hover:bg-yellow-300 transition-colors"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link
                href="/financing"
                className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                View Financing
              </Link>
            </div>
            <p className="text-[11px] text-emerald-50/60 max-w-md">* Example reward shown. Actual payout may vary by vehicle category & finance approval value. Terms apply.</p>
          </motion.div>
          {/* Right perks grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * i }}
                viewport={{ once: true }}
                className="relative rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5 flex flex-col hover:bg-white/15 transition-colors"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 text-white mb-4">
                  <p.icon size={22} />
                </div>
                <h3 className="font-semibold text-base mb-1 leading-snug">{p.title}</h3>
                <p className="text-sm text-emerald-50/80 leading-relaxed flex-1">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SharedFaqItem { q: string; a: string; }

// Unified FAQ list (merge of home + contact unique items, deduped by question)
export const sharedFaqs: SharedFaqItem[] = [
  { q: "Do you offer vehicle financing?", a: "Yes. We work with multiple finance partners to secure competitive rates. Submit a financing application and our team will contact you." },
  { q: "Can you arrange a insurance and trector installation for me?", a: "Absolutely. We help you with that and the extended warranty and trector instalation" },
  { q: "Do you accept trade‑ins?", a: "Yes, we evaluate trade‑ins on site. Provide details in the financing form or bring the vehicle for an appraisal." },
  { q: "Are all vehicles inspected?", a: "Each vehicle undergoes a multi‑point inspection for mechanical, safety, and cosmetic standards before listing." },
  { q: "What documents do I need for finance?", a: "Typically: ID, driver’s license, recent payslips, bank statements, and proof of residence. Self‑employed clients should include business registration docs." },
  { q: "How can I browse your car inventory?", a: "Browse the 'Inventory' section. Use search and filters to narrow results to what fits your needs." },
  { q: "What financing options do you offer?", a: "We provide various finance solutions including traditional loans and lease options. Our finance team helps tailor terms to your budget." },
  { q: "How do I schedule a test drive?", a: "Schedule from a vehicle's detail page or contact us via the form with your preferred date/time." },
];

export default function FAQShared({ title = 'Frequently Asked Questions', compact = false }: { title?: string; compact?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);
  return (
    <section className={compact ? "py-12" : "py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-slate-900"} aria-labelledby="shared-faq-heading">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 id="shared-faq-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
          {!compact && <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Answers to common questions about buying, financing, and trading in your vehicle.</p>}
        </div>
        <div className="space-y-4">
          {sharedFaqs.map((item, i) => {
            const open = i === openIndex;
            return (
              <motion.div key={item.q} layout className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm overflow-hidden">
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between text-left px-5 py-4 focus:outline-none">
                  <span className="font-medium text-gray-900 dark:text-gray-100 pr-6">{item.q}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-gray-500 dark:text-gray-400"><ChevronDown size={20} /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

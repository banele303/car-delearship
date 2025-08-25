"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Car, Calendar, DollarSign } from "lucide-react";
import { useGetCarsQuery } from "@/state/api";

export default function HeroSection() {
  const router = useRouter();

  const { data: carsData } = useGetCarsQuery({});
  const carMakes = React.useMemo(() => {
    if (!carsData) return [] as string[];
    return [...new Set(carsData.map((c: any) => c.make))];
  }, [carsData]);
  const carModelsMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    if (carsData) {
      for (const c of carsData as any[]) {
        if (!map[c.make]) map[c.make] = [];
        if (!map[c.make].includes(c.model)) map[c.make].push(c.model);
      }
    }
    return map;
  }, [carsData]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedMake, setSelectedMake] = React.useState<string>("any");
  const [selectedModel, setSelectedModel] = React.useState<string>("any");
  const [priceRange, setPriceRange] = React.useState<string>("any");

  const handleCarSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedMake !== "any") params.set("make", selectedMake);
    if (selectedModel !== "any") params.set("model", selectedModel);
    if (priceRange !== "any") params.set("priceRange", priceRange);
    router.push(`/cars${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="relative h-[95vh] md:h-[70vh]">
      <Image
        src="/mbb.jpg"
        alt="Hero"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute inset-0 z-[1] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white">Find Your Perfect Car </h1>
            <p className="mt-2 text-white/80 text-2xl semibold">Search by make, model, or price</p>
          </div>

          <div className="bg-gradient-to-r from-[#00A211]/40 via-[#00A211]/20 to-transparent p-[1.5px] rounded-3xl shadow-2xl">
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-y-6 gap-x-5 md:gap-y-7 md:gap-x-8 lg:gap-y-8 lg:gap-x-10 items-center">
              {/* Search */}
              <div className="md:col-span-4 lg:col-span-4">
                <label className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Search size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCarSearch()}
                    placeholder="Search cars..."
                    className="pl-14 pr-5 h-14 md:h-16 border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl focus:border-[#00A211] focus:ring-2 focus:ring-[#00A211]/30 transition-colors duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 bg-white/95 dark:bg-neutral-900/95 font-medium text-base shadow-sm"
                  />
                </div>
              </div>

              {/* Mobile divider for clearer grouping */}
              <div className="md:hidden h-px bg-black/10 dark:bg-white/10" />

              {/* Make */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="sr-only">Make</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Car size={18} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <Select
                    value={selectedMake}
                    onValueChange={(val) => {
                      setSelectedMake(val);
                      setSelectedModel("any");
                    }}
                  >
                    <SelectTrigger className="pl-14 pr-5 h-14 md:h-16 py-[2rem] flex items-center leading-none border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl focus:border-[#00A211] focus:ring-2 focus:ring-[#00A211]/30 transition-colors duration-200 bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-slate-100 font-medium text-base shadow-sm">
                      <SelectValue placeholder="Any Make" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-md bg-white dark:bg-neutral-900 ">
                      <SelectItem value="any">Any Make</SelectItem>
                      {carMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Model */}
              <div className="md:col-span-2 lg:col-span-2 md:pl-[2.4rem]">
                <label className="sr-only">Model</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!selectedMake || selectedMake === "any"}
                  >
                    <SelectTrigger className="pl-14 pr-5 h-14 md:h-16 py-[2rem] flex items-center leading-none border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl focus:border-[#00A211] focus:ring-2 focus:ring-[#00A211]/30 transition-colors duration-200 bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-slate-100 font-medium text-base shadow-sm disabled:opacity-50">
                      <SelectValue placeholder="Any Model" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-md bg-white dark:bg-neutral-900">
                      <SelectItem value="any">Any Model</SelectItem>
                        {(carModelsMap[selectedMake] || []).map((model: string) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price */}
              <div className="md:col-span-3 lg:col-span-3 md:pl-[2.4rem]">
                <label className="sr-only">Price Range</label>
                <div className="relative">
                  
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="pl-14 pr-5 h-14 md:h-16 py-[2rem] flex items-center leading-none border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl focus:border-[#00A211] focus:ring-2 focus:ring-[#00A211]/30 transition-colors duration-200 bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-slate-100 font-small text-base shadow-sm">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-md bg-white dark:bg-neutral-900 px-[-3rem]">
                      <SelectItem value="any">Any Price</SelectItem>
                      <SelectItem value="0-50000">R0 - R50k</SelectItem>
                      <SelectItem value="50000-100000">R50k - R100k</SelectItem>
                      <SelectItem value="100000-200000">R100k - R200k</SelectItem>
                      <SelectItem value="200000-300000">R200k - R300k</SelectItem>
                      <SelectItem value="300000-500000">R300k - R500k</SelectItem>
                      <SelectItem value="500000-750000">R500k - R750k</SelectItem>
                      <SelectItem value="750000-1000000">R750k - R1,000,000</SelectItem>
                      <SelectItem value="1000000+">R1,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Button */}
              <div className="md:col-span-1 lg:col-span-1 md:pl-[.3rem]">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
        aria-label="Search"
                    className="w-full h-14 md:h-16 bg-[#00A211] hover:brightness-110 text-white rounded-2xl md:rounded-2xl p-0 text-base font-semibold shadow-md hover:shadow-lg transition-colors flex items-center justify-center"
                    onClick={handleCarSearch}
                  >
                    <Search size={22} />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
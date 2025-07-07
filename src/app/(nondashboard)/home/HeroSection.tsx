"use client";
import Image from "next/image";
import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";
import { Search, Car, DollarSign, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HomeHeroSection = () => { 
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("buy");
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [selectedMake, setSelectedMake] = useState<string>("any");
  const [selectedModel, setSelectedModel] = useState<string>("any");
  const [priceRange, setPriceRange] = useState<string>("any");

  
  const carMakes = [
    "Toyota", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", 
    "Ford", "Hyundai", "Kia", "Nissan", "Honda", "Mazda"
  ];

  
  const carModels: Record<string, string[]> = {
    "Toyota": ["Corolla", "Camry", "RAV4", "Hilux", "Prius"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "i4"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "A-Class"],
    "Audi": ["A3", "A4", "Q3", "Q5", "e-tron"],
    "Volkswagen": ["Golf", "Polo", "Tiguan", "Passat", "ID.4"],
    "Ford": ["Fiesta", "Focus", "EcoSport", "Ranger", "Mustang"],
    "Hyundai": ["i20", "Elantra", "Tucson", "Santa Fe", "Kona"],
    "Kia": ["Rio", "Cerato", "Sportage", "Sorento", "EV6"],
    "Nissan": ["Micra", "Sentra", "X-Trail", "Qashqai", "Leaf"],
    "Honda": ["Jazz", "Civic", "CR-V", "HR-V", "Accord"],
    "Mazda": ["Mazda2", "Mazda3", "CX-3", "CX-5", "MX-5"]
  };


  
  const dealershipLocations = {
    "JHB": {
      name: "SaCar Johannesburg",
      coordinates: [-26.2041, 28.0473]
    },
    "CPT": {
      name: "SaCar Cape Town", 
      coordinates: [-33.9249, 18.4241]
    },
    "PTA": {
      name: "SaCar Pretoria",
      coordinates: [-25.7479, 28.2293]
    },
    "DBN": {
      name: "SaCar Durban",
      coordinates: [-29.8587, 31.0218]
    },
    "PE": {
      name: "SaCar Port Elizabeth",
      coordinates: [-33.9608, 25.6022]
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  
  useEffect(() => {
    if (selectedMake === "any" || !carModels[selectedMake]) {
      setSelectedModel("any");
    }
  }, [selectedMake, carModels]);

  const handleCarSearch = async () => {
    try {
      
      const searchParams = new URLSearchParams();
      
      if (selectedMake && selectedMake !== "any") searchParams.set('make', selectedMake);
      if (selectedModel && selectedModel !== "any") searchParams.set('model', selectedModel);
      if (priceRange && priceRange !== "any") searchParams.set('priceRange', priceRange);
      if (searchQuery) searchParams.set('search', searchQuery);

      
      dispatch(
        setFilters({
          make: selectedMake === "any" ? "" : selectedMake,
          model: selectedModel === "any" ? "" : selectedModel,
          priceRange: priceRange === "any" ? "" : priceRange,
          searchQuery: searchQuery,
        })
      );
      
      
      router.push(`/cars?${searchParams.toString()}`);
    } catch (error) {
      console.error("Error performing car search:", error);
    }
  };

  
  const handleDealershipClick = (dealershipKey: string) => {
    setActiveTab(dealershipKey.toLowerCase());

    const dealership = dealershipLocations[dealershipKey as keyof typeof dealershipLocations];
    if (dealership) {
      
      const [lat, lng] = dealership.coordinates;

      
      setSearchQuery(dealership.name);

      
      const params = new URLSearchParams({
        location: dealership.name,
        coordinates: `${lng},${lat}`,
        lat: lat.toString(),
        lng: lng.toString(),
      });

      router.push(`/dealerships?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCarSearch();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative h-[90vh] md:h-[90vh] pt-16 md:pt-0">
      
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/80 to-black/60 z-[1]"></div>

      
      <div className="absolute inset-0 overflow-hidden z-[0]">
        
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#00acee]/20 via-blue-500/10 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-20 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-[#00acee]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
        />
        
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#00acee]/60 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/40 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-purple-400/50 rounded-full"
          animate={{
            y: [0, -25, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            delay: 2,
          }}
        />
        
        
        <motion.div
          className="absolute top-1/2 left-1/6 w-16 h-0.5 bg-gradient-to-r from-[#00acee]/40 to-transparent"
          animate={{
            x: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            delay: 1.5,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/6 w-20 h-0.5 bg-gradient-to-l from-white/40 to-transparent"
          animate={{
            x: [0, -10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            delay: 3,
          }}
        />
      </div>

      
      <Image
        src="/mbb.jpg"
        alt="SaCar Dealership - Premium Cars"
        fill
        className="object-cover object-center"
        priority
      />

      
      <div className="absolute inset-0 flex items-center justify-center z-[2]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl px-4 md:px-6"
        >
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
            className="relative pt-[3rem]"
          >
            
            <div className="relative max-w-6xl mx-auto group">
              
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00acee] via-purple-500 to-[#00acee] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              
              
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-700 hover:bg-white/15 hover:border-white/40">
                
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-50"></div>
                
                
                <div className="relative p-8 lg:p-10">
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mb-6"
                  >
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                      Find Your Perfect Car
                    </h3>
                    
                  </motion.div>

                  
                  <div className="space-y-6">
                    
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
                        What are you looking for?
                      </label>
                      <div className="relative group">
                        
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                          <Search size={20} className="text-white/60 group-hover:text-[#00acee] transition-all duration-300 group-focus-within:text-[#00acee]" />
                        </div>
                        
                        
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Search by make, model, or keyword..."
                          className="pl-14 pr-5 py-4 h-14 border-2 border-white/30 rounded-2xl focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 transition-all duration-300 text-white placeholder-white/60 hover:border-white/50 bg-white/10 backdrop-blur-sm font-medium text-base shadow-lg hover:shadow-xl focus:shadow-2xl"
                        />
                        
                        
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00acee]/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div>
                        <label className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
                          Make
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                            <Car size={18} className="text-white/60 group-hover:text-[#00acee] transition-all duration-300" />
                          </div>
                          <Select value={selectedMake} onValueChange={setSelectedMake}>
                            <SelectTrigger className="pl-14 pr-5 py-4 h-14 border-2 border-white/30 rounded-2xl focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 transition-all duration-300 hover:border-white/50 bg-white/10 backdrop-blur-sm text-white font-medium shadow-lg hover:shadow-xl">
                              <SelectValue placeholder="Any Make" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
                              <SelectItem value="any">Any Make</SelectItem>
                              {carMakes.map((make) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      
                      <div>
                        <label className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
                          Model
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                            <Calendar size={18} className="text-white/60 group-hover:text-[#00acee] transition-all duration-300" />
                          </div>
                          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake || selectedMake === "any"}>
                            <SelectTrigger className="pl-14 pr-5 py-4 h-14 border-2 border-white/30 rounded-2xl focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 transition-all duration-300 hover:border-white/50 bg-white/10 backdrop-blur-sm text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50">
                              <SelectValue placeholder="Any Model" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
                              <SelectItem value="any">Any Model</SelectItem>
                              {selectedMake && carModels[selectedMake]?.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      
                      <div>
                        <label className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
                          Price Range
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                            <DollarSign size={18} className="text-white/60 group-hover:text-[#00acee] transition-all duration-300" />
                          </div>
                          <Select value={priceRange} onValueChange={setPriceRange}>
                            <SelectTrigger className="pl-14 pr-5 py-4 h-14 border-2 border-white/30 rounded-2xl focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 transition-all duration-300 hover:border-white/50 bg-white/10 backdrop-blur-sm text-white font-medium shadow-lg hover:shadow-xl">
                              <SelectValue placeholder="Any Price" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
                              <SelectItem value="any">Any Price</SelectItem>
                              <SelectItem value="0-50000">R0 - R50,000</SelectItem>
                              <SelectItem value="50000-100000">R50,000 - R100,000</SelectItem>
                              <SelectItem value="100000-200000">R100,000 - R200,000</SelectItem>
                              <SelectItem value="200000-300000">R200,000 - R300,000</SelectItem>
                              <SelectItem value="300000-500000">R300,000 - R500,000</SelectItem>
                              <SelectItem value="500000-750000">R500,000 - R750,000</SelectItem>
                              <SelectItem value="750000-1000000">R750,000 - R1,000,000</SelectItem>
                              <SelectItem value="1000000+">R1,000,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="w-full">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group"
                      >
                        
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00acee] via-purple-500 to-[#00acee] rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <Button 
                          className="relative w-full h-14 bg-gradient-to-r from-[#00acee] via-blue-500 to-[#00acee] hover:from-[#0099d4] hover:via-blue-600 hover:to-[#0087bd] text-white rounded-2xl px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 hover:border-white/40"
                          onClick={handleCarSearch}
                        >
                          <Search size={20} className="mr-3" />
                          Search Cars
                          
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mt-10"
            >
              <div className="text-center w-full mb-6">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg font-semibold text-white/90 mb-2"
                >
                  Popular Categories
                </motion.p>
                <div className="w-24 h-1 bg-gradient-to-r from-[#00acee] to-purple-500 rounded-full mx-auto"></div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="flex flex-wrap justify-center gap-3"
              >
                <CarTypeTab
                  icon={<Car size={16} />}
                  label="Sedans"
                  isActive={activeTab === "sedan"}
                  onClick={() => setActiveTab("sedan")}
                />
                <CarTypeTab
                  icon={<Car size={16} />}
                  label="SUVs"
                  isActive={activeTab === "suv"}
                  onClick={() => setActiveTab("suv")}
                />
                <CarTypeTab
                  icon={<Car size={16} />}
                  label="Luxury"
                  isActive={activeTab === "luxury"}
                  onClick={() => setActiveTab("luxury")}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};


interface CarTypeTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}


const CarTypeTab: React.FC<CarTypeTabProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`relative px-6 py-3 flex items-center gap-2 font-semibold text-sm rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden group ${
        isActive
          ? "bg-gradient-to-r from-[#00acee] via-blue-500 to-[#00acee] text-white shadow-2xl border-2 border-white/30"
          : "bg-white/15 backdrop-blur-sm text-white/90 hover:bg-white/25 hover:text-white border-2 border-white/20 hover:border-white/40"
      }`}
    >
      
      {isActive && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00acee] via-purple-500 to-[#00acee] rounded-2xl blur-sm opacity-60 animate-pulse"></div>
      )}
      
      
      <div className="relative flex items-center gap-2">
        {icon}
        {label}
      </div>
      
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
    </motion.button>
  );
};

export default HomeHeroSection; 
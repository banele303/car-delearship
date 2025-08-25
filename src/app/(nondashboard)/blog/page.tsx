"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Clock, ChevronRight, Search, Car, Wrench, DollarSign } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const blogPosts = [
  {
    id: 1,
    title: "Top 5 Tips for Buying Your First Car",
    excerpt: "Navigating the car market can be tricky. Here are essential tips for first-time buyers.",
    content: "Buying your first car is an exciting milestone, but it can also be overwhelming. From setting a budget to choosing the right model and securing financing, there's a lot to consider. This article breaks down the process into five easy-to-follow steps, ensuring you make an informed decision and drive away happy.",
    image: "/landing-search1.png", 
    author: "SaCar Expert",
    date: "June 1, 2025",
    readTime: "6 min read",
    category: "Car Buying Guide"
  },
  {
    id: 2,
    title: "Understanding Car Financing: Loans, Leases, and More",
    excerpt: "Demystify car financing options. Learn about loans, leases, and how to get the best deal.",
    content: "Car financing can seem complex, but understanding your options is key to a smart purchase. We explore the differences between traditional car loans and leasing, discuss interest rates, down payments, and credit scores. Get insights into how to prepare for financing applications and what factors lenders consider.",
    image: "/landing-search2.png", 
    author: "Finance Pro",
    date: "May 20, 2025",
    readTime: "8 min read",
    category: "Financing"
  },
  {
    id: 3,
    title: "EV Revolution: What You Need to Know About Electric Vehicles",
    excerpt: "Electric vehicles are changing the automotive landscape. Discover the benefits, challenges, and future of EVs.",
    content: "The shift towards electric vehicles (EVs) is accelerating, driven by environmental concerns and technological advancements. This article delves into the advantages of owning an EV, such as lower running costs and reduced emissions, alongside considerations like charging infrastructure and battery life. We also look at the latest EV models and what the future holds for electric mobility.",
    image: "/landing-search3.png", 
    author: "Tech Auto",
    date: "May 10, 2025",
    readTime: "7 min read",
    category: "Electric Vehicles"
  },
  {
    id: 4,
    title: "Maintaining Your Car: Essential Tips for Longevity",
    excerpt: "Keep your car running smoothly for years with these crucial maintenance tips and tricks.",
    content: "Regular car maintenance is vital for safety, performance, and extending your vehicle's lifespan. This guide covers essential checks like oil changes, tire rotations, brake inspections, and fluid top-ups. We also provide advice on recognizing common car problems and when to seek professional help, helping you save money on costly repairs in the long run.",
    image: "/landing-i7.png", 
    author: "Mechanic Mike",
    date: "April 25, 2025",
    readTime: "5 min read",
    category: "Car Maintenance"
  },
  {
    id: 5,
    title: "The Evolution of Car Design: From Classic to Futuristic",
    excerpt: "Explore the fascinating history of automotive design and how it has shaped the cars we drive today.",
    content: "Automotive design has undergone a remarkable transformation over the decades, reflecting societal changes, technological progress, and evolving aesthetics. From the iconic curves of classic cars to the sleek, aerodynamic forms of modern vehicles and the visionary concepts of futuristic models, we trace the journey of car design and its impact on driving culture.",
    image: "/landing-i6.png", 
    author: "Design Enthusiast",
    date: "April 15, 2025",
    readTime: "6 min read",
    category: "Automotive History"
  },
  {
    id: 6,
    title: "Road Trip Ready: Preparing Your Car for Long Journeys",
    excerpt: "Planning a long drive? Ensure your car is ready for the adventure with our comprehensive checklist.",
    content: "A successful road trip starts with a well-prepared vehicle. This article provides a detailed checklist to ensure your car is in top condition for long journeys, covering everything from tire pressure and fluid levels to emergency kits and navigation systems. We also share tips for packing efficiently and staying comfortable on the road, making your next adventure safe and enjoyable.",
    image: "/landing-i5.png", 
    author: "Travel Bug",
    date: "April 5, 2025",
    readTime: "4 min read",
    category: "Travel & Lifestyle"
  }
];


const categories = [
  "All",
  "Car Buying Guide",
  "Financing",
  "Electric Vehicles",
  "Car Maintenance",
  "Automotive History",
  "Travel & Lifestyle"
];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  
  const featuredPost = blogPosts[0];
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">SaCar Dealership Blog</h1> 
            <p className="text-xl max-w-3xl mx-auto">
              Stay informed with the latest trends, tips, and insights about the automotive industry and car ownership.
            </p> 
          </div>
        </div>
      </div>
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search articles..." 
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-blue-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Featured Article</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                <Link href={`/blog/${featuredPost.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Read Full Article
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        
        <div>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Latest Articles</h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      className="object-cover"
                      fill
                    />
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 m-2 rounded">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {post.date}
                      </span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">{post.author}</span>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No articles found matching your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        
        
        <div className="mt-16 bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-8 text-white">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p>Get the latest articles, tips and automotive trends delivered to your inbox.</p> 
            </div>
            <div className="md:w-1/3 flex">
              <Input
                type="email"
                placeholder="Your email address"
                className="rounded-r-none text-gray-900"
              />
              <Button className="rounded-l-none bg-blue-900 hover:bg-blue-950">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, MessageSquare } from "lucide-react";


const blogPosts = [
  {
    id: 1,
    title: "Top 5 Tips for Buying Your First Car",
    excerpt: "Navigating the car market can be tricky. Here are essential tips for first-time buyers.",
    content: `
      <p>Buying your first car is an exciting milestone, but it can also be overwhelming. From setting a budget to choosing the right model and securing financing, there's a lot to consider. This article breaks down the process into five easy-to-follow steps, ensuring you make an informed decision and drive away happy.</p>
      
      <h2>1. Set a Realistic Budget</h2>
      <p>Beyond the purchase price, consider insurance, fuel, maintenance, and potential financing costs. A good rule of thumb is that your total car expenses shouldn't exceed 15-20% of your monthly take-home pay.</p>
      
      <h2>2. Research and Compare Models</h2>
      <p>Identify your needs: Do you need a fuel-efficient commuter, a spacious family SUV, or a rugged pickup? Research different makes and models, read reviews, and compare features, reliability, and resale values.</p>
      
      <h2>3. Get Pre-Approved for Financing</h2>
      <p>Knowing your budget and getting pre-approved for a loan before visiting a dealership gives you stronger negotiating power and helps you stick to your financial limits.</p>
      
      <h2>4. Test Drive Thoroughly</h2>
      <p>Don't just take a quick spin around the block. Drive the car on various road types, including highways and city streets. Test all features, listen for unusual noises, and ensure the car feels comfortable and responsive.</p>
      
      <h2>5. Get a Pre-Purchase Inspection</h2>
      <p>Even if the car looks perfect, a professional pre-purchase inspection by an independent mechanic can uncover hidden issues, saving you from costly repairs down the line.</p>
      
      <p>By following these guidelines, you'll be better equipped to find a car that meets your needs and enhances your driving experience.</p>
    `,
    image: "/landing-search1.png",
    author: "SaCar Expert",
    date: "June 1, 2025",
    readTime: "6 min read",
    category: "Car Buying Guide",
    tags: ["Car Buying", "First Car", "Tips", "Financing"]
  },
  {
    id: 2,
    title: "Understanding Car Financing: Loans, Leases, and More",
    excerpt: "Demystify car financing options. Learn about loans, leases, and how to get the best deal.",
    content: `
      <p>Car financing can seem complex, but understanding your options is key to a smart purchase. We explore the differences between traditional car loans and leasing, discuss interest rates, down payments, and credit scores.</p>
      
      <h2>Car Loans</h2>
      <p>A car loan involves borrowing money from a bank or financial institution to purchase a vehicle. You own the car from day one, and once the loan is repaid, the car is fully yours. Loans typically have fixed monthly payments over a set term (e.g., 36, 48, 60 months).</p>
      
      <h2>Car Leases</h2>
      <p>Leasing is essentially renting a car for a set period, usually 2-4 years. You make monthly payments, but you don't own the car. At the end of the lease, you can return the car, buy it, or lease a new one. Leasing often results in lower monthly payments than buying, but you don't build equity.</p>
      
      <h2>Interest Rates and Credit Score</h2>
      <p>Your credit score significantly impacts the interest rate you'll qualify for. A higher credit score generally leads to lower interest rates, saving you money over the life of the loan or lease. It's wise to check your credit score before applying for financing.</p>
      
      <h2>Down Payments and Trade-ins</h2>
      <p>A larger down payment reduces the amount you need to finance, lowering your monthly payments and total interest paid. If you have an existing car, trading it in can serve as a down payment, further reducing your financial burden.</p>
      
      <h2>Additional Costs</h2>
      <p>Remember to factor in additional costs like sales tax, registration fees, and potential early termination fees for leases. Always read the fine print of any financing agreement.</p>
      
      <p>By understanding these financing basics, you can make an informed decision that aligns with your financial goals and driving needs.</p>
    `,
    image: "/landing-search2.png",
    author: "Finance Pro",
    date: "May 20, 2025",
    readTime: "8 min read",
    category: "Financing",
    tags: ["Car Financing", "Loans", "Leasing", "Credit Score"]
  },
  {
    id: 3,
    title: "EV Revolution: What You Need to Know About Electric Vehicles",
    excerpt: "Electric vehicles are changing the automotive landscape. Discover the benefits, challenges, and future of EVs.",
    content: `
      <p>The shift towards electric vehicles (EVs) is accelerating, driven by environmental concerns and technological advancements. This article delves into the advantages of owning an EV, such as lower running costs and reduced emissions, alongside considerations like charging infrastructure and battery life.</p>
      
      <h2>Benefits of EVs</h2>
      <ul>
        <li><strong>Lower Running Costs:</strong> Electricity is generally cheaper than petrol or diesel, and EVs require less maintenance due to fewer moving parts.</li>
        <li><strong>Reduced Emissions:</strong> EVs produce zero tailpipe emissions, contributing to cleaner air and a healthier environment.</li>
        <li><strong>Quieter Ride:</strong> Electric motors are significantly quieter than internal combustion engines, offering a smoother and more peaceful driving experience.</li>
        <li><strong>Performance:</strong> EVs deliver instant torque, providing quick acceleration and a responsive driving feel.</li>
      </ul>
      
      <h2>Challenges and Considerations</h2>
      <ul>
        <li><strong>Range Anxiety:</strong> Concerns about how far an EV can travel on a single charge, though ranges are constantly improving.</li>
        <li><strong>Charging Infrastructure:</strong> Availability of charging stations, especially for long-distance travel.</li>
        <li><strong>Initial Cost:</strong> EVs often have a higher upfront purchase price than comparable petrol cars, though government incentives can help offset this.</li>
        <li><strong>Battery Degradation:</strong> Batteries can lose some capacity over time, impacting range.</li>
      </ul>
      
      <h2>The Future of EVs</h2>
      <p>The EV market is rapidly evolving with continuous advancements in battery technology, charging speeds, and vehicle performance. Governments worldwide are implementing policies to encourage EV adoption, and the charging infrastructure is expanding. Expect to see more diverse EV models, longer ranges, and faster charging solutions in the coming years.</p>
      
      <p>Electric vehicles are not just a trend; they represent a significant step towards a sustainable and efficient future for transportation.</p>
    `,
    image: "/landing-search3.png",
    author: "Tech Auto",
    date: "May 10, 2025",
    readTime: "7 min read",
    category: "Electric Vehicles",
    tags: ["EVs", "Electric Cars", "Sustainable Transport", "Future of Auto"]
  },
  {
    id: 4,
    title: "Maintaining Your Car: Essential Tips for Longevity",
    excerpt: "Keep your car running smoothly for years with these crucial maintenance tips and tricks.",
    content: `
      <p>Regular car maintenance is vital for safety, performance, and extending your vehicle's lifespan. Neglecting routine checks can lead to costly repairs and compromise your safety on the road.</p>
      
      <h2>1. Regular Oil Changes</h2>
      <p>Engine oil lubricates moving parts and prevents overheating. Follow your car's manufacturer recommendations for oil change intervals, typically every 5,000 to 10,000 km, depending on the oil type and driving conditions.</p>
      
      <h2>2. Check Tire Pressure and Rotate Regularly</h2>
      <p>Properly inflated tires improve fuel efficiency, handling, and tire longevity. Check pressure monthly and rotate tires every 10,000 km to ensure even wear and extend their lifespan.</p>
      
      <h2>3. Inspect Brakes</h2>
      <p>Brakes are your car's most important safety feature. Listen for squealing or grinding noises, and have your brake pads, rotors, and fluid checked regularly by a professional.</p>
      
      <h2>4. Fluid Checks and Top-ups</h2>
      <p>Regularly check and top up essential fluids: coolant, brake fluid, power steering fluid, and windshield washer fluid. Low fluid levels can lead to serious mechanical issues.</p>
      
      <h2>5. Replace Air Filters</h2>
      <p>Both engine air filters and cabin air filters need regular replacement. A clean engine air filter improves fuel efficiency and engine performance, while a clean cabin filter ensures better air quality inside your car.</p>
      
      <h2>6. Battery Maintenance</h2>
      <p>Clean battery terminals regularly to prevent corrosion. If your car struggles to start, have your battery tested, especially before winter months.</p>
      
      <p>By incorporating these simple maintenance tips into your routine, you can significantly extend your car's life, improve its performance, and ensure a safer driving experience.</p>
    `,
    image: "/landing-i7.png",
    author: "Mechanic Mike",
    date: "April 25, 2025",
    readTime: "5 min read",
    category: "Car Maintenance",
    tags: ["Car Maintenance", "Auto Care", "Vehicle Longevity", "DIY Auto"]
  },
  {
    id: 5,
    title: "The Evolution of Car Design: From Classic to Futuristic",
    excerpt: "Explore the fascinating history of automotive design and how it has shaped the cars we drive today.",
    content: `
      <p>Automotive design has undergone a remarkable transformation over the decades, reflecting societal changes, technological progress, and evolving aesthetics. From the iconic curves of classic cars to the sleek, aerodynamic forms of modern vehicles and the visionary concepts of futuristic models, we trace the journey of car design and its impact on driving culture.</p>
      
      <h2>The Early Days: Form Follows Function</h2>
      <p>In the early 20th century, car design was primarily driven by functionality. Vehicles were boxy, utilitarian, and focused on basic transportation. However, even then, designers began to experiment with aesthetics, adding subtle curves and decorative elements.</p>
      
      <h2>Post-War Boom: Chrome and Fins</h2>
      <p>The mid-20th century saw an explosion of creativity in car design, particularly in America. This era was characterized by extravagant chrome accents, dramatic tailfins, and bold, expressive styling, reflecting the optimism and prosperity of the post-war era.</p>
      
      <h2>The Modern Era: Aerodynamics and Efficiency</h2>
      <p>As concerns about fuel efficiency and safety grew, car design shifted towards more aerodynamic and practical forms. The 1970s and 80s introduced sharper lines and more compact designs, while the 90s and early 2000s emphasized smoother, more rounded shapes.</p>
      
      <h2>The Future: Electric, Autonomous, and Connected</h2>
      <p>Today, car design is being revolutionized by electric powertrains, autonomous driving technology, and seamless connectivity. Future cars are envisioned as intelligent, sustainable, and highly personalized spaces, blurring the lines between transportation and living environments.</p>
      
      <p>The journey of car design is a testament to human ingenuity and our enduring fascination with motion and aesthetics. As technology continues to advance, the cars of tomorrow promise to be even more innovative and inspiring.</p>
    `,
    image: "/landing-i6.png",
    author: "Design Enthusiast",
    date: "April 15, 2025",
    readTime: "6 min read",
    category: "Automotive History",
    tags: ["Car Design", "Automotive History", "Classic Cars", "Future Cars"]
  },
  {
    id: 6,
    title: "Road Trip Ready: Preparing Your Car for Long Journeys",
    excerpt: "Planning a long drive? Ensure your car is ready for the adventure with our comprehensive checklist.",
    content: `
      <p>A successful road trip starts with a well-prepared vehicle. Before you hit the open road, take the time to go through this comprehensive checklist to ensure your car is in top condition for long journeys.</p>
      
      <h2>1. Check Your Tires</h2>
      <p>Inspect tire pressure (including the spare), tread depth, and look for any signs of wear or damage. Proper tire inflation is crucial for safety and fuel efficiency.</p>
      
      <h2>2. Inspect All Fluids</h2>
      <p>Check engine oil, coolant, brake fluid, power steering fluid, and windshield washer fluid. Top up anything that's low and address any leaks.</p>
      
      <h2>3. Test Your Lights and Wipers</h2>
      <p>Ensure all headlights, tail lights, brake lights, turn signals, and interior lights are working. Check your windshield wipers for wear and tear, and make sure your washer fluid reservoir is full.</p>
      
      <h2>4. Check Your Battery</h2>
      <p>Ensure battery terminals are clean and free of corrosion. If your battery is old, consider having it tested by a mechanic to avoid unexpected breakdowns.</p>
      
      <h2>5. Pack an Emergency Kit</h2>
      <p>Include jumper cables, a first-aid kit, a flashlight, basic tools, a blanket, water, and non-perishable snacks. It's better to be over-prepared than under-prepared.</p>
      
      <h2>6. Plan Your Route and Stops</h2>
      <p>Map out your route, identify potential fuel stops, rest areas, and overnight accommodations. Share your itinerary with someone not traveling with you.</p>
      
      <p>With these preparations, you can embark on your road trip with confidence, knowing your car is ready for the adventure ahead.</p>
    `,
    image: "/landing-i5.png",
    author: "Travel Bug",
    date: "April 5, 2025",
    readTime: "4 min read",
    category: "Travel & Lifestyle",
    tags: ["Road Trip", "Car Prep", "Travel Tips", "Vehicle Safety"]
  }
];

const BlogPostDetail = () => {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  
  
  const post = blogPosts.find(post => post.id === postId);
  
  
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push('/blog')} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft size={16} className="mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }
  
  
  const relatedPosts = blogPosts
    .filter(p => p.id !== postId && p.category === post.category)
    .slice(0, 2);
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 text-sm mb-3">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                {post.category}
              </span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {post.date}
              </span>
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
                <Image 
                  src="https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png"
                  alt={post.author}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="font-medium">{post.author}</span>
            </div>
          </div>
        </div>
      </div>
      
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="md:w-3/4">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
              
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 size={16} />
                  Share
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Bookmark size={16} />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
            
            
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-4">About the Author</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                  <Image 
                    src="/Bloom.png"
                    alt={post.author}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{post.author}</h3>
                  <p className="text-gray-600 mb-3">
                    {post.author} is an automotive expert with over 10 years of experience in the South African car market.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Follow</Button>
                    <Button variant="outline" size="sm">View All Articles</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          
          <div className="md:w-1/4">
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map(relatedPost => (
                    <Link href={`/blog/${relatedPost.id}`} key={relatedPost.id}>
                      <div className="group cursor-pointer">
                        <div className="relative h-32 mb-2 overflow-hidden rounded-lg">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{relatedPost.date}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found.</p>
                )}
              </div>
            </div>
            
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {["Car Buying Guide", "Financing", "Electric Vehicles", "Car Maintenance", "Automotive History", "Travel & Lifestyle"].map((category, index) => (
                  <Link href={`/blog?category=${category}`} key={index}>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-700">{category}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {blogPosts.filter(p => p.category === category).length}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <Button 
          onClick={() => router.push('/blog')} 
          variant="outline" 
          className="flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to All Articles
        </Button>
      </div>
    </div>
  );
};

export default BlogPostDetail;
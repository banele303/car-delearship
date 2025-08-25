"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone, Clock, Users, Car, Shield, Award } from "lucide-react"; 
import FooterSection from "../home/FooterSection"; 

export default function AboutPage() {
  return (
    <div className="bg-white">
      
      <section className="relative bg-gray-100 py-10 md:py-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="text-[#00acee] text-sm font-medium mb-4">Welcome to SaCar Dealership</div> 
              <h1 className="text-4xl md:text-6xl font-bold text-[#004d71] mb-6">About Us</h1> 
              <p className="text-lg text-gray-600 max-w-lg">
                Your premier platform for connecting car buyers with quality vehicles.
              </p> 
            </div>
            <div className="md:w-1/2 flex justify-end">
              <div className="relative">
                <Image
                  src="/about/hero-about.png" 
                  alt="Cars on display"
                  width={550}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

     

      
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <Image
                src="/about/about-u.png" 
                alt="People looking at cars"
                width={400}
                height={200}
                className="rounded-xl object-cover w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center text-[#00acee] mb-4">
                <div className="h-px bg-[#00acee] w-16 mr-4"></div>
                <p className="text-sm font-medium">Connecting buyers & sellers</p> 
              </div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Your trusted car marketplace</h2> 
              <p className="text-gray-600 mb-8">
                At SaCar Dealership, we are dedicated to bridging the gap between car buyers and reputable dealerships. This commitment ensures that customers have access to a diverse range of vehicles, giving them the freedom to choose the perfect ride.
              </p> 
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#00acee] text-white rounded-full text-sm font-medium hover:bg-[#0088cc] transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-[#f0f9ff] p-8 rounded-xl">
              <div className="text-[#00acee] mb-4">
                <Car size={40} /> 
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Our Vision</h3> 
              <p className="text-gray-600">
                At SaCar Dealership, we are driven by an unwavering ambition to become the largest online car marketplace in Africa. We are committed to continuous innovation, pushing the boundaries to solve vehicle acquisition challenges and deliver extraordinary results for both buyers and sellers.
              </p> 
            </div>

            
            <div className="bg-[#f0f9ff] p-8 rounded-xl">
              <div className="text-[#00acee] mb-4">
                <Shield size={40} /> 
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Our Commitment</h3> 
              <p className="text-gray-600">
                We pride ourselves on staying ahead of the curve with cutting-edge technology that helps solve real-world car buying problems. Through strategic partnerships, our platform reaches millions of potential buyers monthly, cementing our leadership in the automotive sector.
              </p> 
            </div>

            
            <div className="bg-[#f0f9ff] p-8 rounded-xl">
              <div className="text-[#00acee] mb-4">
                <Award size={40} /> 
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Our Support</h3> 
              <p className="text-gray-600">
                We empower dealerships with the tools and resources they need to overcome market barriers, foster growth, and boost their confidence in selling vehicles online. Our platform also provides valuable insights through customer reviews, helping dealerships make informed decisions.
              </p> 
            </div>
          </div>
        </div>
      </section>




 
 <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            
            <div className="md:w-1/2 flex flex-col gap-6">
              
              <div className="bg-[#e8ffdc] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between h-full">
                <div className="md:max-w-[60%]">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">For Dealerships</h2> 
                  <p className="text-gray-700 mb-6">
                    We offer dealerships an intuitive portal to list their vehicles, manage inquiries, and track sales with potential buyers.
                  </p> 
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-white transition-colors"
                  >
                    Learn more
                  </Link>
                </div>
                <div className="mt-6 md:mt-0">
                  <Image
                    src="/about/landloards.png" 
                    alt="Dealership illustration"
                    width={150}
                    height={150}
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>

              
              <div className="bg-[#fff1dc] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between h-full">
                <div className="md:max-w-[60%]">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">For Customers</h2> 
                  <p className="text-gray-700 mb-6">
                    We provide a simple, user-friendly interface where customers can search for cars and find their ideal vehicle with ease.
                  </p> 
                  <Link
                    href="/inventory"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-white transition-colors"
                  >
                    Browse Cars
                  </Link>
                </div>
                <div className="mt-6 md:mt-0">
                  <Image
                    src="/about/students.png" 
                    alt="Customer illustration"
                    width={150}
                    height={150}
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>

            
            <div className="md:w-1/2 bg-[#f3e8ff] rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Join us on our mission</h2>
                <p className="text-gray-700 mb-6">
                  Whether you are a customer searching for the perfect car or a dealership looking to maximize your sales potential, SaCar Dealership is here to guide you every step of the way.
                </p> 
              </div>
              <div className="mt-4">
                <Image
                  src="/about/audience-icon.svg" 
                  alt="Group of diverse people"
                  width={500}
                  height={200}
                  className="rounded-xl object-cover w-full"
                  unoptimized={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-[#00acee]">Our Story</h2>
            <p className="text-lg text-gray-600">
              Founded in 2008, SaCar Dealership was born out of a passion for cars and a vision for a better car buying experience in South Africa.
            </p> 
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#00acee] opacity-30"></div>

              
              <div className="relative z-10">
                
                <div className="mb-16 flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <h3 className="text-xl font-bold text-[#00acee]">The Beginning</h3>
                    <p className="mt-2 text-gray-600">
                      Our founders envisioned a platform that would make the car buying and selling process easier and more transparent for everyone.
                    </p> 
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#00acee] border-4 border-white flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="w-1/2 pl-8">
                    <div className="text-[#00acee] text-sm">2008</div> 
                  </div>
                </div>

                
                <div className="mb-16 flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="text-[#00acee] text-sm">2015</div> 
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#00acee] border-4 border-white flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="w-1/2 pl-8">
                    <h3 className="text-xl font-bold text-[#00acee]">Expansion & Innovation</h3>
                    <p className="mt-2 text-gray-600">
                      We expanded our network to include more dealerships and introduced innovative features to enhance the user experience.
                    </p> 
                  </div>
                </div>

                
                <div className="flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <h3 className="text-xl font-bold text-[#00acee]">Today & Beyond</h3>
                    <p className="mt-2 text-gray-600">
                      Today, we&apos;re a leading platform in South Africa, continuously improving our services based on feedback from customers and dealerships.
                    </p> 
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#00acee] border-4 border-white flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="w-1/2 pl-8">
                    <div className="text-[#00acee] text-sm">2025</div> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

 
    

      
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="md:w-full">
              <Image
                src="/about/conta.png" 
                alt="Contact us"
                width={500}
                height={600}
                className="object-cover w-full h-full rounded-xl"
                unoptimized={true}
              />
            </div>

            
            <div className="md:w-full">
              <div className="flex items-center text-[#00acee] mb-2">
                <div className="h-px bg-[#00acee] w-16 mr-4"></div>
                <p className="text-sm font-medium">Contact SaCar Dealership</p> 
              </div>
              <h2 className="text-3xl font-bold mb-3 text-gray-800">Send us a message</h2>
              <p className="text-gray-600 mb-8">
                We are here to help and answer any questions you may have.
              </p>

              <form className="space-y-6">
                <div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <label htmlFor="name" className="text-sm">Your name please</label>
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-[#00acee] focus:border-[#00acee]"
                    placeholder="Name"
                  />
                </div>

                <div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <label htmlFor="email" className="text-sm">Email address</label>
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-[#00acee] focus:border-[#00acee]"
                    placeholder="alexdubflow2@gmail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">We will reply to this email</p>
                </div>

                <div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <label htmlFor="message" className="text-sm">Message</label>
                  </div>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-[#00acee] focus:border-[#00acee]"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00acee] hover:bg-[#0088cc] text-white font-medium py-3 px-6 rounded-full transition-colors"
                >
                  Send message
                </button>

                <div className="text-center text-sm text-gray-500">
                  Email manually: <span className="text-[#00acee]">info@sacar.com</span> 
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <FooterSection/>
    </div>
  );
}
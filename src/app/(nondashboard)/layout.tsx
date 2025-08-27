"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import WelcomeToast from "@/components/WelcomeToast";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  
  
  
  
  
  
  
  
  
  
  
  
  

  

  return (
    <div className="h-full w-full">
      <Navbar />
      <WelcomeToast />
      <Toaster position="top-center" />
      <main
        className={`min-h-screen flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
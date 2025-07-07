"use client"

import { NAVBAR_HEIGHT } from "@/lib/constants"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useGetAuthUserQuery } from "@/state/api"
import { usePathname, useRouter } from "next/navigation"
import { signOut, getCurrentUser } from "aws-amplify/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import {
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Home,
  Car,
  Loader2,
  Calculator,
  Shield,
  Menu,
  X,
  Bell,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

const Navbar = () => {
  const { data: authUser, isLoading: authLoading, error: authError } = useGetAuthUserQuery(undefined)
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false) // Changed from true to false
  const [scrolled, setScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        console.log("Current user from Amplify:", user)
      } catch (error) {
        setCurrentUser(null)
        console.log("No authenticated user:", error)
      }
    }
    
    checkAuthState()
  }, [])

  
  const isAuthenticated = currentUser

  const isDashboardPage = pathname.includes("/employees") || pathname.includes("/customers") || pathname.includes("/admin")
  
  
  const isHomePage = pathname === "/"

  
  useEffect(() => {
    
    setIsLoading(false)
  }, [])

  
  const handleRouteChangeComplete = () => {
    setIsLoading(false)
  }

  
  useEffect(() => {
    
    return () => {
      setIsLoading(false)
    }
  }, [])
  
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    window.location.href = "/"
  }

  
  const getUserInitial = () => {
    if (authUser?.userInfo?.name) {
      return authUser.userInfo.name[0].toUpperCase();
    }
    if (authUser?.userInfo?.email) {
      return authUser.userInfo.email[0].toUpperCase();
    }
    if (currentUser?.username) {
      
      return currentUser.username[0].toUpperCase();
    }
    return "U";
  }

  
  const getDisplayName = () => {
    if (authUser?.userInfo?.name) {
      return authUser.userInfo.name;
    }
    if (authUser?.userInfo?.email) {
      return authUser.userInfo.email;
    }
    return currentUser?.username || "User";
  }

  return (
    <>
      
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-blue-600 font-medium animate-pulse">Loading...</p>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-50">
        <div 
          className={cn(
            "flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-out relative",
            isDashboardPage 
              ? "bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/50 dark:border-slate-700/30 backdrop-blur-xl shadow-lg shadow-slate-900/5" 
              : scrolled 
                ? "bg-white/95 border-b border-slate-200/60 backdrop-blur-xl shadow-xl shadow-slate-900/10" 
                : isHomePage 
                  ? "bg-transparent backdrop-blur-md border-transparent" 
                  : "bg-white/95 backdrop-blur-lg border-b border-slate-200/40 shadow-sm"
          )}
          style={{ height: `${NAVBAR_HEIGHT}px` }}
        >
          
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-50" />
          
          
          <div className="flex items-center gap-3 lg:gap-6 relative z-10">
            {isDashboardPage && (
              <div className="lg:hidden">
                <SidebarTrigger className="h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105" />
              </div>
            )}
            
            <div className="group transition-all duration-300 hover:scale-105">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative">
                   <Image
                      src="/car-logg.png"
                      alt="SaCar Dealership Logo"
                      width={120}
                      height={100}
                      className="object-contain h-50 cursor-pointer transition-all duration-300 rounded-md"
                      priority
                      draggable={false}
                    />
                  
                </div>
              </Link>
            </div>
            
            
            {isDashboardPage && isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-medium px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 border-0 hover:scale-105 hover:-translate-y-0.5"
                  onClick={() => router.push("/employees/newcar")}
                >
                  <Car className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">Add Vehicle</span>
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-700 hover:from-purple-700 hover:via-purple-800 hover:to-pink-800 text-white font-medium px-4 py-2 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 border-0 hover:scale-105 hover:-translate-y-0.5"
                  onClick={() => router.push("/admin")}
                >
                  <Shield className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">Admin</span>
                </Button>
              </div>
            )}
          </div>

          
          {!isDashboardPage && !isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-2 relative z-10">
              <div className="flex items-center bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg rounded-2xl p-1 shadow-lg shadow-slate-900/5 border border-white/20 dark:border-slate-700/20">
                <Link 
                  href="/" 
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                    pathname === "/" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25"
                      : scrolled 
                        ? "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        : isHomePage 
                          ? "text-white/90 hover:text-white hover:bg-white/20" 
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </span>
                  {pathname === "/" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl animate-pulse"></div>
                  )}
                </Link>
                
                <Link 
                  href="/inventory" 
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                    pathname === "/inventory" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25"
                      : scrolled 
                        ? "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        : isHomePage 
                          ? "text-white/90 hover:text-white hover:bg-white/20" 
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Inventory
                  </span>
                  {pathname === "/inventory" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl animate-pulse"></div>
                  )}
                </Link>
                
                <Link 
                  href="/financing" 
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                    pathname === "/financing" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25"
                      : scrolled 
                        ? "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        : isHomePage 
                          ? "text-white/90 hover:text-white hover:bg-white/20" 
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Financing
                  </span>
                  {pathname === "/financing" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl animate-pulse"></div>
                  )}
                </Link>
                
                <Link 
                  href="/contact-us" 
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                    pathname === "/contact-us" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25"
                      : scrolled 
                        ? "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        : isHomePage 
                          ? "text-white/90 hover:text-white hover:bg-white/20" 
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </span>
                  {pathname === "/contact-us" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl animate-pulse"></div>
                  )}
                </Link>
              </div>
            </nav>
          )}

          
          {isDashboardPage && isAuthenticated && (
            <div className="hidden md:flex items-center relative z-10">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-white/20 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-slate-900/10 hover:-translate-y-0.5"
                onClick={() => router.push("/inventory")}
              >
                <Search className="h-4 w-4" />
                <span className="ml-2">Browse Cars</span>
              </Button>
            </div>
          )}

          
          <div className="flex items-center gap-3 lg:gap-4 relative z-10">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2.5 rounded-xl  dark:bg-slate-800/30 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 border border-white/20 dark:border-slate-700/20"
                  >
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </Button>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse border-2 border-white dark:border-slate-800"></div>
                </div>

                
                {isDashboardPage && (
                  <div className="hidden sm:block">
                    <div className="p-1 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border border-white/20 dark:border-slate-700/20">
                      <ThemeToggle />
                    </div>
                  </div>
                )}
                
                
                <Link href="/customers/settings" className="group" scroll={false}>
                  <div className="p-2.5 rounded-xl dark:bg-slate-800/30 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 border border-white/20 dark:border-slate-700/20">
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 group-hover:rotate-90" />
                  </div>
                </Link>

                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl  dark:bg-slate-800/30 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 hover:scale-105 group border border-white/20 dark:border-slate-700/20">
                      <Avatar className="h-8 w-8 ring-2  dark:ring-slate-700/50 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 text-white font-bold text-sm">
                          {getUserInitial()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-all duration-300 group-hover:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent
                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 dark:border-slate-700/30 mt-2 p-3 min-w-[280px] animate-in fade-in-50 zoom-in-95 duration-300"
                    align="end"
                    sideOffset={12}
                  >
                    
                    <div className="px-4 py-4 border-b border-slate-200/60 dark:border-slate-700/40 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 text-white font-bold text-lg">
                            {getUserInitial()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-base">
                            {getDisplayName()}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                              online • {authUser?.userRole || "customer"}
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    
                    <DropdownMenuItem
                      className="cursor-pointer py-3 px-4 my-1 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-300 flex items-center gap-3 text-sm font-medium group"
                      onClick={() => router.push("/customers/dashboard", { scroll: false })}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-800/70 dark:group-hover:to-blue-700/70 transition-all duration-300">
                        <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-3 px-4 my-1 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30 transition-all duration-300 flex items-center gap-3 text-sm font-medium group"
                      onClick={() => router.push('/financing', { scroll: false })}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 group-hover:from-emerald-200 group-hover:to-emerald-300 dark:group-hover:from-emerald-800/70 dark:group-hover:to-emerald-700/70 transition-all duration-300">
                        <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span>Financing</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-3 px-4 my-1 rounded-xl text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-300 flex items-center gap-3 text-sm font-medium group"
                      onClick={() => router.push("/customers/settings", { scroll: false })}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-800/70 dark:group-hover:to-purple-700/70 transition-all duration-300">
                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200/80 to-transparent dark:via-slate-700/80 my-3" />

                    <DropdownMenuItem
                      className="cursor-pointer py-3 px-4 my-1 rounded-xl text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 flex items-center gap-3 text-sm font-medium group"
                      onClick={handleSignOut}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 group-hover:from-red-200 group-hover:to-red-300 dark:group-hover:from-red-800/70 dark:group-hover:to-red-700/70 transition-all duration-300">
                        <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                
                <div className="lg:hidden mobile-menu">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2.5 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 border border-white/20 dark:border-slate-700/20"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <div className="space-y-1">
                      <div className={cn("w-5 h-0.5 bg-current transition-all duration-300", isMobileMenuOpen && "rotate-45 translate-y-1.5")}></div>
                      <div className={cn("w-5 h-0.5 bg-current transition-all duration-300", isMobileMenuOpen && "opacity-0")}></div>
                      <div className={cn("w-5 h-0.5 bg-current transition-all duration-300", isMobileMenuOpen && "-rotate-45 -translate-y-1.5")}></div>
                    </div>
                  </Button>
                </div>
                
                
                <div className="hidden sm:block">
                  <div className="p-1 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border border-white/20 dark:border-slate-700/20">
                    <ThemeToggle />
                  </div>
                </div>
                
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/signup")}
                    className={cn(
                      "font-medium px-6 py-2.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 backdrop-blur-lg",
                      scrolled 
                        ? "border-slate-200/60 bg-white/30 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20" 
                        : isHomePage
                          ? "border-white/40 bg-white/20 text-white hover:border-white hover:bg-white/30 hover:shadow-lg hover:shadow-white/20"
                          : "border-slate-200/60 bg-white/30 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20"
                    )}
                  >
                    Register
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => router.push("/signin")}
                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 border-0 hover:scale-105 hover:-translate-y-0.5"
                  >
                    Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        
        {isMobileMenuOpen && !isAuthenticated && (
          <div className="lg:hidden mobile-menu">
            <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40 shadow-2xl">
              <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      pathname === "/" 
                        ? "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                    )}
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  
                  <Link
                    href="/inventory"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      pathname === "/inventory" 
                        ? "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                    )}
                  >
                    <Car className="h-5 w-5" />
                    Inventory
                  </Link>
                  
                  <Link
                    href="/financing"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      pathname === "/financing" 
                        ? "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                    )}
                  >
                    <Calculator className="h-5 w-5" />
                    Financing
                  </Link>
                  
                  <Link
                    href="/contact-us"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      pathname === "/contact-us" 
                        ? "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                    )}
                  >
                    <Phone className="h-5 w-5" />
                    Contact
                  </Link>
                </div>
                
                <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4 mt-4">
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/signup")}
                      className="w-full justify-start font-medium px-4 py-3 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-300"
                    >
                      <User className="h-5 w-5 mr-3" />
                      Register
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => router.push("/signin")}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 border-0"
                    >
                      <LogOut className="h-5 w-5 mr-3 rotate-180" />
                      Login
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar

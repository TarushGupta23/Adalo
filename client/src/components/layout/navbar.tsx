// components/navbar.jsx - FINAL REVISION for Mobile Responsiveness
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "./mobile-menu";
import { Bell, Search, Menu } from "lucide-react";
import JewelLogo from '@/components/ui/logo';
// import { isAdminUser } from "@shared/schema";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location === path;

  return (
    <>
      <nav className={`bg-white fixed top-0 w-full z-50 transition-all ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center py-3 h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/">
                {/* Adjusted logo styling for tighter mobile fit */}
                <a className="flex items-center font-serif text-xl sm:text-2xl font-bold text-primary mr-2 sm:mr-4 cursor-pointer transform translate-y-0.5">
                  <div className="mr-1 flex items-center">
                    <JewelLogo size={20} className="sm:h-6 sm:w-6" /> {/* Smaller logo on mobile */}
                  </div>
                  <span className="text-secondary whitespace-nowrap">Jewel</span><span className="whitespace-nowrap">Connect</span>
                </a>
              </Link>

              {/* Desktop Navigation Links - Hidden on mobile */}
              <div className="hidden md:flex space-x-6 lg:space-x-8 ml-4">
                <Link href="/">
                  <a className={`font-sans cursor-pointer ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Home
                  </a>
                </Link>
                <Link href="/directory">
                  <a className={`font-sans cursor-pointer ${isActive('/directory') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Directory
                  </a>
                </Link>
                <Link href="/events">
                  <a className={`font-sans cursor-pointer ${isActive('/events') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Events
                  </a>
                </Link>
                <Link href="/gemstone-marketplace">
                  <a className={`font-sans cursor-pointer ${isActive('/gemstone-marketplace') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Gemstones
                  </a>
                </Link>
                <Link href="/jewelry-marketplace">
                  <a className={`font-sans cursor-pointer ${isActive('/jewelry-marketplace') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Marketplace
                  </a>
                </Link>
                <Link href="/group-purchases">
                  <a className={`font-sans cursor-pointer ${isActive('/group-purchases') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                    Group Buys
                  </a>
                </Link>
                {user && (
                  <>
                    <Link href="/messages">
                      <a className={`font-sans cursor-pointer ${isActive('/messages') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                        Messages
                      </a>
                    </Link>
                    <Link href="/inventory">
                      <a className={`font-sans cursor-pointer ${isActive('/inventory') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}>
                        My Inventory
                      </a>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right-hand side action items */}
            {/* Added flex-shrink-0 to prevent these from shrinking unnecessarily and pushing the menu button out */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"> {/* VERY TIGHT SPACING for mobile: space-x-1 */}
              {/* Search bar - visible only on md and larger */}
              <div className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="bg-neutral-200 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-40 lg:w-64"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full text-neutral-500"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* These items should be visible on ALL screen sizes if user is logged in */}
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        {/* Smaller button for mobile bell icon */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-600 hover:text-primary transition-all">
                          <Bell className="h-4 w-4" /> {/* Smaller bell icon */}
                          <Badge className="absolute -top-1 -right-1 bg-destructive text-white w-4 h-4 flex items-center justify-center p-0 text-xs">3</Badge> {/* Smaller badge */}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="p-2 font-medium">Notifications</div>
                        <DropdownMenuSeparator />
                        <div className="max-h-72 overflow-y-auto">
                          <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/notifications")}>
                            <div>
                              <p className="text-sm font-medium">New connection request</p>
                              <p className="text-xs text-neutral-500">Elena Craftsman wants to connect</p>
                              <p className="text-xs text-neutral-400 mt-1">2 hours ago</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/events")}>
                            <div>
                              <p className="text-sm font-medium">Upcoming event reminder</p>
                              <p className="text-xs text-neutral-500">International Jewelry Design Expo</p>
                              <p className="text-xs text-neutral-400 mt-1">1 day ago</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/messages")}>
                            <div>
                              <p className="text-sm font-medium">New message</p>
                              <p className="text-xs text-neutral-500">Marcus Lens sent you a message</p>
                              <p className="text-xs text-neutral-400 mt-1">2 days ago</p>
                            </div>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center" onClick={() => navigate("/notifications")}>
                          <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Logout Icon Button - ALSO SMALLER FOR MOBILE */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-600 hover:text-primary transition-all" 
                    onClick={() => {
                      logoutMutation.mutate();
                      setTimeout(() => window.location.href = "/", 300);
                    }}
                    disabled={logoutMutation.isPending}
                    title="Logout"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {/* Smaller SVG */}
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>

                  {/* User Menu / Avatar - Now with tighter sizing */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 flex items-center justify-center"> {/* Smaller button */}
                        <Avatar className="h-7 w-7"> {/* Even smaller avatar */}
                          <AvatarImage src={user.profileImage as string} alt={user.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs"> {/* Smaller fallback text */}
                            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className="cursor-pointer"
                      >
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/inventory")}
                        className="cursor-pointer"
                      >
                        My Inventory
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/messages")}
                        className="cursor-pointer"
                      >
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/cart")}
                        className="cursor-pointer"
                      >
                        Shopping Cart
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/orders")}
                        className="cursor-pointer"
                      >
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/settings")}
                        className="cursor-pointer"
                      >
                        Account Settings
                      </DropdownMenuItem>

                      {/* Admin Dashboard link */}
                      {user && user.username && (user.username === 'admin' || user.username === 'carmelar' || user.username === 'tobepacking') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate("/admin")}
                            className="cursor-pointer text-orange-600 font-medium"
                          >
                            🔧 Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          logoutMutation.mutate();
                          setTimeout(() => window.location.href = "/", 300);
                        }}
                        disabled={logoutMutation.isPending}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Login/Signup Buttons - Hidden on mobile, shown on md+
                <div className="hidden md:flex space-x-3 items-center">
                  <Link href="/directory">
                    <Button
                      variant="link"
                      className="text-secondary hover:text-secondary/80 flex items-center gap-1.5 p-0 h-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M17 7h.01" /><path d="M7 12h.01" /><path d="M17 12h.01" /><path d="M7 17h.01" /><path d="M17 17h.01" /></svg>
                      <span className="font-medium">Directory</span>
                    </Button>
                  </Link>
                  <span className="text-neutral-300">•</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/auth")}
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button - Visible ONLY on small screens */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-neutral-600 flex-shrink-0" // Added flex-shrink-0
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onNavigate={(path) => {
          navigate(path);
          setIsMobileMenuOpen(false);
        }}
        onLogout={() => {
          logoutMutation.mutate();
          setTimeout(() => window.location.href = "/", 300);
        }}
        isLoggingOut={logoutMutation.isPending}
      />
    </>
  );
}
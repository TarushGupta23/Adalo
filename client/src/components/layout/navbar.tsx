import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "./mobile-menu";
import { Bell, Search } from "lucide-react";
import JewelLogo from '@/components/ui/logo';
import { isAdminUser } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if a link is active
  const isActive = (path: string) => location === path;

  return (
    <>
      <nav className={`bg-white fixed top-0 w-full z-50 transition-all ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo & Navigation */}
            <div className="flex items-center">
              <div 
                className="flex items-center font-serif text-2xl font-bold text-primary mr-10 cursor-pointer transform translate-y-0.5"
                onClick={() => window.location.href = "/"}
              >
                <div className="mr-2 flex items-center">
                  <JewelLogo size={24} />
                </div>
                <span className="text-secondary">Jewel</span>Connect
              </div>
              
              <div className="hidden md:flex space-x-8">
                <div
                  onClick={() => window.location.href = "/"}
                  className={`font-sans cursor-pointer ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Home
                </div>
                <div
                  onClick={() => window.location.href = "/directory"}
                  className={`font-sans cursor-pointer ${isActive('/directory') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Directory
                </div>
                <div
                  onClick={() => window.location.href = "/events"}
                  className={`font-sans cursor-pointer ${isActive('/events') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Events
                </div>
                <div
                  onClick={() => window.location.href = "/gemstone-marketplace"}
                  className={`font-sans cursor-pointer ${isActive('/gemstone-marketplace') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Gemstones
                </div>
                <div
                  onClick={() => window.location.href = "/jewelry-marketplace"}
                  className={`font-sans cursor-pointer ${isActive('/jewelry-marketplace') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Marketplace
                </div>
                <div
                  onClick={() => window.location.href = "/group-purchases"}
                  className={`font-sans cursor-pointer ${isActive('/group-purchases') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                >
                  Group Buys
                </div>
                {user && (
                  <>
                    <div
                      onClick={() => window.location.href = "/messages"}
                      className={`font-sans cursor-pointer ${isActive('/messages') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                    >
                      Messages
                    </div>
                    <div
                      onClick={() => window.location.href = "/inventory"}
                      className={`font-sans cursor-pointer ${isActive('/inventory') ? 'text-primary border-b-2 border-primary' : 'text-neutral-600 hover:text-primary'} transition-all`}
                    >
                      My Inventory
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Search & User Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-neutral-200 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full text-neutral-500"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary transition-all">
                          <Bell className="h-5 w-5" />
                          <Badge className="absolute -top-1 -right-1 bg-destructive text-white w-5 h-5 flex items-center justify-center p-0 text-xs">3</Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="p-2 font-medium">Notifications</div>
                        <DropdownMenuSeparator />
                        <div className="max-h-72 overflow-y-auto">
                          <DropdownMenuItem className="py-3 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium">New connection request</p>
                              <p className="text-xs text-neutral-500">Elena Craftsman wants to connect</p>
                              <p className="text-xs text-neutral-400 mt-1">2 hours ago</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-3 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium">Upcoming event reminder</p>
                              <p className="text-xs text-neutral-500">International Jewelry Design Expo</p>
                              <p className="text-xs text-neutral-400 mt-1">1 day ago</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-3 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium">New message</p>
                              <p className="text-xs text-neutral-500">Marcus Lens sent you a message</p>
                              <p className="text-xs text-neutral-400 mt-1">2 days ago</p>
                            </div>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center">
                          <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Logout Button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-neutral-600 hover:text-primary transition-all" 
                    onClick={() => {
                      logoutMutation.mutate();
                      setTimeout(() => window.location.href = "/", 300);
                    }}
                    disabled={logoutMutation.isPending}
                    title="Logout"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0">
                        <Avatar>
                          <AvatarImage src={user.profileImage as string} alt={user.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => window.location.href = `/profile/${user.id}`}
                        className="cursor-pointer"
                      >
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.location.href = "/inventory"} 
                        className="cursor-pointer"
                      >
                        My Inventory
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/messages"}
                        className="cursor-pointer"
                      >
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/cart"}
                        className="cursor-pointer"
                      >
                        Shopping Cart
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/orders"}
                        className="cursor-pointer"
                      >
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/settings"}
                        className="cursor-pointer"
                      >
                        Account Settings
                      </DropdownMenuItem>
                      
                      {/* Admin Dashboard link - visible for admin users */}
                      {user && user.username && (user.username === 'admin' || user.username === 'carmelar' || user.username === 'tobepacking') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => window.location.href = "/admin"}
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
                          // Force reload the page after logout to clear any cached state
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
                    onClick={() => window.location.href = "/auth"}
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = "/auth?tab=register"}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-neutral-600" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
      />
    </>
  );
}

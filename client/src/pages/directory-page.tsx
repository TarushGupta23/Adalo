import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { User as SchemaUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

// Extended User type to handle both camelCase and snake_case fields from API
interface User extends SchemaUser {
  // Add snake_case alternatives
  user_type?: string;
  secondary_type?: string;
  full_name?: string;
  profile_image?: string;
  cover_image?: string;
  logo_image?: string;
  created_at?: Date;
  is_premium?: boolean;
}
// The To Be Packing logo is in the public folder

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { ToBePackingActualLogo } from "@/components/ui/to-be-packing-actual-logo";

export default function DirectoryPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  
  // Handle URL parameters for filters
  const parseAndApplyUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for both 'profession' and 'category' parameters
    const professionParam = urlParams.get('profession');
    const categoryParam = urlParams.get('category');
    const locationParam = urlParams.get('location');
    const queryParam = urlParams.get('query');
    
    // Apply filters from URL parameters
    if (professionParam) {
      console.log("Setting profession from URL param:", professionParam);
      setProfession(professionParam);
    } else if (categoryParam) {
      console.log("Setting profession from category URL param:", categoryParam);
      setProfession(categoryParam);
    }
    
    // Debug all user types
    fetch('/api/users')
      .then(res => res.json())
      .then((users: User[]) => {
        console.log("All users with their types:");
        users.forEach((user) => {
          const name = user.fullName || user.full_name || 'Unknown';
          const primaryType = user.userType || user.user_type || '';
          const secondaryType = user.secondaryType || user.secondary_type || '';
          console.log(`${name}: primary=${primaryType}, secondary=${secondaryType}`);
        });
      });
    
    if (locationParam) {
      setLocation(locationParam);
    }
    
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  };
  
  // Apply URL parameters when component mounts
  useEffect(() => {
    parseAndApplyUrlParams();
  }, []);
  
  // Listen for URL changes to update filters
  useEffect(() => {
    // Function to handle URL changes
    const handleLocationChange = () => {
      parseAndApplyUrlParams();
    };
    
    // Add event listener for URL changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const { data: professionals, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/users", searchQuery, profession, location],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);
      if (location) queryParams.append("location", location);
      
      // Get all users and filter on client side for more flexibility
      const response = await fetch(`/api/users?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch professionals");
      let results = await response.json() as User[];
      
      // Client-side filtering for both primary and secondary types
      if (profession && profession !== "all") {
        console.log(`Filtering by profession: ${profession}`);
        
        // Make sure we always include To Be Packing in relevant categories
        const showToBePacking = profession.toLowerCase() === 'packaging' || profession.toLowerCase() === 'displays';
        
        results = results.filter((prof: User) => {
          // Get proper field values regardless of snake_case or camelCase
          const primaryType = (prof.userType || prof.user_type || '').toLowerCase();
          const secondaryType = (prof.secondaryType || prof.secondary_type || '').toLowerCase();
          const name = (prof.fullName || prof.full_name || '').toLowerCase();
          const id = prof.id;
          
          // Special case: when searching for "packaging" category, we ONLY want to show To Be Packing
          if (profession.toLowerCase() === 'packaging') {
            // Only show To Be Packing for packaging category
            const isToBePacking = (id === 1 || id === 5) && name.includes('to be packing');
            console.log(`In packaging category, showing only To Be Packing: ${isToBePacking}`);
            return isToBePacking;
          }
          
          // Always show To Be Packing in displays categories
          if (profession.toLowerCase() === 'displays' && (id === 1 || id === 5) && name.includes('to be packing')) {
            console.log(`Including To Be Packing (ID ${id}) in displays category`);
            return true;
          }
          
          // Otherwise do normal type checking
          const isPrimaryMatch = primaryType === profession.toLowerCase();
          const isSecondaryMatch = secondaryType === profession.toLowerCase();
          
          console.log(`User ${id} (${name}): primary=${primaryType}, secondary=${secondaryType}, matches=${isPrimaryMatch || isSecondaryMatch}`);
          
          return isPrimaryMatch || isSecondaryMatch;
        });
        
        console.log(`After profession filter: ${results.length} users remain`);
        
      }
      
      // Filter out the current user and admin from directory results
      if (user) {
        results = results.filter((prof: User) => prof.id !== user.id);
      }
      
      // Filter out admin user ("System Administrator")
      results = results.filter((prof: User) => {
        const fullName = (prof.fullName || prof.full_name || '').toLowerCase();
        return !fullName.includes('system administrator');
      });
      
      return results;
    }
  });

  const sendConnectionRequest = async (recipientId: number) => {
    // Redirect to auth page if not logged in
    if (!user) {
      navigate("/auth");
      return;
    }
    
    try {
      await apiRequest("POST", "/api/connections", {
        recipientId,
        status: "pending"
      });
      // Refresh the list after sending request
      refetch();
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Directory - JewelConnect</title>
        <meta name="description" content="Browse and connect with jewelry professionals. Find jewelers, photographers, designers, and more in our industry directory." />
      </Helmet>
      
      <Navbar />
      
      <main className="pt-20 pb-12 min-h-screen">
        {/* Guest mode banner */}
        {!user && (
          <div className="bg-secondary/10 border-y border-secondary/20 mb-6">
            <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
              <p className="text-neutral-700 text-sm mb-2 sm:mb-0">
                <span className="font-medium">Guest browsing mode:</span> Sign in to connect with professionals
              </p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="text-xs"
                onClick={() => navigate("/auth")}
              >
                Sign In / Register
              </Button>
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center text-sm text-neutral-600 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Link>
          </div>
          
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-800 mb-2">Professional Directory</h1>
            <p className="text-neutral-600">Connect with professionals in the jewelry industry</p>
          </div>
          
          {/* Search & Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, company or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      refetch();
                    }
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-neutral-700 mb-1">Profession</label>
                <Select 
                  value={profession} 
                  onValueChange={(value) => {
                    setProfession(value);
                    // Force requery
                    refetch();
                  }}
                >
                  <SelectTrigger id="profession">
                    <SelectValue placeholder="All Professions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Professions</SelectItem>
                    <SelectItem value="designer">Designers</SelectItem>
                    <SelectItem value="gemstone_dealer">Gemstone Dealers</SelectItem>
                    <SelectItem value="casting">Casting & 3D Printing</SelectItem>
                    <SelectItem value="bench_jeweler">Bench Jewelers & Setters</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="displays">Displays</SelectItem>
                    <SelectItem value="photographer">Photographers</SelectItem>
                    <SelectItem value="store_design">Store Design & Furniture</SelectItem>
                    <SelectItem value="marketing">Marketing & Media</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City or country..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      refetch();
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Search button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => refetch()}
                className="px-6"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Search Professionals
              </Button>
            </div>
          </div>
          
          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Show a message prompting user to search when no search has been performed */}
            {!isLoading && !searchQuery && !profession && !location && (
              <div className="col-span-full py-16 text-center">
                <h3 className="text-xl font-medium text-neutral-800 mb-2">Search for professionals</h3>
                <p className="text-neutral-600 mb-4">Use the search box or filters above to find professionals in the jewelry industry</p>
              </div>
            )}

            {isLoading && (searchQuery || profession || location) && (
              // Loading skeletons - only show when a search is being performed
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-36 bg-neutral-200"></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <Skeleton className="h-14 w-14 rounded-full mr-4" />
                        <div>
                          <Skeleton className="h-6 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex flex-wrap gap-2 mb-5">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {!isLoading && (searchQuery || profession || location) && professionals?.length > 0 && professionals
              // Don't further filter the results, as the backend filtering is already applied
              .map((professional) => (
                <Card key={professional.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-4">
                      {/* Special display for To Be Packing */}
                      {(professional.id === 1 || professional.id === 5) && (professional.fullName?.toLowerCase().includes("to be packing") || professional.full_name?.toLowerCase().includes("to be packing")) ? (
                        <>
                          <div className="mr-4">
                            <img 
                              src="/tobe-logo-real.png" 
                              alt="To Be Packing" 
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-bold text-neutral-800">
                              To Be Packing
                            </h3>
                            <div className="flex gap-2 mt-1 mb-2">
                              <Badge 
                                variant="outline" 
                                className="bg-secondary/10 text-secondary border border-secondary/30 text-xs py-0.5 px-2 rounded-full font-medium shadow-sm cursor-pointer hover:bg-secondary/20 transition-colors"
                                onClick={() => window.location.href = "/directory?category=packaging"}
                              >
Packaging
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-secondary/10 text-secondary border border-secondary/30 text-xs py-0.5 px-2 rounded-full font-medium shadow-sm cursor-pointer hover:bg-secondary/20 transition-colors"
                                onClick={() => window.location.href = "/directory?category=displays"}
                              >
Displays
                              </Badge>
                            </div>
                            
                            <p className="text-neutral-600 text-sm mb-3">Bespoke jewelry packaging and displays made in Italy since 1999</p>
                          </div>
                        </>
                      ) : (
                        <>
                          {professional.logoImage ? (
                            <div className="h-14 w-14 mr-4 overflow-hidden rounded-full border-2 border-neutral-200">
                              <img 
                                src={professional.logoImage}
                                alt={`${professional.fullName || 'Professional'} logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <Avatar className="h-14 w-14 mr-4 border-2 border-neutral-200">
                              {professional.profileImage && (
                                <AvatarImage 
                                  src={professional.profileImage || ''} 
                                  alt={professional.fullName || 'Professional'} 
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {professional.fullName ? professional.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'P'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <h3 className="font-serif text-xl font-bold text-neutral-800">
                              {professional.fullName || 'Professional'}
                            </h3>
                            <p className="text-neutral-600 capitalize">
                              {professional.userType ? professional.userType.replace(/_/g, ' ') : 'Professional'}
                              {professional.secondaryType && (
                                <span> & {professional.secondaryType.replace(/_/g, ' ')}</span>
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    

                    
                    {/* More info button */}
                    <Button asChild className="w-full">
                      <Link to={`/profile/${professional.id}`}>
                        More Info
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
            ))}
            
            {!isLoading && professionals?.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <h3 className="text-xl font-medium text-neutral-800 mb-2">No professionals found</h3>
                <p className="text-neutral-600 mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setProfession("");
                  setLocation("");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

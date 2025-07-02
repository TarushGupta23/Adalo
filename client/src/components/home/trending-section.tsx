import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, StarHalf, Bookmark } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
// Using direct image URLs from the To Be Packing website

export default function TrendingSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Add a constant for the backend URL
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env

  const { data: professionals, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/featured"],
    queryFn: async () => {
      // Get To Be Packing profile only (ID = 5)
      const response = await fetch(`${BACKEND_URL}/api/users/5`); // Changed: Prepended BACKEND_URL to the fetch URL
      if (!response.ok) throw new Error("Failed to fetch featured professional");
      const user = await response.json();
      // Return as array with single item
      return [user];
    }
  });

  const connectWithProfessional = async (recipientId: number) => {
    try {
      await apiRequest("POST", "/api/connections", {
        recipientId,
        status: "pending"
      });
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Request",
        description: "There was an error sending your connection request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Placeholder images for professional workspaces
  const workspaceImages = [
    "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Jewelry workspace 
    "https://images.unsplash.com/photo-1617295788989-bc7c7ad430a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Jewelry items instead of COVID-19
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Placeholder skills for different professions
  const getProfessionSkills = (profession: string) => {
    switch(profession) {
      case "jeweler":
        return ["Custom Design", "Diamond Setting", "Restoration"];
      case "photographer":
        return ["Product Photos", "Catalogs", "E-commerce"];
      case "designer":
        return ["CAD Design", "3D Modeling", "Prototyping"];
      case "packaging":
        return ["Custom Boxes", "Sustainable", "Luxury"];
      case "displays":
        return ["Showcase Design", "Visual Merchandising", "Custom Displays"];
      case "retailer":
        return ["Fine Jewelry", "Bridal", "Custom Orders"];
      default:
        return ["Jewelry", "Expertise", "Services"];
    }
  };
  
  // Helper function for skill badge color
  const getSkillBadgeClass = (profession: string) => {
    switch(profession) {
      case "jeweler": return "bg-primary/10 text-primary";
      case "photographer": return "bg-accent/10 text-accent";
      case "designer": return "bg-secondary/10 text-secondary";
      case "packaging": return "bg-accent2/10 text-accent2";
      case "displays": return "bg-secondary/10 text-secondary-light";
      case "retailer": return "bg-primary/10 text-primary-light";
      default: return "bg-primary/10 text-primary";
    }
  };
  
  return (
    <div className="bg-neutral-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-neutral-800">Trending Professionals</h2>
          <div
            onClick={() => window.location.href = "/directory"}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            View All
          </div>
        </div>
        
        <div className="grid grid-cols-1 max-w-2xl mx-auto">
          {isLoading ? (
            // Single loading placeholder
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-200 mr-4"></div>
                  <div>
                    <div className="h-5 w-32 bg-neutral-200 mb-1"></div>
                    <div className="h-4 w-24 bg-neutral-200"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-neutral-200"></div>
                  <div className="h-4 w-3/4 bg-neutral-200"></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="h-6 w-24 bg-neutral-200 rounded-full"></div>
                  <div className="h-6 w-32 bg-neutral-200 rounded-full"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-10 bg-neutral-200 rounded-lg flex-1 mr-2"></div>
                  <div className="h-10 w-10 bg-neutral-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ) : professionals?.length ? (
            professionals.map((professional, index) => (
              <Card key={professional.id} className="overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {professional.id === 5 ? (
                      <div className="h-20 w-20 mr-4 flex items-center justify-center">
                        <img 
                          src="/tobe-logo-real.png" 
                          alt="To Be Packing" 
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <Avatar className="h-14 w-14 mr-4 border-2 border-neutral-200">
                        {professional.profileImage ? (
                          <AvatarImage 
                            src={professional.profileImage} 
                            alt={professional.fullName || 'Professional'} 
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {professional.fullName 
                              ? professional.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
                              : 'JD'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    <div>
                      <h3 className={`font-serif ${professional.id === 5 ? 'text-2xl' : 'text-xl'} font-bold text-neutral-800`}>
                        {professional.fullName || 'Professional'}
                        {professional.isPremium && (
                          <Badge className="ml-2 bg-secondary text-white">Premium</Badge>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 mt-3">
                        {professional.userType && (
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/directory?category=${professional.userType}`}
                          >
                            {professional.userType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {professional.secondaryType && (
                          <Badge 
                            variant="outline" 
                            className="bg-secondary/10 text-secondary border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/directory?category=${professional.secondaryType}`}
                          >
                            {professional.secondaryType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {professional.id === 5 ? (
                    <>
                      <p className="text-neutral-700 mb-3 line-clamp-2">Bespoke jewelry packaging and displays made in Italy since 1999</p>
                      <div className="grid grid-cols-1 gap-2 mb-5 mt-4">
                        <div className="overflow-hidden rounded-md shadow-sm h-48 relative">
                          <img 
                            src="/assets/jewelry-box-icon.jpg" 
                            alt="To Be Packing jewelry boxes" 
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <span className="text-white font-medium">Jewelry boxes</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : professional.bio && (
                    <p className="text-neutral-700 mb-5 line-clamp-2">{professional.bio}</p>
                  )}
                  
                  <div className="flex justify-between">
                    <Button asChild className="flex-1 mr-2">
                      <Link to={`/profile/${professional.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    
                    {user && professional.id !== user.id && (
                      <Button
                        variant="outline"
                        onClick={() => connectWithProfessional(professional.id)}
                        className="flex-none"
                        aria-label="Connect"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                      </Button>
                    )}
                    
                    {!user && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/auth")}
                        className="flex-none"
                        aria-label="Sign in to connect"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V7.414l-4-4H3zM2 4a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          <path d="M10 12H8v-2a1 1 0 10-2 0v2H4a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2z" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p>No trending professionals found at the moment.</p>
              <Button 
                className="mt-4"
                onClick={() => window.location.href = "/directory"}
              >
                Browse Directory
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

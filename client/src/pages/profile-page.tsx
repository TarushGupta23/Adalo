import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet";
import { User, Connection, ProfilePhoto } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import tobeOfficialLogo from "../assets/tobe-official-logo.svg";
import instagramLogo from "../assets/instagram-official-logo.svg";
import pinterestLogo from "../assets/pinterest-logo.svg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload, X, Pencil, Trash2, UserPlus } from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger,
  SimpleTooltip
} from "@/components/ui/tooltip";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploadPhotoDialogOpen, setIsUploadPhotoDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [profileFormData, setProfileFormData] = useState({
    fullName: "",
    bio: "",
    company: "",
    location: "",
    website: "",
    phone: "",
    headquarters: "",
    showroom1: "",
    showroom2: "",
    instagram: "",
    facebook: "",
    pinterest: "",
    logoImage: "",
    coverImage: ""
  });
  const [photoFormData, setPhotoFormData] = useState({
    photoUrl: '',
    caption: '',
    displayOrder: 0
  });
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const profileId = parseInt(params?.id || "0");
  const isOwnProfile = user?.id === profileId;
  
  // Functions for To Be Packing profile
  const connectHandler = () => {
    if (!user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }
    connectionMutation.mutate();
  };
  
  const toggleMessaging = (open: boolean) => {
    if (!user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }
    // This would be implemented when adding messaging functionality
    console.log('Toggle messaging:', open);
  };

  // Effect to remove the Rubik's cube decorative element
  useEffect(() => {
    if ((profileId === 1 || profileId === 5) && profileRef.current) {
      const removeRubiksCube = () => {
        const container = profileRef.current;
        if (!container) return;
        
        // Find all images in the profile container
        const images = container.querySelectorAll('img');
        
        // Check each image to find the Rubik's cube
        images.forEach(img => {
          const rect = img.getBoundingClientRect();
          const src = img.getAttribute('src') || '';
          
          // Check if this is located near the TBP avatar and isn't the avatar itself
          if (img.parentElement && 
              !img.parentElement.classList.contains('avatar') && 
              !src.includes('profile') && 
              rect.top < 500) {
            // This is likely the Rubik's cube - remove it
            img.style.display = 'none';
            img.remove();
          }
        });
      };
      
      // Run immediately and also after a short delay to ensure DOM is fully loaded
      removeRubiksCube();
      setTimeout(removeRubiksCube, 500);
      setTimeout(removeRubiksCube, 1000);
    }
  }, [profileId]);

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: [`/api/users/${profileId}`],
    enabled: !!profileId
  });
  
  // Fetch profile photos
  const { data: profilePhotos, isLoading: isPhotosLoading } = useQuery<ProfilePhoto[]>({
    queryKey: [`/api/users/${profileId}/photos`],
    enabled: !!profileId
  });
  
  // Create a new photo
  const createPhotoMutation = useMutation({
    mutationFn: async (data: typeof photoFormData) => {
      const response = await apiRequest('POST', `/api/users/${profileId}/photos`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo uploaded successfully",
        description: "Your photo has been added to your gallery",
      });
      setIsUploadDialogOpen(false);
      setPhotoFormData({
        photoUrl: '',
        caption: '',
        displayOrder: 0
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/photos`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload photo",
        description: error.message || "An error occurred while uploading your photo",
        variant: "destructive"
      });
    }
  });
  
  // Update a photo
  const updatePhotoMutation = useMutation({
    mutationFn: async (data: {id: number, photoData: Partial<typeof photoFormData>}) => {
      const response = await apiRequest('PUT', `/api/photos/${data.id}`, data.photoData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo updated successfully",
        description: "Your photo has been updated",
      });
      setIsEditDialogOpen(false);
      setEditingPhotoId(null);
      setPhotoFormData({
        photoUrl: '',
        caption: '',
        displayOrder: 0
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/photos`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update photo",
        description: error.message || "An error occurred while updating your photo",
        variant: "destructive"
      });
    }
  });
  
  // Delete a photo
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest('DELETE', `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Photo deleted successfully",
        description: "Your photo has been removed from your gallery",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/photos`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete photo",
        description: error.message || "An error occurred while deleting your photo",
        variant: "destructive"
      });
    }
  });
  
  // Initialize profile form data when profile loads
  useEffect(() => {
    if (profile && isOwnProfile) {
      setProfileFormData({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        company: profile.company || "",
        location: profile.location || "",
        website: profile.website || "",
        phone: profile.phone || "",
        headquarters: profile.headquarters || "",
        showroom1: profile.showroom1 || "",
        showroom2: profile.showroom2 || "",
        instagram: profile.instagram || "",
        facebook: profile.facebook || "",
        pinterest: profile.pinterest || "",
        logoImage: profile.logoImage || "",
        coverImage: profile.coverImage || ""
      });
    }
  }, [profile, isOwnProfile]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof profileFormData) => {
      const response = await apiRequest("PATCH", `/api/users/${profileId}`, profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}`] });
      setIsEditProfileDialogOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  // Profile form handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileFormData);
  };

  // Photo form handlers
  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFormData.photoUrl) {
      toast({
        title: "Photo URL required",
        description: "Please enter a URL for your photo",
        variant: "destructive"
      });
      return;
    }
    
    createPhotoMutation.mutate(photoFormData);
  };
  
  const handlePhotoUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhotoId) return;
    
    updatePhotoMutation.mutate({
      id: editingPhotoId,
      photoData: photoFormData
    });
  };
  
  const handleDeletePhoto = (photoId: number) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      deletePhotoMutation.mutate(photoId);
    }
  };
  
  const openEditDialog = (photo: ProfilePhoto) => {
    setEditingPhotoId(photo.id);
    setPhotoFormData({
      photoUrl: photo.photoUrl,
      caption: photo.caption || '',
      displayOrder: photo.displayOrder || 0
    });
    setIsEditDialogOpen(true);
  };

  // Inventory section removed

  // Fetch connection status if not own profile
  const { data: connections, isLoading: isConnectionsLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
    enabled: !isOwnProfile && !!user
  });

  // Determine connection status
  useEffect(() => {
    if (!connections || isOwnProfile) return;
    
    const connection = connections.find(conn => 
      (conn.requesterId === user?.id && conn.recipientId === profileId) ||
      (conn.requesterId === profileId && conn.recipientId === user?.id)
    );
    
    if (connection) {
      setConnectionStatus(connection.status);
    } else {
      setConnectionStatus(null);
    }
  }, [connections, isOwnProfile, user?.id, profileId]);

  // Send connection request mutation
  const connectionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/connections", {
        recipientId: profileId,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Request sent",
        description: `A connection request has been sent to ${profile?.fullName}`,
      });
      setConnectionStatus("pending");
    },
  });

  // Accept connection request mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await apiRequest("PATCH", `/api/connections/${connectionId}`, {
        status: "accepted"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection accepted",
        description: `You are now connected with ${profile?.fullName}`,
      });
      setConnectionStatus("accepted");
    },
  });

  // Find the connection object
  const connectionObj = connections?.find(conn => 
    (conn.requesterId === user?.id && conn.recipientId === profileId) ||
    (conn.requesterId === profileId && conn.recipientId === user?.id)
  );

  if (isProfileLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-12 min-h-screen">
          {/* Back button */}
          <div className="container mx-auto px-4 py-4">
            <Link to="/directory" className="inline-flex items-center text-neutral-700 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Directory
            </Link>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-neutral-200"></div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
                  <Skeleton className="h-32 w-32 rounded-xl border-4 border-white" />
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-12 min-h-screen">
          {/* Back button */}
          <div className="container mx-auto px-4 py-4">
            <Link to="/directory" className="inline-flex items-center text-neutral-700 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Directory
            </Link>
          </div>
          
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <p className="text-neutral-600 mb-8">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <a href="/directory">Back to Directory</a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Custom rendering for To Be Packing profile
  if ((profileId === 1 || profileId === 5) && profile.fullName === "To Be Packing") {
    return (
      <>
        <Helmet>
          <title>{`${profile.fullName} - JewelConnect Profile`}</title>
          <meta name="description" content={`View the professional profile of ${profile.fullName}, ${profile.userType.replace(/_/g, ' ')}${profile.secondaryType ? ' & ' + profile.secondaryType.replace(/_/g, ' ') : ''} in the jewelry industry.`} />
        </Helmet>
        
        <Navbar />
        
        <main className="pt-16 pb-12 min-h-screen profile-page-container">
          {/* Back button */}
          <div className="container mx-auto px-4 py-4">
            <Link to="/directory" className="inline-flex items-center text-neutral-700 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Directory
            </Link>
          </div>
          
          {/* To Be Packing Custom Profile Header */}
          <div className="bg-white shadow-md">
            <div className="container mx-auto px-4">
              <div className="relative py-6">
                {/* Profile Info */}
                <div className="flex flex-col items-center justify-center mb-6 px-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-40 w-40 flex items-center justify-center">
                      <img 
                        src="/tobe-logo-real.png" 
                        alt="To Be Packing" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="text-3xl font-serif font-bold text-neutral-800">
                        {profile.fullName}
                      </h1>

                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {(profileId === 1 || (profileId === 5 && profile.fullName === "To Be Packing")) ? (
                        <>
                          <Badge 
                            variant="outline" 
                            className="bg-secondary/10 text-secondary border-2 border-secondary/30 text-sm py-1 px-3 rounded-full cursor-pointer hover:bg-secondary/20 transition-colors font-medium shadow-sm"
                            onClick={() => window.location.href = "/directory?category=packaging"}
                          >
                            Packaging
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="bg-secondary/10 text-secondary border-2 border-secondary/30 text-sm py-1 px-3 rounded-full cursor-pointer hover:bg-secondary/20 transition-colors font-medium shadow-sm"
                            onClick={() => window.location.href = "/directory?category=displays"}
                          >
                            Displays
                          </Badge>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-2 border-primary/30 text-sm py-1.5 px-4 rounded-full cursor-pointer hover:bg-primary/20 transition-colors font-medium shadow-sm"
                            onClick={() => window.location.href = `/directory?profession=${profile.userType}`}
                          >
                            {profile.userType.replace(/_/g, ' ')}
                          </Badge>
                          
                          {profile.secondaryType && (
                            <Badge 
                              variant="outline" 
                              className="bg-secondary/10 text-secondary border-2 border-secondary/30 text-sm py-1.5 px-4 rounded-full cursor-pointer hover:bg-secondary/20 transition-colors font-medium shadow-sm"
                              onClick={() => window.location.href = `/directory?profession=${profile.secondaryType}`}
                            >
                              {profile.secondaryType.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-3 text-center">
                      <div className="text-sm mb-3 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="font-medium text-neutral-600">Headquarters&nbsp;</span>
                        <a href="https://www.google.com/maps/place/To+Be+Packing+S.r.l/@45.604534,9.6512479,17z/data=!3m1!4b1!4m6!3m5!1s0x478152f88f6fb0f7:0x3a73f0ba01109ce8!8m2!3d45.6045303!4d9.6538228!16s%2Fg%2F1vbl6fkj?entry=ttu&g_ep=EgoyMDI1MDUxNS4wIKXMDSoASAFQAw%3D%3D" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline text-primary font-semibold hover:text-primary/80 transition-colors">
                          Comun Nuovo, Italy
                        </a>
                      </div>
                      
                      <div className="text-sm mb-3 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="font-medium text-neutral-600">Showroom&nbsp;</span>
                        <a href="https://www.google.com/maps/place/To+Be+Packing+S.r.l./@45.4674906,9.1958587,16z/data=!3m1!4b1!4m6!3m5!1s0x4786c7e836390343:0xfe112dc1a012a518!8m2!3d45.4674869!4d9.1984336!16s%2Fg%2F11jq05bsb7?entry=ttu&g_ep=EgoyMDI1MDUxNS4wIKXMDSoASAFQAw%3D%3D" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline text-primary font-semibold hover:text-primary/80 transition-colors">
                          Milan, Italy
                        </a>
                      </div>
                      
                      <div className="text-sm mb-3 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="font-medium text-neutral-600">Showroom&nbsp;</span>
                        <a href="https://www.google.com/maps/place/TO+BE+PACKING/@40.7554807,-73.9827917,17z/data=!3m2!4b1!5s0x89c2588c9d7ca34f:0xfd91a953c9a4ae2!4m6!3m5!1s0x89c258ffccfd906f:0xa87882ce5e72355b!8m2!3d40.7554767!4d-73.9802168!16s%2Fg%2F11clv759my?entry=ttu&g_ep=EgoyMDI1MDUxNS4wIKXMDSoASAFQAw%3D%3D" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline text-primary font-semibold hover:text-primary/80 transition-colors">
                          New York, NY
                        </a>
                      </div>
                      
                      <div className="text-sm mt-5 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <a href="https://www.tobepacking.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary font-medium text-base hover:text-primary/80 transition-colors">
                          www.tobepacking.com
                        </a>
                      </div>
                      <div className="text-sm">
                        <div className="relative">
                          <SimpleTooltip content="Contact via email">
                            <button 
                              onClick={() => setShowEmailOptions(!showEmailOptions)}
                              className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              aria-label="Contact"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                            </button>
                          </SimpleTooltip>
                          
                          {showEmailOptions && (
                            <div className="absolute z-30 mt-2 w-60 flex flex-col space-y-2 p-3 bg-white shadow-xl rounded-md border">
                              <div className="text-xs text-gray-500 mb-1 font-medium">Contact Carmela:</div>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => {
                                    window.open('mailto:carmela@tobe.it', '_blank');
                                    setShowEmailOptions(false);
                                  }}
                                  className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                  Email
                                </button>
                                <button
                                  onClick={() => {
                                    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=carmela@tobe.it', '_blank');
                                    setShowEmailOptions(false);
                                  }}
                                  className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <svg className="w-4 h-4 mb-1" viewBox="0 0 24 24" fill="#EA4335" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.0599 4.5831V19.4165H20.3099V6.7998L14.1699 11.3581L12.9999 12.1165L12.0499 12.7331L11.0999 12.1165L9.9299 11.3581L3.7899 6.7998V19.4165H2.0399V4.5831H3.8849L4.1766 4.7998L9.9516 9.0831L12.0499 10.4998L14.1483 9.0831L19.9233 4.7998L20.2149 4.5831H22.0599Z" />
                                  </svg>
                                  Gmail
                                </button>
                                <button
                                  onClick={() => {
                                    window.open('https://outlook.live.com/mail/0/deeplink/compose?to=carmela@tobe.it', '_blank');
                                    setShowEmailOptions(false);
                                  }}
                                  className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <svg className="w-4 h-4 mb-1" viewBox="0 0 24 24" fill="#0078D4" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 12C22 15.978 22 18 20 20C18 22 15.978 22 12 22C8.022 22 6 22 4 20C2 18 2 15.978 2 12C2 8.022 2 6 4 4C6 2 8.022 2 12 2C15.978 2 18 2 20 4C22 6 22 8.022 22 12Z"/>
                                  </svg>
                                  Outlook
                                </button>
                              </div>
                              <div className="flex justify-end mt-1">
                                <button
                                  onClick={() => setShowEmailOptions(false)}
                                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 ml-auto flex flex-col md:flex-row gap-1">
                    {!isOwnProfile && (
                      <>
                        {connectionStatus === 'pending' ? (
                          <SimpleTooltip content="Request sent" side="bottom">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center">
                              <Button 
                                disabled 
                                className="cursor-not-allowed h-7 w-7 rounded-full p-0 flex items-center justify-center" 
                                variant="ghost"
                                aria-label="Request Sent"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                              </Button>
                            </div>
                          </SimpleTooltip>
                        ) : connectionStatus === 'accepted' ? (
                          <SimpleTooltip content="Connected" side="bottom">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center">
                              <Button 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full p-0 flex items-center justify-center"
                                aria-label="Connected"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                              </Button>
                            </div>
                          </SimpleTooltip>
                        ) : (
                          <SimpleTooltip content="Connect" side="bottom">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center">
                              <Button 
                                onClick={connectHandler} 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                aria-label="Connect"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                              </Button>
                            </div>
                          </SimpleTooltip>
                        )}
                        <SimpleTooltip content="Message" side="bottom">
                          <div className="h-7 w-7 rounded-full flex items-center justify-center">
                            <Button 
                              variant="ghost" 
                              onClick={() => toggleMessaging(true)} 
                              className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                              aria-label="Message"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </Button>
                          </div>
                        </SimpleTooltip>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="container mx-auto px-4 py-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card className="border-2 border-neutral-200 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                          </svg>
                          About
                        </h2>
                        <p className="text-neutral-700 whitespace-pre-line">
                          {profile.bio || "No bio available"}
                        </p>
                        
                        <h3 className="text-xl font-serif font-bold mt-8 mb-4">Social Media</h3>
                        <div className="flex items-center gap-4">
                          <SimpleTooltip content="Follow on Instagram">
                            <a 
                              href="https://www.instagram.com/tobepacking_official/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center justify-center hover:opacity-80 transition-opacity"
                              aria-label="Instagram"
                            >
                              <img 
                                src={instagramLogo} 
                                alt="Instagram" 
                                className="w-10 h-10 rounded-md shadow-sm" 
                              />
                            </a>
                          </SimpleTooltip>
                          
                          <SimpleTooltip content="View our Pinterest boards">
                            <a 
                              href="https://it.pinterest.com/tobepackingofficial/_created/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center justify-center hover:opacity-80 transition-opacity"
                              aria-label="Pinterest"
                            >
                              <img 
                                src={pinterestLogo} 
                                alt="Pinterest" 
                                className="w-10 h-10 rounded-md shadow-sm" 
                              />
                            </a>
                          </SimpleTooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="border-2 border-neutral-200 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-2xl font-serif font-bold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                            </svg>
                            Client List
                          </h2>
                          {isOwnProfile && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit List
                            </Button>
                          )}
                        </div>
                        <div className="p-4 border border-neutral-200 rounded-lg">
                          {profile.id === 5 ? (
                            <p className="text-neutral-700 leading-relaxed">
                              Bayco, Lugano, Paul Morelli, Stephanie Gottlieb, Marla Aaron, 
                              Meridian Jewelers, Material Good, Poniros, Ring Concierge, Single Stone,
                              886 The Royal Mint, Alfardan Jewellery, Polo, Kurz, Doux,
                              Carrera y Carrera, Damaso, Fullord, Aman, Alo Diamonds,
                              DMR, Kutter, Noa, Sauer, Yataghán
                            </p>
                          ) : isOwnProfile ? (
                            <div className="col-span-full text-center py-6">
                              <p className="text-neutral-500 mb-3">Add your clients to showcase your partnerships</p>
                              <Button variant="outline" size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Clients
                              </Button>
                            </div>
                          ) : (
                            <div className="col-span-full text-center py-6">
                              <p className="text-neutral-500">No clients listed yet</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Inventory section removed */}
              
              <TabsContent value="photos">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-bold">Photo Gallery</h2>
                    {isOwnProfile && (
                      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex items-center gap-2" 
                            disabled={profilePhotos && profilePhotos.length >= 10}
                          >
                            <PlusCircle size={16} />
                            <span>Add Photo</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Photo</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePhotoSubmit}>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="photoUrl">Photo URL</Label>
                                <Input
                                  id="photoUrl"
                                  value={photoFormData.photoUrl}
                                  onChange={(e) => setPhotoFormData({...photoFormData, photoUrl: e.target.value})}
                                  placeholder="https://example.com/your-photo.jpg"
                                  className="w-full"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="caption">Caption</Label>
                                <Textarea
                                  id="caption"
                                  value={photoFormData.caption}
                                  onChange={(e) => setPhotoFormData({...photoFormData, caption: e.target.value})}
                                  placeholder="Add a caption for this photo"
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="displayOrder">Display Order</Label>
                                <Input
                                  id="displayOrder"
                                  type="number"
                                  min="0"
                                  value={photoFormData.displayOrder}
                                  onChange={(e) => setPhotoFormData({...photoFormData, displayOrder: parseInt(e.target.value)})}
                                  className="w-full"
                                />
                                <p className="text-xs text-gray-500">Lower numbers appear first</p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsUploadDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                disabled={createPhotoMutation.isPending}
                              >
                                {createPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {profilePhotos && profilePhotos.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
                      <p className="text-gray-500">No photos have been added yet.</p>
                      {isOwnProfile && (
                        <Button 
                          className="mt-4"
                          onClick={() => setIsUploadDialogOpen(true)}
                        >
                          Add Your First Photo
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Photo Gallery Grid */}
                  {profilePhotos && profilePhotos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profilePhotos.map((photo) => (
                        <div 
                          key={photo.id} 
                          className="relative group border border-gray-200 rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-[4/3]">
                            <img 
                              src={photo.photoUrl} 
                              alt={photo.caption || "Gallery photo"} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.caption && (
                            <div className="p-3 bg-white">
                              <p className="text-sm text-gray-800">{photo.caption}</p>
                            </div>
                          )}
                          
                          {/* Edit/Delete controls for own profile */}
                          {isOwnProfile && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 bg-white bg-opacity-80 hover:bg-opacity-100"
                                onClick={() => openEditDialog(photo)}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 bg-opacity-80 hover:bg-opacity-100"
                                onClick={() => handleDeletePhoto(photo.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Edit Profile Dialog */}
                {isOwnProfile && (
                  <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProfileSubmit}>
                        <div className="space-y-6 py-4">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                  id="fullName"
                                  value={profileFormData.fullName}
                                  onChange={(e) => setProfileFormData({...profileFormData, fullName: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                  id="company"
                                  value={profileFormData.company}
                                  onChange={(e) => setProfileFormData({...profileFormData, company: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                                id="bio"
                                value={profileFormData.bio}
                                onChange={(e) => setProfileFormData({...profileFormData, bio: e.target.value})}
                                placeholder="Tell us about your expertise and experience"
                                rows={4}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={profileFormData.location}
                                onChange={(e) => setProfileFormData({...profileFormData, location: e.target.value})}
                                placeholder="e.g. New York, NY"
                              />
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Contact Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                  id="website"
                                  value={profileFormData.website}
                                  onChange={(e) => setProfileFormData({...profileFormData, website: e.target.value})}
                                  placeholder="https://www.example.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={profileFormData.phone}
                                  onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})}
                                  placeholder="+1 (555) 555-5555"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Addresses */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Addresses</h3>
                            <div className="space-y-2">
                              <Label htmlFor="headquarters">Main Address</Label>
                              <Input
                                id="headquarters"
                                value={profileFormData.headquarters}
                                onChange={(e) => setProfileFormData({...profileFormData, headquarters: e.target.value})}
                                placeholder="e.g. Milan, Italy"
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="showroom1">Additional Address 1</Label>
                                <Input
                                  id="showroom1"
                                  value={profileFormData.showroom1}
                                  onChange={(e) => setProfileFormData({...profileFormData, showroom1: e.target.value})}
                                  placeholder="Optional"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="showroom2">Additional Address 2</Label>
                                <Input
                                  id="showroom2"
                                  value={profileFormData.showroom2}
                                  onChange={(e) => setProfileFormData({...profileFormData, showroom2: e.target.value})}
                                  placeholder="Optional"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Social Media */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Social Media</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                  id="instagram"
                                  value={profileFormData.instagram}
                                  onChange={(e) => setProfileFormData({...profileFormData, instagram: e.target.value})}
                                  placeholder="@username"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                  id="facebook"
                                  value={profileFormData.facebook}
                                  onChange={(e) => setProfileFormData({...profileFormData, facebook: e.target.value})}
                                  placeholder="facebook.com/page"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pinterest">Pinterest</Label>
                                <Input
                                  id="pinterest"
                                  value={profileFormData.pinterest}
                                  onChange={(e) => setProfileFormData({...profileFormData, pinterest: e.target.value})}
                                  placeholder="pinterest.com/user"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Images */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Profile Images</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="logoImage">Logo/Avatar Image URL</Label>
                                <Input
                                  id="logoImage"
                                  value={profileFormData.logoImage}
                                  onChange={(e) => setProfileFormData({...profileFormData, logoImage: e.target.value})}
                                  placeholder="https://example.com/logo.jpg"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="coverImage">Cover Image URL</Label>
                                <Input
                                  id="coverImage"
                                  value={profileFormData.coverImage}
                                  onChange={(e) => setProfileFormData({...profileFormData, coverImage: e.target.value})}
                                  placeholder="https://example.com/cover.jpg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditProfileDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Edit Photo Dialog */}
                {isOwnProfile && (
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Photo</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePhotoUpdate}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="editPhotoUrl">Photo URL</Label>
                            <Input
                              id="editPhotoUrl"
                              value={photoFormData.photoUrl}
                              onChange={(e) => setPhotoFormData({...photoFormData, photoUrl: e.target.value})}
                              placeholder="https://example.com/your-photo.jpg"
                              className="w-full"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editCaption">Caption</Label>
                            <Textarea
                              id="editCaption"
                              value={photoFormData.caption}
                              onChange={(e) => setPhotoFormData({...photoFormData, caption: e.target.value})}
                              placeholder="Add a caption for this photo"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editDisplayOrder">Display Order</Label>
                            <Input
                              id="editDisplayOrder"
                              type="number"
                              min="0"
                              value={photoFormData.displayOrder}
                              onChange={(e) => setPhotoFormData({...photoFormData, displayOrder: parseInt(e.target.value)})}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">Lower numbers appear first</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsEditDialogOpen(false);
                              setEditingPhotoId(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={updatePhotoMutation.isPending}
                          >
                            {updatePhotoMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </TabsContent>
              
              <TabsContent value="connections">
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 20V10m0 0l-4 4m4-4l4 4M4 4v10m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">No Connections Yet</h3>
                  {!isOwnProfile && user && (
                    <Button 
                      onClick={connectHandler}
                      className="flex items-center gap-2"
                      disabled={connectionStatus === 'pending'} 
                    >
                      <UserPlus size={16} />
                      <span>{connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}</span>
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          {/* Fixed floating back button at the bottom of the page */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              variant="outline" 
              size="default"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-full bg-white shadow-lg border-2 border-secondary px-4 py-2 hover:bg-secondary/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="font-medium text-secondary">Back</span>
            </Button>
          </div>
        </main>
        
        <Footer />
      </>
    );
  }

  // Regular profile for other users
  return (
    <>
      <Helmet>
        <title>{`${profile.fullName} - JewelConnect Profile`}</title>
        <meta name="description" content={`View the professional profile of ${profile.fullName}, ${profile.userType.replace(/_/g, ' ')}${profile.secondaryType ? ' & ' + profile.secondaryType.replace(/_/g, ' ') : ''} in the jewelry industry.`} />
      </Helmet>
      
      <Navbar />
      
      <main ref={profileRef} className="pt-16 pb-12 min-h-screen profile-page-container">
        {/* Back button moved to fixed floating position */}
        {/* Profile Header */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 to-secondary/30 overflow-hidden">
                {profile.coverImage && (
                  <img 
                    src={profile.coverImage} 
                    alt={`${profile.fullName}'s cover`} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6 px-4">
                <div className="flex items-center">
                  <Avatar className="h-32 w-32 rounded-xl border-4 border-white shadow-lg">
                    <AvatarImage src={profile.logoImage || profile.profileImage || undefined} alt={profile.fullName} />
                    <AvatarFallback className="bg-primary text-white text-3xl">
                      {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-3xl font-serif font-bold text-neutral-800">
                          {profile.fullName}
                        </h1>

                      </div>
                      <p className="text-neutral-600">{profile.userType}</p>
                      {(profile.id === 1 || (profile.id === 5 && profile.fullName === "To Be Packing")) ? (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Headquarters <a 
                              href="https://maps.google.com/?q=Comun+Nuovo,+Italy" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Comun Nuovo, Italy
                            </a></span>
                          </div>
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Showroom <a 
                              href="https://maps.google.com/?q=Milan,+Italy" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Milan, Italy
                            </a></span>
                          </div>
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Showroom <a 
                              href="https://maps.google.com/?q=New+York,+NY" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              New York, NY
                            </a></span>
                          </div>
                        </div>
                      ) : profile.location && (
                        <div className="flex items-center mt-1 text-sm text-neutral-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-1">
                      {!isOwnProfile && (
                        <>
                          {connectionStatus === 'pending' && connectionObj?.requesterId !== user?.id && (
                            <SimpleTooltip content="Accept request" side="bottom">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center">
                                <Button 
                                  onClick={() => acceptConnectionMutation.mutate(connectionObj!.id)} 
                                  variant="ghost" 
                                  className="h-7 w-7 rounded-full p-0 flex items-center justify-center hover:bg-gray-100"
                                  aria-label="Accept Request"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="M20 6L9 17l-5-5"></path>
                                  </svg>
                                </Button>
                              </div>
                            </SimpleTooltip>
                          )}
                          {connectionStatus === 'pending' && connectionObj?.requesterId === user?.id && (
                            <SimpleTooltip content="Request sent" side="bottom">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center">
                                <Button 
                                  disabled 
                                  className="cursor-not-allowed h-7 w-7 rounded-full p-0 flex items-center justify-center" 
                                  variant="ghost"
                                  aria-label="Request Sent"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                </Button>
                              </div>
                            </SimpleTooltip>
                          )}
                          {connectionStatus === 'accepted' ? (
                            <SimpleTooltip content="Connected" side="bottom">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center">
                                <Button 
                                  variant="ghost" 
                                  className="h-7 w-7 rounded-full p-0 flex items-center justify-center"
                                  aria-label="Connected"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                </Button>
                              </div>
                            </SimpleTooltip>
                          ) : connectionStatus === null && (
                            <SimpleTooltip content="Connect" side="bottom">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center">
                                <Button 
                                  onClick={connectHandler} 
                                  variant="ghost" 
                                  className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                  aria-label="Connect"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                </Button>
                              </div>
                            </SimpleTooltip>
                          )}
                          <SimpleTooltip content="Message" side="bottom">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center">
                              <Button 
                                variant="ghost" 
                                onClick={() => toggleMessaging(true)} 
                                className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                aria-label="Message"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                              </Button>
                            </div>
                          </SimpleTooltip>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8 border-2 border-neutral-200 shadow-sm p-1 rounded-lg">
              <TabsTrigger className="font-medium text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md" value="about">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                About
              </TabsTrigger>
              <TabsTrigger className="font-medium text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md" value="photos">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Photos
              </TabsTrigger>
              <TabsTrigger className="font-medium text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md" value="connections">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Network
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-serif font-bold">About</h2>
                        {isOwnProfile && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsEditProfileDialogOpen(true)}
                            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
                          >
                            <Pencil size={14} />
                            {profile.bio ? "Edit" : "Add Bio"}
                          </Button>
                        )}
                      </div>
                      <p className="text-neutral-700 whitespace-pre-line">
                        {profile.bio || (isOwnProfile ? "Click 'Add Bio' to tell others about yourself and your work in the jewelry industry." : "No bio available")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-serif font-bold mb-4">Details</h2>
                      <div className="space-y-4">
                        {profile.company && (
                          <div>
                            <h3 className="text-sm font-medium text-neutral-500">Company</h3>
                            <p className="text-neutral-800">{profile.company}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Member Since</h3>
                          <p className="text-neutral-800">
                            {profile.createdAt 
                              ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                                  month: 'long',
                                  year: 'numeric'
                                })
                              : 'Unknown'
                            }
                          </p>
                        </div>

                        
                        {/* Add Edit Profile Button for own profile */}
                        {isOwnProfile && (
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setIsEditProfileDialogOpen(true)}
                              className="flex items-center gap-2"
                            >
                              <Pencil size={16} />
                              Edit Profile
                            </Button>
                          </div>
                        )}
                        
                        {/* Only show categories section for To Be Packing */}
                        {(profile.id === 1 || (profile.id === 5 && profile.fullName === "To Be Packing")) && (
                          <div>
                            <h3 className="text-sm font-medium text-neutral-500">Categories</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <div
                                onClick={() => window.location.href = "/directory?category=packaging"}
                                className="inline-block"
                              >
                                <Badge variant="outline" className="bg-neutral-100 cursor-pointer hover:bg-neutral-200">Packaging</Badge>
                              </div>
                              <div
                                onClick={() => window.location.href = "/directory?category=displays"}
                                className="inline-block"
                              >
                                <Badge variant="outline" className="bg-neutral-100 cursor-pointer hover:bg-neutral-200">Displays</Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">Photo Gallery</h2>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUploadPhotoDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                      Add Photos
                    </Button>
                  )}
                </div>
                
                {/* Show To Be Packing default photos or user photos */}
                {(profile.id === 5 || profile.id === 1) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/prova%20con%20sfumatura%20bianca.jpg" 
                        alt="To Be Packing Jewelry Display Case" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Jewelry Display Case</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/shopper%20SB.jpg" 
                        alt="To Be Packing Luxury Shopping Bag" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Luxury Shopping Bag</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/cassettiera%20SB.jpg" 
                        alt="To Be Packing Jewelry Cabinet" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Jewelry Storage Cabinet</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/vassoi%20SB.jpg" 
                        alt="To Be Packing Display Trays" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Jewelry Display Trays</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/orologio%20SB.jpg" 
                        alt="To Be Packing Watch Display" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Watch Display</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/pochetteSB.jpg" 
                        alt="To Be Packing Jewelry Pouches" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Jewelry Pouches</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/rotoli%20SB.jpg" 
                        alt="To Be Packing Ring Rolls" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Ring Display Rolls</p>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md h-64">
                      <img 
                        src="https://www.tobepacking.com/hubfs/otto%20SB.jpg" 
                        alt="To Be Packing Jewelry Boxes" 
                        className="w-full h-48 object-cover"
                        loading="eager"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-800">Premium Jewelry Boxes</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-neutral-500">No photos have been added yet.</p>
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsUploadPhotoDialogOpen(true)}
                      >
                        Add Your First Photo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            

            
            <TabsContent value="connections">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">Network</h2>
                  <div className="text-sm text-neutral-600">
                    {connections?.length || 0} connections
                  </div>
                </div>

                {connections && connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map((connection) => (
                      <Card key={connection.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                              {connection.connectedUser?.fullName?.charAt(0) || connection.connectedUser?.username?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-neutral-900 truncate">
                                {connection.connectedUser?.fullName || connection.connectedUser?.username}
                              </h3>
                              {connection.connectedUser?.company && (
                                <p className="text-sm text-neutral-600 truncate">
                                  {connection.connectedUser.company}
                                </p>
                              )}
                              <p className="text-xs text-neutral-500">
                                Connected {new Date(connection.createdAt || '').toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No connections yet</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      {isOwnProfile 
                        ? "Start building your professional network by connecting with other jewelry industry professionals."
                        : "This user hasn't made any connections yet."
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Fixed floating back button at the bottom of the page */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full bg-white shadow-lg border-2 border-secondary px-4 py-2 hover:bg-secondary/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="font-medium text-secondary">Back</span>
          </Button>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet";
import { User, InventoryItem, Connection } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import tobeOfficialLogo from "../assets/tobe-official-logo.svg";

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

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const profileId = parseInt(params?.id || "0");
  const isOwnProfile = user?.id === profileId;
  
  // Functions for To Be Packing profile
  const connectHandler = () => {
    if (!user) return;
    connectionMutation.mutate();
  };
  
  const toggleMessaging = (open: boolean) => {
    // This would be implemented when adding messaging functionality
    console.log('Toggle messaging:', open);
  };

  // Effect to remove the Rubik's cube decorative element
  useEffect(() => {
    if (profileId === 1 && profileRef.current) {
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
        title: "Connection request sent",
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
  if (profileId === 1) {
    return (
      <>
        <Helmet>
          <title>{`${profile.fullName} - JewelConnect Profile`}</title>
          <meta name="description" content={`View the professional profile of ${profile.fullName}, ${profile.userType} in the jewelry industry.`} />
        </Helmet>
        
        <Navbar />
        
        <main className="pt-16 pb-12 min-h-screen profile-page-container">
          {/* To Be Packing Custom Profile Header */}
          <div className="bg-white shadow-md">
            <div className="container mx-auto px-4">
              <div className="relative py-6">
                {/* Profile Info */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-6 px-4">
                  <div className="flex items-center justify-center mb-4 md:mb-0">
                    <div className="h-32 w-32 flex items-center justify-center">
                      <img 
                        src="/tobe-exact-logo.png" 
                        alt="To Be Packing" 
                        className="h-full w-full rounded-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="md:ml-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                      <h1 className="text-3xl font-serif font-bold text-neutral-800">
                        {profile.fullName}
                      </h1>
                      {profile.isPremium && (
                        <span className="mt-2 md:mt-0 inline-block bg-amber-400 text-neutral-900 rounded-full px-3 py-1 text-sm font-medium">Premium</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileId === 1 ? (
                        <>
                          <Link href="/directory?profession=packaging">
                            <a>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs py-1 px-3 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                                Packaging
                              </Badge>
                            </a>
                          </Link>
                          <Link href="/directory?profession=displays">
                            <a>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs py-1 px-3 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                                Displays
                              </Badge>
                            </a>
                          </Link>
                        </>
                      ) : (
                        <Link href={`/directory?profession=${profile.userType}`}>
                          <a>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs py-1 px-3 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                              {profile.userType.charAt(0).toUpperCase() + profile.userType.slice(1)}
                            </Badge>
                          </a>
                        </Link>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2 text-center">
                      <div className="text-sm">
                        <span>Headquarters</span>
                        <span className="mx-2">
                          <a href="https://www.google.com/maps/place/To+Be+Packing+S.r.l/@45.6045438,9.6353688,15z/data=!3m1!4b1!4m6!3m5!1s0x478152f88f6fb0f7:0x3a73f0ba01109ce8!8m2!3d45.6045303!4d9.6538228!16s%2Fg%2F1vbl6fkj?entry=ttu&g_ep=EgoyMDI1MDUwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                            Comun Nuovo, Italy
                          </a>
                        </span>
                      </div>
                      <div className="text-sm">
                        <span>Showroom</span>
                        <span className="mx-2">
                          <a href="https://www.google.com/maps/place/To+Be+Packing+S.r.l./@45.4674906,9.1958587,16z/data=!3m1!4b1!4m6!3m5!1s0x4786c7e836390343:0xfe112dc1a012a518!8m2!3d45.4674869!4d9.1984336!16s%2Fg%2F11jq05bsb7?entry=ttu&g_ep=EgoyMDI1MDUwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                            Milan, Italy
                          </a>
                        </span>
                      </div>
                      <div className="text-sm">
                        <span>Showroom</span>
                        <span className="mx-2">
                          <a href="https://www.google.com/maps/place/TO+BE+PACKING/@40.7554807,-73.9827917,17z/data=!3m2!4b1!5s0x89c2588c9d7ca34f:0xfd91a953c9a4ae2!4m6!3m5!1s0x89c258ffccfd906f:0xa87882ce5e72355b!8m2!3d40.7554767!4d-73.9802168!16s%2Fg%2F11clv759my?entry=ttu&g_ep=EgoyMDI1MDUwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                            New York, NY
                          </a>
                        </span>
                      </div>
                      <div className="text-sm mt-3">
                        <a href="https://www.tobepacking.com/" target="_blank" rel="noopener noreferrer" className="text-primary">
                          https://www.tobepacking.com/
                        </a>
                      </div>
                      <div className="text-sm">
                        {showEmailOptions ? (
                          <div className="flex flex-col space-y-2 p-2 bg-white shadow-md rounded-md border">
                            <div className="text-xs text-gray-500 mb-1">Contact via email:</div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => {
                                  window.open('mailto:carmela@tobe.it', '_blank');
                                  setShowEmailOptions(false);
                                }}
                                className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
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
                                className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
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
                                className="flex flex-col items-center p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                <svg className="w-4 h-4 mb-1" viewBox="0 0 24 24" fill="#0078D4" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22 12C22 15.978 22 18 20 20C18 22 15.978 22 12 22C8.022 22 6 22 4 20C2 18 2 15.978 2 12C2 8.022 2 6 4 4C6 2 8.022 2 12 2C15.978 2 18 2 20 4C22 6 22 8.022 22 12Z"/>
                                  <path fill="white" d="M16 8.26795C16 7.81748 16 7.59224 15.9424 7.38673C15.7056 6.93276 15.2327 6.71447 14.7658 6.85315C14.5489 6.92252 14.342 7.12722 13.9282 7.53664L13.8466 7.61817C13.6336 7.83115 13.527 7.93764 13.4182 8.03739C13.2983 8.14404 13.1756 8.24466 13.0503 8.33905C12.9347 8.42584 12.8154 8.50438 12.5772 8.66146L12.5138 8.70376C12.1643 8.93519 11.9896 9.05091 11.8121 9.12482C11.6084 9.21229 11.3935 9.2588 11.176 9.26284C10.9828 9.26636 10.7877 9.23335 10.4006 9.16736L10.3179 9.15283C9.93442 9.08706 9.74266 9.05417 9.55759 9.05456C9.3562 9.055 9.15793 9.09058 8.97329 9.15882C8.80942 9.21857 8.66148 9.31097 8.3738 9.4922L8.32376 9.52583C8.03189 9.71189 7.88595 9.80493 7.76462 9.91861C7.63339 10.0442 7.51931 10.1845 7.42492 10.3364C7.33679 10.4783 7.26608 10.6331 7.12468 10.9427L7.09018 11.0147C6.8919 11.4085 6.79276 11.6054 6.75482 11.8101C6.7227 11.9829 6.72566 12.159 6.76353 12.3308C6.80595 12.5207 6.90758 12.6972 7.11084 13.0504L7.2302 13.2686C7.46584 13.6659 7.58366 13.8646 7.74114 14.0379C7.92744 14.2426 8.15523 14.406 8.40962 14.5171C8.63566 14.6155 8.8842 14.6671 9.38129 14.7704L9.44748 14.7837C9.91371 14.8805 10.1468 14.9288 10.3689 14.9318C10.6526 14.9357 10.9347 14.882 11.1984 14.7745C11.4169 14.6832 11.6243 14.5469 12.0361 14.276L12.1201 14.2222C12.5178 13.9602 12.7166 13.8292 12.9178 13.7271C13.1453 13.6133 13.3878 13.5331 13.6382 13.4888C13.8579 13.4491 14.0823 13.4438 14.5294 13.4434C14.7382 13.4434 14.8425 13.4449 14.9235 13.4533C15.044 13.4661 15.1633 13.4894 15.2797 13.5231C15.3673 13.5492 15.4541 13.5846 15.6287 13.6555C15.8434 13.7419 15.9507 13.785 16.0414 13.8258C16.4024 14.025 16.4677 14.6561 16.1649 14.9683C16.0685 15.0688 15.8782 15.1358 15.5001 15.2686L15.4371 15.2892C15.0684 15.4188 14.8842 15.4836 14.7089 15.5259C14.4995 15.5775 14.2861 15.6081 14.0714 15.6172C13.8848 15.6253 13.6965 15.6132 13.3236 15.5888L13.2264 15.5831C12.86 15.56 12.6769 15.5484 12.5021 15.5572C12.2944 15.5676 12.0893 15.6047 11.8918 15.6674C11.724 15.7208 11.5655 15.8 11.2563 15.9562L11.1975 15.9836C10.8839 16.1425 10.727 16.2219 10.577 16.3051C10.4044 16.402 10.2412 16.5139 10.0892 16.6398C9.95456 16.7521 9.83032 16.8783 9.58556 17.1257L9.53675 17.1749C9.10964 17.6066 8.89608 17.8224 8.69024 17.9392C8.22344 18.2114 7.65329 18.2126 7.19329 17.9291C6.99058 17.811 6.78175 17.5938 6.36407 17.1595L6.31889 17.1127C5.95577 16.7354 5.77421 16.5468 5.65176 16.3241C5.529 16.1014 5.45594 15.8576 5.43745 15.607C5.41893 15.3562 5.45688 15.096 5.53279 14.574L5.54444 14.5063C5.61855 13.9946 5.65561 13.7388 5.72847 13.5106C5.81293 13.2462 5.9408 12.9975 6.10655 12.7737C6.25189 12.577 6.43581 12.4053 6.80143 12.0633L6.85684 12.0109C7.21454 11.6766 7.39339 11.5095 7.58781 11.3764C7.82133 11.2173 8.08051 11.0971 8.35487 11.0209C8.59037 10.9557 8.83956 10.9256 9.33431 10.8664L9.39709 10.8587C9.87585 10.8017 10.1152 10.7732 10.344 10.7939C10.6241 10.8197 10.8991 10.8934 11.1587 11.0122C11.3804 11.1138 11.5859 11.2509 11.9892 11.5216L12.045 11.5598C12.4378 11.8229 12.6342 11.9545 12.8331 12.0599C13.0591 12.1789 13.3003 12.2645 13.55 12.3142C13.7685 12.3578 13.9922 12.3702 14.4375 12.3774L14.5012 12.3784C14.9351 12.3849 15.152 12.3881 15.3394 12.357C15.5592 12.3205 15.7716 12.2428 15.9651 12.1278C16.125 12.0307 16.2677 11.8979 16.5508 11.6352L16.5845 11.6044C16.8608 11.3507 16.9989 11.2238 17.0863 11.0799C17.3033 10.7265 17.3033 10.2739 17.0863 9.92056C16.9989 9.77659 16.8608 9.64971 16.5845 9.39597L16.5508 9.36516C16.2677 9.10243 16.125 8.96968 15.9651 8.87258C15.7716 8.75758 15.5592 8.67988 15.3394 8.64339C15.1496 8.61216 14.9302 8.61548 14.4913 8.62213L14.4277 8.62309C13.9824 8.63034 13.7586 8.63429 13.5401 8.67787C13.2903 8.72752 13.0491 8.81313 12.8231 8.93209C12.6242 9.03743 12.4278 9.16911 12.035 9.43215L11.9791 9.47035C11.5759 9.74111 11.3705 9.87818 11.1486 9.97981C10.889 10.0986 10.614 10.1723 10.3339 10.1981C10.1052 10.2188 9.86583 10.1903 9.38707 10.1333L9.32429 10.1256C8.83037 10.0664 8.58034 10.0364 8.34439 9.97119C8.07003 9.89494 7.81085 9.77478 7.57733 9.61571C7.38263 9.48272 7.20379 9.31555 6.84608 8.98121L6.79067 8.92884C6.42505 8.58679 6.24114 8.41512 6.09579 8.21847C5.93004 7.99463 5.80218 7.74595 5.71771 7.48155C5.64485 7.25331 5.6078 6.99748 5.53368 6.48586L5.52203 6.41814C5.44612 5.89612 5.40817 5.63597 5.4267 5.38515C5.44518 5.13451 5.51824 4.89073 5.641 4.66801C5.76346 4.44534 5.94501 4.25673 6.30813 3.8794L6.35332 3.83265C6.77099 3.39836 6.97982 3.18112 7.18254 3.06301C7.64254 2.77949 8.21268 2.78067 8.67949 3.05289C8.88533 3.1697 9.09889 3.38553 9.526 3.81724L9.5748 3.86639C9.81956 4.11376 9.9438 4.24001 10.0784 4.35228C10.2304 4.47818 10.3936 4.59006 10.5662 4.68701C10.7163 4.77025 10.8732 4.84962 11.1867 5.00849L11.2455 5.03585C11.5547 5.19203 11.7132 5.27128 11.881 5.32473C12.0786 5.38742 12.2836 5.42448 12.4913 5.43491C12.6661 5.44372 12.8493 5.43213 13.2156 5.40902L13.3128 5.40329C13.6858 5.37888 13.874 5.36678 14.0606 5.37488C14.2753 5.384 14.4887 5.41455 14.6981 5.46616C14.8734 5.50853 15.0576 5.57333 15.4264 5.70293L15.4894 5.72347C15.8675 5.85627 16.0578 5.92332 16.1541 6.02378C16.457 6.33603 16.3916 6.9671 16.0306 7.16628C15.94 7.20707 15.8327 7.25019 15.6179 7.33655C15.4433 7.40748 15.3565 7.44293 15.2689 7.46898C15.1525 7.50266 15.0332 7.52602 14.9127 7.53884C14.8317 7.54721 14.7274 7.54871 14.5186 7.54871C14.0715 7.54824 13.8471 7.54297 13.6274 7.50325C13.377 7.45903 13.1344 7.37879 12.907 7.26499C12.7058 7.16296 12.507 7.03196 12.1093 6.7699L12.0252 6.71614C11.6135 6.44514 11.4061 6.30893 11.1876 6.21758C10.9239 6.11012 10.6418 6.05639 10.3581 6.06029C10.1359 6.06327 9.90288 6.11162 9.43664 6.20836L9.37045 6.22165C8.87336 6.3249 8.62482 6.37662 8.39878 6.47501C8.14439 6.58603 7.9166 6.74947 7.7303 6.95417C7.57283 7.12747 7.455 7.32618 7.21936 7.72349L7.1 7.94167C6.89674 8.29482 6.79511 8.47139 6.75269 8.66127C6.71482 8.83305 6.71778 9.00921 6.74991 9.18201C6.78784 9.38665 6.88698 9.58361 7.08526 9.97744L7.11976 10.0494C7.26116 10.359 7.33187 10.5138 7.42 10.6557C7.51439 10.8076 7.62847 10.9479 7.7597 11.0735C7.88103 11.1872 8.02697 11.2802 8.31884 11.4663L8.36888 11.4999C8.65656 11.6811 8.8045 11.7735 8.96837 11.8333C9.15301 11.9015 9.35128 11.9371 9.55267 11.9375C9.73774 11.9379 9.9295 11.905 10.3129 11.8393L10.3957 11.8247C10.7828 11.7587 10.9779 11.7257 11.1711 11.7293C11.3885 11.7333 11.6035 11.7798 11.8072 11.8673C11.9846 11.9412 12.1593 12.0569 12.5089 12.2883L12.5722 12.3306C12.8104 12.4877 12.9298 12.5663 13.0454 12.6531C13.1706 12.7474 13.2933 12.8481 13.4132 12.9547C13.522 13.0545 13.6287 13.161 13.8417 13.3739L13.9233 13.4555C14.3371 13.8649 14.544 14.0696 14.7609 14.139C15.2279 14.2776 15.7008 14.0593 15.9375 13.6054C15.9951 13.3999 15.9951 13.1746 15.9951 12.7242V8.26795Z"/>
                                </svg>
                                Outlook
                              </button>
                            </div>
                            <div className="flex justify-end mt-1">
                              <button
                                onClick={() => setShowEmailOptions(false)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowEmailOptions(true)} 
                            className="text-primary underline text-left"
                          >
                            carmela@tobe.it
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 ml-auto flex flex-col md:flex-row gap-2">
                    {!isOwnProfile && (
                      <>
                        {connectionStatus === 'pending' ? (
                          <Button disabled className="cursor-not-allowed">
                            Request Pending
                          </Button>
                        ) : connectionStatus === 'accepted' ? (
                          <Button variant="outline">
                            Already Connected
                          </Button>
                        ) : (
                          <Button onClick={connectHandler}>
                            Connect
                          </Button>
                        )}
                        <Button variant="secondary" onClick={() => toggleMessaging(true)}>
                          Message
                        </Button>
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
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-4">About</h2>
                        <p className="text-neutral-700 whitespace-pre-line">
                          {profile.bio || "No bio available"}
                        </p>
                        
                        <h3 className="text-xl font-serif font-bold mt-8 mb-4">Social Media</h3>
                        <div className="flex flex-wrap gap-4">
                          <a 
                            href="https://www.instagram.com/tobepackagingofficial/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="rounded-full bg-primary text-white p-3 hover:bg-primary/90 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                            </svg>
                          </a>
                          <a 
                            href="https://it.pinterest.com/tobepackingofficial/_created/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="rounded-full bg-primary text-white p-3 hover:bg-primary/90 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <line x1="12" x2="12" y1="16" y2="21"></line>
                              <line x1="9" x2="9" y1="9" y2="9.01"></line>
                              <path d="M15 9a3 3 0 1 0-3.46 2.97V16a2 2 0 0 0 4 0v-4.03A3 3 0 0 0 15 9Z"></path>
                            </svg>
                          </a>
                          <a 
                            href="https://www.facebook.com/tobepackaging" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="rounded-full bg-primary text-white p-3 hover:bg-primary/90 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-4">Brand Partnerships</h2>
                        <div className="space-y-3">
                          {['Cartier', 'Tiffany & Co.', 'Bulgari', 'Van Cleef & Arpels'].map((brand, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <p className="font-medium">{brand}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="inventory">
                {inventoryItems && inventoryItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {inventoryItems.map(item => (
                      <Card key={item.id} className="profile-section-card hover:shadow-md">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                          <p className="text-neutral-600 mb-2">{item.isFeatured ? 'Featured' : 'Standard'}</p>
                          <p className="text-neutral-700 mb-4">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{item.isNew ? 'New' : 'Used'}</Badge>
                            {item.isFeatured && <Badge variant="secondary">Featured</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-600">No inventory items available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="connections">
                {/* Mock connections for To Be Packing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Cartier', 'Tiffany & Co.', 'Bulgari', 'Van Cleef & Arpels'].map((name, idx) => (
                    <Card key={idx} className="profile-section-card hover:shadow-md">
                      <CardContent className="p-6 flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-white">
                            {name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{name}</h3>
                          <p className="text-sm text-neutral-600">Jewelry Brand</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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
        <meta name="description" content={`View the professional profile of ${profile.fullName}, ${profile.userType} in the jewelry industry.`} />
      </Helmet>
      
      <Navbar />
      
      <main ref={profileRef} className="pt-16 pb-12 min-h-screen profile-page-container">
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
                    <AvatarImage src={profile.profileImage || undefined} alt={profile.fullName} />
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
                        {profile.isPremium && (
                          <span className="ml-3 inline-block bg-amber-400 text-neutral-900 rounded-full px-3 py-1 text-sm font-medium">Premium</span>
                        )}
                      </div>
                      <p className="text-neutral-600">{profile.userType}</p>
                      {profile.location && (
                        <div className="flex items-center mt-1 text-sm text-neutral-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
                      {!isOwnProfile && (
                        <>
                          {connectionStatus === 'pending' && connectionObj?.requesterId !== user?.id && (
                            <Button onClick={() => acceptConnectionMutation.mutate(connectionObj!.id)}>
                              Accept Request
                            </Button>
                          )}
                          {connectionStatus === 'pending' && connectionObj?.requesterId === user?.id && (
                            <Button disabled className="cursor-not-allowed">
                              Request Pending
                            </Button>
                          )}
                          {connectionStatus === 'accepted' ? (
                            <Button variant="outline">
                              Already Connected
                            </Button>
                          ) : connectionStatus === null && (
                            <Button onClick={connectHandler}>
                              Connect
                            </Button>
                          )}
                          <Button variant="secondary" onClick={() => toggleMessaging(true)}>
                            Message
                          </Button>
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
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="connections">Network</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-serif font-bold mb-4">About</h2>
                      <p className="text-neutral-700 whitespace-pre-line">
                        {profile.bio || "No bio available"}
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
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Membership Status</h3>
                          <div className="mt-1">
                            <Badge variant={profile.isPremium ? "default" : "outline"} className={profile.isPremium ? "bg-secondary text-neutral-900" : ""}>
                              {profile.isPremium ? "Premium" : "Standard"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Categories</h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-neutral-100">Packaging</Badge>
                            <Badge variant="outline" className="bg-neutral-100">Displays</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory">
              {inventoryItems && inventoryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-neutral-100">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-serif text-lg font-bold line-clamp-1">{item.title}</h3>
                        <p className="text-neutral-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex gap-2 mt-2">
                          {item.isNew && (
                            <Badge variant="outline">New</Badge>
                          )}
                          {item.isFeatured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-neutral-800">No inventory items</h3>
                  <p className="mt-2 text-neutral-500 max-w-md mx-auto">
                    {isOwnProfile 
                      ? "You haven't added any inventory items yet. Add some to showcase your products."
                      : "This user hasn't added any inventory items yet."}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="connections">
              <div className="text-center py-16">
                <p className="text-neutral-600">Coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
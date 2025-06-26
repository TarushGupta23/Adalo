import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { User, ProfilePhoto } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function TestProfile() {
  const { user } = useAuth();
  const profileId = 7; // Our test user ID
  
  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: [`/api/users/${profileId}`],
    enabled: true
  });
  
  // Fetch profile photos
  const { data: profilePhotos, isLoading: isPhotosLoading } = useQuery<ProfilePhoto[]>({
    queryKey: [`/api/users/${profileId}/photos`],
    enabled: true
  });

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.fullName} - Profile | JewelConnect</title>
        <meta name="description" content={`View the profile of ${profile.fullName}, a professional in the jewelry industry.`} />
      </Helmet>
      
      <Navbar />
      
      <main className="pt-16 min-h-screen bg-neutral-50">
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
                  {profile.logoImage ? (
                    <img 
                      src={profile.logoImage} 
                      alt={`${profile.fullName} logo`}
                      className="h-32 w-32 rounded-xl border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <Avatar className="h-32 w-32 rounded-xl border-4 border-white shadow-lg">
                      <AvatarImage src={profile.profileImage || undefined} alt={profile.fullName} />
                      <AvatarFallback className="bg-primary text-white text-3xl">
                        {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
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
                      
                      {/* Location section */}
                      <div className="mt-2 space-y-1">
                        {profile.headquarters && (
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Headquarters <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(profile.headquarters)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {profile.headquarters}
                            </a></span>
                          </div>
                        )}
                        
                        {profile.showroom1 && (
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Showroom <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(profile.showroom1)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {profile.showroom1}
                            </a></span>
                          </div>
                        )}
                        
                        {profile.showroom2 && (
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Showroom <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(profile.showroom2)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {profile.showroom2}
                            </a></span>
                          </div>
                        )}
                      </div>
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
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-8 border-2 border-neutral-200 shadow-sm p-1 rounded-lg">
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Photos
              </TabsTrigger>
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
                  
                  {/* Contact Information */}
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-serif font-bold mb-4">Contact Information</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {profile.website && (
                          <div>
                            <h3 className="text-sm font-medium text-neutral-500">Website</h3>
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {profile.website}
                            </a>
                          </div>
                        )}
                        
                        {profile.phone && (
                          <div>
                            <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                            <p className="text-neutral-800">{profile.phone}</p>
                          </div>
                        )}
                        
                        {profile.email && (
                          <div>
                            <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                            <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                              {profile.email}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* Social Media */}
                      {(profile.instagram || profile.facebook || profile.pinterest) && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Social Media</h3>
                          <div className="flex gap-3">
                            {profile.instagram && (
                              <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-pink-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            )}
                            
                            {profile.facebook && (
                              <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                </svg>
                              </a>
                            )}
                            
                            {profile.pinterest && (
                              <a href={`https://pinterest.com/${profile.pinterest}`} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-red-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
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
                          <h3 className="text-sm font-medium text-neutral-500">Profession</h3>
                          <p className="text-neutral-800">{profile.userType}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">Photo Gallery</h2>
                </div>
                
                {isPhotosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-neutral-100 rounded-lg aspect-video animate-pulse"></div>
                    ))}
                  </div>
                ) : profilePhotos && profilePhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profilePhotos.map((photo) => (
                      <div key={photo.id} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <img 
                          src={photo.photoUrl} 
                          alt={photo.caption || "Gallery photo"} 
                          className="w-full aspect-video object-cover"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white font-medium">{photo.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-neutral-500">No photos in gallery yet</p>
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
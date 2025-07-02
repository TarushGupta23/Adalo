import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Type definitions for marketplace listings
type MarketplaceListing = {
  id: number;
  userId: number;
  title: string;
  description: string;
  price: number;
  listingType: "finished_jewelry" | "jewelry_parts" | "equipment" | "supplies" | "other";
  isChain?: boolean;
  condition: string;
  imageUrl?: string;
  isCloseout: boolean;
  isTradeAvailable: boolean;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    company?: string;
    location?: string;
  };
};

// Form schema for creating a listing
const listingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  listingType: z.enum(["finished_jewelry", "jewelry_parts", "equipment", "supplies", "other"]),
  isChain: z.boolean().default(false),
  condition: z.string().min(3, "Condition is required"),
  imageUrl: z.string().optional(),
  isCloseout: z.boolean().default(false),
  isTradeAvailable: z.boolean().default(false),
  availableQuantity: z.coerce.number().int().positive("Quantity must be positive")
});

function JewelryMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [showCloseoutOnly, setShowCloseoutOnly] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch marketplace listings
  const { data: listings, isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ['/api/marketplace', selectedType, showCloseoutOnly, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType === "chains") {
        params.append("type", "jewelry_parts");
        params.append("isChain", "true");
      } else if (selectedType && selectedType !== "all") {
        params.append("type", selectedType);
      }
      if (showCloseoutOnly) params.append("closeout", "true");
      if (searchQuery) params.append("q", searchQuery);

      try {
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${BACKEND_URL}/api/marketplace?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch marketplace listings");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching marketplace listings:", error);
        
        // Fallback data if API fails
        return [
          {
            id: 1,
            userId: 2,
            title: "Vintage Silver Bracelet Collection",
            description: "Assortment of 5 sterling silver bracelets, perfect for resale. Slight tarnish but excellent condition.",
            price: 350,
            listingType: "finished_jewelry",
            condition: "Used - Excellent",
            isCloseout: true,
            isTradeAvailable: true,
            availableQuantity: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 2,
              username: "silversmith",
              company: "Silver Artistry",
              location: "New York, NY"
            }
          },
          {
            id: 2,
            userId: 3,
            title: "Professional Jeweler's Bench",
            description: "Well-maintained professional jeweler's bench with built-in drawers and attachments for various tools.",
            price: 1200,
            listingType: "equipment",
            condition: "Used - Good",
            isCloseout: false,
            isTradeAvailable: false,
            availableQuantity: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 3,
              username: "toolmaster",
              company: "Jewel Tools Inc",
              location: "Chicago, IL"
            }
          },
          {
            id: 3,
            userId: 4,
            title: "Bulk Gold-Filled Jump Rings",
            description: "Closeout sale on 14k gold-filled jump rings, 4mm and 5mm sizes. Perfect for chainmaille and other jewelry work.",
            price: 85,
            listingType: "supplies",
            condition: "New",
            isCloseout: true,
            isTradeAvailable: false,
            availableQuantity: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 4,
              username: "supplysource",
              company: "Wholesale Findings",
              location: "Miami, FL"
            }
          }
        ] as MarketplaceListing[];
      }
    },
  });

  // Fetch user's listings if authenticated
  const { data: userListings, isLoading: isLoadingUserListings } = useQuery<MarketplaceListing[]>({
    queryKey: ['/api/marketplace/my-listings'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(BACKEND_URL+'/api/marketplace/my-listings');
        if (!response.ok) {
          throw new Error("Failed to fetch your listings");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user listings:", error);
        return [];
      }
    },
    enabled: !!user
  });

  // Create new listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (newListing: z.infer<typeof listingFormSchema>) => {
      const res = await apiRequest("POST", "/api/marketplace", newListing);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] });
      toast({
        title: "Listing Created",
        description: "Your item has been listed in the marketplace",
      });
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      await apiRequest("DELETE", `/api/marketplace/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] });
      toast({
        title: "Listing Deleted",
        description: "Your listing has been removed from the marketplace",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Contact seller mutation
  const contactSellerMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: number, message: string }) => {
      const res = await apiRequest("POST", "/api/messages", {
        recipientId: userId,
        content: message
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the seller",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Sending Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create listing form
  const form = useForm<z.infer<typeof listingFormSchema>>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      listingType: "finished_jewelry",
      condition: "Used - Good",
      imageUrl: "",
      isCloseout: false,
      isTradeAvailable: false,
      availableQuantity: 1,
      isChain: false
    },
  });

  function onSubmit(values: z.infer<typeof listingFormSchema>) {
    createListingMutation.mutate(values);
  }

  const handleContactSeller = (userId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact sellers",
        variant: "destructive",
      });
      return;
    }

    const message = prompt("Enter your message to the seller:");
    if (message) {
      contactSellerMutation.mutate({ userId, message });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center focus:outline-none group">
          <div className="relative mb-0 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-amber-100 opacity-70 blur-sm transform scale-95 group-hover:scale-100 transition-all duration-300"></div>
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-amber-100 transform transition-all duration-300 group-hover:scale-110 relative z-10 shadow-sm group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-700">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-serif font-semibold text-lg text-neutral-800 group-hover:text-amber-700 transition-colors duration-300">
              Back to Home
            </h3>
            <div className="text-xs mt-1 flex items-center justify-start gap-1 py-0.5 px-2 rounded-full bg-neutral-50 group-hover:bg-neutral-100 transition-colors duration-300 border border-neutral-100">
              <span className="text-neutral-500">Return to main menu</span>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-between mb-8 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold mb-2">Jewelry Industry Marketplace</h1>
          <p className="text-muted-foreground max-w-2xl">
            Buy, sell, or trade jewelry closeouts, equipment, and supplies directly with other industry professionals.
          </p>
        </div>
        {user && (
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Listing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="col-span-1 md:col-span-3">
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="finished_jewelry">Finished Jewelry</SelectItem>
              <SelectItem value="jewelry_parts">Jewelry Parts</SelectItem>
              <SelectItem value="chains">- Chains</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="closeoutOnly" 
              checked={showCloseoutOnly} 
              onCheckedChange={(checked) => setShowCloseoutOnly(checked === true)}
            />
            <Label htmlFor="closeoutOnly">Closeout Only</Label>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="browse">Browse Listings</TabsTrigger>
          {user && (
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-1">{listing.title}</CardTitle>
                        <CardDescription>
                          By {listing.user?.company || listing.user?.username || "Unknown Seller"} • {listing.user?.location || "Location not specified"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        {listing.isCloseout && (
                          <Badge variant="destructive">Closeout</Badge>
                        )}
                        <Badge variant="outline">{listing.listingType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm mb-4">{listing.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Condition:</span> {listing.condition}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {listing.availableQuantity}
                      </div>
                      {listing.isTradeAvailable && (
                        <div className="col-span-2">
                          <Badge variant="secondary">Open to Trades</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-xl font-bold">${listing.price.toLocaleString()}</div>
                    <Button onClick={() => handleContactSeller(listing.userId)}>
                      Contact Seller
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-listings">
            {isLoadingUserListings ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : userListings && userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => (
                  <Card key={listing.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="mb-1">{listing.title}</CardTitle>
                        <div className="flex flex-col gap-1">
                          {listing.isCloseout && (
                            <Badge variant="destructive">Closeout</Badge>
                          )}
                          <Badge variant="outline">{listing.listingType}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm mb-4">{listing.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <span className="font-medium">Condition:</span> {listing.condition}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {listing.availableQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> ${listing.price.toLocaleString()}
                        </div>
                        {listing.isTradeAvailable && (
                          <div>
                            <Badge variant="secondary">Open to Trades</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button 
                        variant="secondary"
                        onClick={() => {
                          const edit = window.confirm("Would you like to edit this listing?");
                          // Edit functionality would go here
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this listing?")) {
                            deleteListingMutation.mutate(listing.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">You have no active listings</h3>
                <p className="text-muted-foreground mb-4">Create a listing to sell or trade your items</p>
                <Button onClick={() => setCreateDialogOpen(true)}>Create Listing</Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Create Listing Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Marketplace Listing</DialogTitle>
            <DialogDescription>
              List your jewelry, equipment, or supplies for sale or trade with other industry professionals.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Sterling Silver Chain Collection'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availableQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Available</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset isChain to false if not selecting jewelry_parts
                            if (value !== "jewelry_parts") {
                              form.setValue("isChain", false);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="finished_jewelry">Finished Jewelry</SelectItem>
                            <SelectItem value="jewelry_parts">Jewelry Parts</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("listingType") === "jewelry_parts" && (
                    <FormField
                      control={form.control}
                      name="isChain"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>This is a chain</FormLabel>
                            <FormDescription>
                              Check this if you're listing chains specifically
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                          <SelectItem value="Used - Good">Used - Good</SelectItem>
                          <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                          <SelectItem value="Refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about your item, including materials, specifications, and any other relevant information."
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image of your item. Leave blank if you don't have an image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isCloseout"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Closeout Sale</FormLabel>
                        <FormDescription>
                          Mark this as a closeout or liquidation sale
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTradeAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Open to Trades</FormLabel>
                        <FormDescription>
                          Indicate if you're willing to trade this item
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createListingMutation.isPending}>
                  {createListingMutation.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JewelryMarketplace;
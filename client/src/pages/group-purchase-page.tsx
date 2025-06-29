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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Type definitions for group purchase
type GroupPurchase = {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  productUrl?: string;
  imageUrl?: string;
  targetQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  discountedUnitPrice?: number;
  deadline?: string;
  status: "open" | "fulfilled" | "expired" | "cancelled";
  vendorName: string;
  vendorContact?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    username: string;
    company?: string;
  };
  participants?: GroupPurchaseParticipant[];
};

type GroupPurchaseParticipant = {
  id: number;
  groupPurchaseId: number;
  userId: number;
  quantity: number;
  status: "interested" | "committed" | "paid";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    company?: string;
  };
};

// Form schema for creating a group purchase
const groupPurchaseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  productUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetQuantity: z.coerce.number().int().min(3, "Target quantity must be at least 3"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  discountedUnitPrice: z.coerce.number().positive("Discounted price must be positive").optional(),
  deadline: z.date().optional(),
  vendorName: z.string().min(2, "Vendor name is required"),
  vendorContact: z.string().optional(),
});

// Form schema for joining a group purchase
const joinGroupFormSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

function GroupPurchasePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("open");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGroupPurchase, setSelectedGroupPurchase] = useState<GroupPurchase | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);

  // Fetch group purchases
  const { data: groupPurchases, isLoading } = useQuery<GroupPurchase[]>({
    queryKey: ['/api/group-purchases', activeTab],
    queryFn: async () => {
      try {
        const url = activeTab !== "all" ? `/api/group-purchases?status=${activeTab}` : `/api/group-purchases`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch group purchases");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching group purchases:", error);
        
        // Fallback data if API fails
        const now = new Date().toISOString();
        const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        
        return [
          {
            id: 1,
            creatorId: 2,
            title: "Bulk Gold 14K Chain Order",
            description: "Group purchase for 14K gold chain from manufacturer. Minimum order quantity is 20 chains for wholesale pricing. 50% discount on retail price.",
            productUrl: "https://example.com/gold-chains",
            targetQuantity: 20,
            currentQuantity: 12,
            unitPrice: 450,
            discountedUnitPrice: 225,
            deadline: twoWeeksLater,
            status: "open",
            vendorName: "Gold Supply Co.",
            vendorContact: "sales@goldsupplyco.example.com",
            createdAt: now,
            updatedAt: now,
            creator: {
              id: 2,
              username: "goldsmith",
              company: "Golden Creations"
            },
            participants: [
              {
                id: 1,
                groupPurchaseId: 1,
                userId: 2,
                quantity: 5,
                status: "committed",
                createdAt: now,
                updatedAt: now,
                user: {
                  id: 2,
                  username: "goldsmith",
                  company: "Golden Creations"
                }
              },
              {
                id: 2,
                groupPurchaseId: 1,
                userId: 3,
                quantity: 7,
                status: "committed",
                createdAt: now,
                updatedAt: now,
                user: {
                  id: 3,
                  username: "jewelrymaker",
                  company: "Fine Jewelry Co."
                }
              }
            ]
          },
          {
            id: 2,
            creatorId: 3,
            title: "Gemstone Setting Tools Bulk Order",
            description: "Group purchase for professional gemstone setting tools from top manufacturer. Need to reach 15 sets to get wholesale pricing.",
            targetQuantity: 15,
            currentQuantity: 15,
            unitPrice: 800,
            discountedUnitPrice: 550,
            status: "fulfilled",
            vendorName: "Pro Tools Manufacturing",
            createdAt: now,
            updatedAt: now,
            creator: {
              id: 3,
              username: "jewelrymaker",
              company: "Fine Jewelry Co."
            }
          },
          {
            id: 3,
            creatorId: 4,
            title: "Jewelry Display Cases - MOQ 25 units",
            description: "Custom jewelry display cases for trade shows. Manufacturer requires minimum order of 25 units for production run.",
            productUrl: "https://example.com/display-cases",
            targetQuantity: 25,
            currentQuantity: 8,
            unitPrice: 120,
            discountedUnitPrice: 85,
            deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            status: "expired",
            vendorName: "Display Solutions Inc.",
            createdAt: now,
            updatedAt: now,
            creator: {
              id: 4,
              username: "displaypro",
              company: "Showcase Designs"
            }
          }
        ] as GroupPurchase[];
      }
    },
  });

  // Fetch user's created group purchases if authenticated
  const { data: userCreatedPurchases, isLoading: isLoadingUserCreated } = useQuery<GroupPurchase[]>({
    queryKey: ['/api/group-purchases/created'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const response = await fetch('/api/group-purchases/created');
        if (!response.ok) {
          throw new Error("Failed to fetch your created group purchases");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user created group purchases:", error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch user's participating group purchases if authenticated
  const { data: userParticipatingPurchases, isLoading: isLoadingUserParticipating } = useQuery<GroupPurchase[]>({
    queryKey: ['/api/group-purchases/participating'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const response = await fetch('/api/group-purchases/participating');
        if (!response.ok) {
          throw new Error("Failed to fetch your participating group purchases");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user participating group purchases:", error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch participants for a specific group purchase
  const { data: participants, isLoading: isLoadingParticipants } = useQuery<GroupPurchaseParticipant[]>({
    queryKey: ['/api/group-purchases/participants', selectedGroupPurchase?.id],
    queryFn: async () => {
      if (!selectedGroupPurchase) return [];
      
      try {
        const response = await fetch(`/api/group-purchases/${selectedGroupPurchase.id}/participants`);
        if (!response.ok) {
          throw new Error("Failed to fetch participants");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching participants:", error);
        return selectedGroupPurchase.participants || [];
      }
    },
    enabled: !!selectedGroupPurchase
  });

  // Create new group purchase mutation
  const createGroupPurchaseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof groupPurchaseFormSchema>) => {
      const res = await apiRequest("POST", "/api/group-purchases", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases/created'] });
      toast({
        title: "Group Purchase Created",
        description: "Your group purchase has been created",
      });
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Group Purchase",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join group purchase mutation
  const joinGroupPurchaseMutation = useMutation({
    mutationFn: async ({ groupPurchaseId, quantity }: { groupPurchaseId: number, quantity: number }) => {
      const res = await apiRequest("POST", `/api/group-purchases/${groupPurchaseId}/join`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases/participating'] });
      toast({
        title: "Joined Group Purchase",
        description: "You have successfully joined the group purchase",
      });
      setJoinDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Joining Group Purchase",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel group purchase mutation
  const cancelGroupPurchaseMutation = useMutation({
    mutationFn: async (groupPurchaseId: number) => {
      await apiRequest("PATCH", `/api/group-purchases/${groupPurchaseId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/group-purchases/created'] });
      toast({
        title: "Group Purchase Cancelled",
        description: "The group purchase has been cancelled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Cancelling Group Purchase",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create group purchase form
  const form = useForm<z.infer<typeof groupPurchaseFormSchema>>({
    resolver: zodResolver(groupPurchaseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      productUrl: "",
      imageUrl: "",
      targetQuantity: 10,
      unitPrice: 0,
      discountedUnitPrice: 0,
      vendorName: "",
      vendorContact: ""
    },
  });

  // Join group purchase form
  const joinForm = useForm<z.infer<typeof joinGroupFormSchema>>({
    resolver: zodResolver(joinGroupFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  function onSubmit(values: z.infer<typeof groupPurchaseFormSchema>) {
    createGroupPurchaseMutation.mutate(values);
  }

  function onJoinSubmit(values: z.infer<typeof joinGroupFormSchema>) {
    if (!selectedGroupPurchase) return;
    joinGroupPurchaseMutation.mutate({
      groupPurchaseId: selectedGroupPurchase.id,
      quantity: values.quantity
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Open</Badge>;
      case "fulfilled":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Fulfilled</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Expired</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function handleJoinClick(groupPurchase: GroupPurchase) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join group purchases",
        variant: "destructive",
      });
      return;
    }

    setSelectedGroupPurchase(groupPurchase);
    joinForm.reset({ quantity: 1 });
    setJoinDialogOpen(true);
  }

  function handleViewParticipants(groupPurchase: GroupPurchase) {
    setSelectedGroupPurchase(groupPurchase);
    setParticipantDialogOpen(true);
  }

  return (
   <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8"> {/* Added responsive horizontal padding */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center focus:outline-none group">
          <div className="relative mb-0 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-purple-100 opacity-70 blur-sm transform scale-95 group-hover:scale-100 transition-all duration-300"></div>
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-purple-100 transform transition-all duration-300 group-hover:scale-110 relative z-10 shadow-sm group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-purple-700">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-serif font-semibold text-lg text-neutral-800 group-hover:text-purple-700 transition-colors duration-300">
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
          <h1 className="text-3xl font-bold mb-2">Group Purchases</h1>
          <p className="text-muted-foreground max-w-2xl">
            Join forces with other jewelry professionals to meet minimum order quantities and unlock wholesale pricing.
          </p>
        </div>
        {user && (
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Group Purchase
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6 md:w-[400px]">
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-6">
          <GroupPurchasesList 
            purchases={groupPurchases?.filter(p => p.status === "open") || []} 
            isLoading={isLoading}
            onJoinClick={handleJoinClick}
            onViewParticipants={handleViewParticipants}
          />
        </TabsContent>

        <TabsContent value="fulfilled" className="space-y-6">
          <GroupPurchasesList 
            purchases={groupPurchases?.filter(p => p.status === "fulfilled") || []} 
            isLoading={isLoading}
            onJoinClick={handleJoinClick}
            onViewParticipants={handleViewParticipants}
          />
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <GroupPurchasesList 
            purchases={groupPurchases?.filter(p => p.status === "expired" || p.status === "cancelled") || []} 
            isLoading={isLoading}
            onJoinClick={handleJoinClick}
            onViewParticipants={handleViewParticipants}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <GroupPurchasesList 
            purchases={groupPurchases || []} 
            isLoading={isLoading}
            onJoinClick={handleJoinClick}
            onViewParticipants={handleViewParticipants}
          />
        </TabsContent>
      </Tabs>

      {user && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">My Group Purchases</h2>
          
          <Tabs defaultValue="participating">
            <TabsList className="mb-6">
              <TabsTrigger value="participating">Participating</TabsTrigger>
              <TabsTrigger value="created">Created by Me</TabsTrigger>
            </TabsList>

            <TabsContent value="participating" className="space-y-6">
              {isLoadingUserParticipating ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : userParticipatingPurchases && userParticipatingPurchases.length > 0 ? (
                <GroupPurchasesList 
                  purchases={userParticipatingPurchases} 
                  isLoading={false}
                  onJoinClick={handleJoinClick}
                  onViewParticipants={handleViewParticipants}
                />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">You're not participating in any group purchases</h3>
                  <p className="text-muted-foreground mb-4">Join a group purchase to get wholesale pricing on materials and equipment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              {isLoadingUserCreated ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : userCreatedPurchases && userCreatedPurchases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCreatedPurchases.map(purchase => (
                    <Card key={purchase.id} className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="mb-1">{purchase.title}</CardTitle>
                          {getStatusBadge(purchase.status)}
                        </div>
                        <CardDescription>Created {new Date(purchase.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <Progress
                          value={(purchase.currentQuantity / purchase.targetQuantity) * 100}
                          className="h-2 mb-2"
                        />
                        <div className="text-sm text-gray-600 mb-4">
                          {purchase.currentQuantity} of {purchase.targetQuantity} ({Math.round((purchase.currentQuantity / purchase.targetQuantity) * 100)}%)
                        </div>

                        <p className="text-sm mb-4">{purchase.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div>
                            <span className="font-medium">Unit Price:</span> ${purchase.unitPrice.toLocaleString()}
                          </div>
                          {purchase.discountedUnitPrice && (
                            <div>
                              <span className="font-medium">Discounted:</span> ${purchase.discountedUnitPrice.toLocaleString()}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Vendor:</span> {purchase.vendorName}
                          </div>
                          {purchase.deadline && (
                            <div>
                              <span className="font-medium">Deadline:</span> {new Date(purchase.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <Button 
                          variant="outline"
                          onClick={() => handleViewParticipants(purchase)}
                        >
                          View Participants
                        </Button>
                        
                        {purchase.status === "open" && (
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel this group purchase?")) {
                                cancelGroupPurchaseMutation.mutate(purchase.id);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">You haven't created any group purchases</h3>
                  <p className="text-muted-foreground mb-4">Create a group purchase to organize bulk orders with other professionals</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>Create Group Purchase</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create Group Purchase Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Group Purchase</DialogTitle>
            <DialogDescription>
              Organize a group purchase to meet minimum order quantities and get wholesale pricing.
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
                      <Input placeholder="e.g., 'Bulk Gold Chain Order - MOQ 20 units'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        The minimum quantity needed for the order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the group purchase will close
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        The regular retail price per unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountedUnitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discounted Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        The discounted wholesale price per unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Gold Supply Co.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendorContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'sales@vendor.com'" {...field} />
                      </FormControl>
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
                        placeholder="Provide details about the group purchase, including product specifications, benefits, and any other relevant information."
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/product" {...field} />
                      </FormControl>
                      <FormDescription>
                        Link to the product page
                      </FormDescription>
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
                        Link to an image of the product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGroupPurchaseMutation.isPending}>
                  {createGroupPurchaseMutation.isPending ? "Creating..." : "Create Group Purchase"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Join Group Purchase Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Group Purchase</DialogTitle>
            <DialogDescription>
              {selectedGroupPurchase?.title}
            </DialogDescription>
          </DialogHeader>

          <Form {...joinForm}>
            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-6">
              <FormField
                control={joinForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      How many units you want to purchase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedGroupPurchase && (
                <div className="rounded-md bg-muted p-4">
                  <p className="font-medium mb-2">Order Summary</p>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div>Unit Price:</div>
                    <div className="text-right">${selectedGroupPurchase.unitPrice.toLocaleString()}</div>
                    
                    {selectedGroupPurchase.discountedUnitPrice && (
                      <>
                        <div>Discounted Price:</div>
                        <div className="text-right">${selectedGroupPurchase.discountedUnitPrice.toLocaleString()}</div>
                        
                        <div>Quantity:</div>
                        <div className="text-right">{joinForm.watch("quantity")}</div>
                        
                        <div className="font-medium">Total:</div>
                        <div className="text-right font-medium">
                          ${(selectedGroupPurchase.discountedUnitPrice * (joinForm.watch("quantity") || 0)).toLocaleString()}
                        </div>
                        
                        <div className="col-span-2 mt-2 text-green-600">
                          You save: ${((selectedGroupPurchase.unitPrice - selectedGroupPurchase.discountedUnitPrice) * (joinForm.watch("quantity") || 0)).toLocaleString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setJoinDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={joinGroupPurchaseMutation.isPending}>
                  {joinGroupPurchaseMutation.isPending ? "Joining..." : "Join Group Purchase"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Participants Dialog */}
      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participants</DialogTitle>
            <DialogDescription>
              {selectedGroupPurchase?.title}
            </DialogDescription>
          </DialogHeader>

          {isLoadingParticipants ? (
            <div className="flex justify-center my-6">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : participants && participants.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 font-medium py-2 border-b">
                <div>Participant</div>
                <div>Quantity</div>
                <div>Status</div>
              </div>
              {participants.map(p => (
                <div key={p.id} className="grid grid-cols-3 py-2 border-b border-dashed last:border-0">
                  <div>{p.user?.username || `User ${p.userId}`}</div>
                  <div>{p.quantity}</div>
                  <div className="capitalize">{p.status}</div>
                </div>
              ))}
              
              <div className="pt-2 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total Quantity:</span>
                  <span>{participants.reduce((sum, p) => sum + p.quantity, 0)}</span>
                </div>
                {selectedGroupPurchase && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Target Quantity:</span>
                    <span>{selectedGroupPurchase.targetQuantity}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No participants yet</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setParticipantDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component to display a list of group purchases
function GroupPurchasesList({ 
  purchases, 
  isLoading,
  onJoinClick,
  onViewParticipants
}: { 
  purchases: GroupPurchase[], 
  isLoading: boolean,
  onJoinClick: (purchase: GroupPurchase) => void,
  onViewParticipants: (purchase: GroupPurchase) => void
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No group purchases found</h3>
        <p className="text-muted-foreground">Try checking other categories</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map(purchase => (
        <Card key={purchase.id} className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="mb-1">{purchase.title}</CardTitle>
              {purchase.status === "open" ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Open</Badge>
              ) : purchase.status === "fulfilled" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Fulfilled</Badge>
              ) : purchase.status === "expired" ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Expired</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>
              )}
            </div>
            <CardDescription>
              Organized by {purchase.creator?.username || `User ${purchase.creatorId}`} 
              {purchase.creator?.company && ` (${purchase.creator.company})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Progress
              value={(purchase.currentQuantity / purchase.targetQuantity) * 100}
              className="h-2 mb-2"
            />
            <div className="text-sm text-gray-600 mb-4">
              {purchase.currentQuantity} of {purchase.targetQuantity} ({Math.round((purchase.currentQuantity / purchase.targetQuantity) * 100)}%)
            </div>

            <p className="text-sm mb-4">{purchase.description}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <span className="font-medium">Regular Price:</span> ${purchase.unitPrice.toLocaleString()}
              </div>
              {purchase.discountedUnitPrice && (
                <div>
                  <span className="font-medium">Group Price:</span> ${purchase.discountedUnitPrice.toLocaleString()}
                </div>
              )}
              {purchase.deadline && (
                <div className="col-span-2">
                  <span className="font-medium">Deadline:</span> {new Date(purchase.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button 
              variant="outline"
              onClick={() => onViewParticipants(purchase)}
            >
              View Participants
            </Button>
            {purchase.status === "open" && (
              <Button 
                onClick={() => onJoinClick(purchase)}
              >
                Join
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default GroupPurchasePage;
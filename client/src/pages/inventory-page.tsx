import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { InventoryItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Switch
} from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Search, Image, LayoutGrid, Trash2 } from "lucide-react";

// Form schema for inventory item
const inventoryItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
  // Fetch user's inventory items
  const { data: inventoryItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: [`/api/users/${user?.id}/inventory`],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/users/${user?.id}/inventory`);
      if (!response.ok) throw new Error("Failed to fetch inventory items");
      return await response.json();
    }
  });

  // Fetch featured inventory items (all users)
  const { data: featuredItems, isLoading: isFeaturedLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory?featured=true"],
    queryFn: async () => {
      const response = await fetch(BACKEND_URL+"/api/inventory?featured=true");
      if (!response.ok) throw new Error("Failed to fetch featured items");
      return await response.json();
    }
  });

  // Create form
  const form = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      isNew: false,
      isFeatured: false,
    },
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: async (values: z.infer<typeof inventoryItemSchema>) => {
      const res = await apiRequest("POST", "/api/inventory", {
        ...values,
        userId: user?.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/inventory`] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Item Created",
        description: "Your inventory item has been created successfully.",
      });
      setOpenCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/inventory/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/inventory`] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Item Deleted",
        description: "Your inventory item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof inventoryItemSchema>) {
    createItemMutation.mutate(values);
  }

  // Filter items based on search query
  const filteredItems = inventoryItems?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle delete confirmation
  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  return (
    <>
      <Helmet>
        <title>Inventory - JewelConnect</title>
        <meta name="description" content="Manage and showcase your jewelry inventory. Add, edit, and organize your work to share with other professionals." />
      </Helmet>

      <Navbar />

      <main className="pt-20 pb-12 min-h-screen bg-neutral-50">
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-800 mb-2">My Inventory</h1>
              <p className="text-neutral-600">Showcase your work to the jewelry community</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-9"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>

              <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                      Showcase your jewelry pieces to potential clients and collaborators.
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
                              <Input placeholder="Diamond Engagement Ring" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your work, materials used, techniques, etc."
                                className="resize-none"
                                rows={4}
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
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/your-image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              Add a URL to an image of your work
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isNew"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Mark as New</FormLabel>
                                <FormDescription>
                                  Highlight this as a new piece
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
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Featured Item</FormLabel>
                                <FormDescription>
                                  Show on featured section
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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenCreateDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createItemMutation.isPending}
                        >
                          {createItemMutation.isPending ? "Creating..." : "Add Item"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="myItems" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/*
    TabsList:
    - grid w-full sm:w-auto grid-cols-2: Makes the TabsList span full width on small screens
      and take auto width (content-based) on 'sm' and up.
      The grid-cols-2 ensures the triggers are laid out evenly within the TabsList.
  */}
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="myItems">My Items</TabsTrigger>
                <TabsTrigger value="featured">Featured on JewelConnect</TabsTrigger>
              </TabsList>

              {/*
    View Mode Buttons:
    - flex space-x-2: Maintains horizontal spacing between the two buttons.
    - flex-shrink-0: Prevents these buttons from shrinking if space is very constrained.
  */}
              <div className="flex space-x-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "grid" ? "bg-neutral-100" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "list" ? "bg-neutral-100" : ""}
                  onClick={() => setViewMode("list")}
                >
                  {/* List SVG icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list">
                    <line x1="8" x2="21" y1="6" y2="6" />
                    <line x1="8" x2="21" y1="12" y2="12" />
                    <line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" />
                    <line x1="3" x2="3.01" y1="12" y2="12" />
                    <line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </Button>
              </div>
            </div>
            <TabsContent value="myItems">
              {isLoading ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square rounded-lg bg-neutral-200 mb-3"></div>
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex bg-white rounded-lg overflow-hidden shadow-sm">
                        <div className="w-40 h-40 bg-neutral-200"></div>
                        <div className="flex-1 p-4">
                          <Skeleton className="h-6 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : filteredItems.length > 0 ? (
                viewMode === "grid" ? (
                  // Grid view
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-square bg-neutral-100 relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}

                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-neutral-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20">
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-white border-white hover:bg-white/20"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Badges */}
                          {(item.isNew || item.isFeatured) && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                              {item.isNew && (
                                <Badge className="bg-secondary text-neutral-900">New</Badge>
                              )}
                              {item.isFeatured && (
                                <Badge className="bg-primary">Featured</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-serif text-lg font-semibold text-neutral-800 line-clamp-1">{item.title}</h3>
                          <p className="text-neutral-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                          <p className="text-neutral-500 text-xs mt-2">
                            Added on {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Add item card */}
                    <div
                      className="aspect-square bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setOpenCreateDialog(true)}
                    >
                      <Plus className="h-12 w-12 text-neutral-400" />
                      <p className="text-neutral-600 mt-2 font-medium">Add New Item</p>
                    </div>
                  </div>
                ) : (
                  // List view
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="w-40 h-40 bg-neutral-100 relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}

                          {/* Badges */}
                          {(item.isNew || item.isFeatured) && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                              {item.isNew && (
                                <Badge className="bg-secondary text-neutral-900">New</Badge>
                              )}
                              {item.isFeatured && (
                                <Badge className="bg-primary">Featured</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-serif text-xl font-semibold text-neutral-800">{item.title}</h3>
                            <p className="text-neutral-600 mt-1">{item.description}</p>
                            <p className="text-neutral-500 text-sm mt-2">
                              Added on {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex justify-end space-x-2 mt-4">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
                  <Image className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-800 mb-2">No inventory items yet</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    Showcase your work by adding items to your inventory. These will be visible to other professionals.
                  </p>
                  <Button onClick={() => setOpenCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Item
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured">
              {isFeaturedLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-lg bg-neutral-200 mb-3"></div>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : featuredItems && featuredItems.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {featuredItems.map((item) => (
                      <div key={item.id} className="group relative rounded-lg overflow-hidden cursor-pointer">
                        <div className="aspect-square bg-neutral-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-all group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <h3 className="font-serif text-white text-lg font-bold">{item.title}</h3>
                          {item.creator && (
                            <p className="text-white/80 text-sm">by {item.creator.fullName}</p>
                          )}
                        </div>

                        {item.isNew && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-secondary text-neutral-900 text-xs font-bold py-1 px-2 rounded-md">New</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center py-6">
                    <p className="text-neutral-600 mb-4">
                      Want your work to be featured on JewelConnect? Mark your items as "Featured" when creating or editing them.
                    </p>
                    <Button onClick={() => setOpenCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add New Item
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
                  <Image className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-800 mb-2">No featured items yet</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    There are currently no featured items from the community. Be the first to add a featured item!
                  </p>
                  <Button onClick={() => setOpenCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Featured Item
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gemstone, GemstoneCategory, Supplier } from "@shared/schema";
import { Link } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Gem } from "lucide-react";

export default function GemstoneMarketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Fetch gemstone categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<GemstoneCategory[]>({
    queryKey: ["/api/gemstone-categories"],
    queryFn: async () => {
      try {
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(BACKEND_URL+"/api/gemstone-categories");
        if (!response.ok) {
          console.warn("Failed to fetch categories from API, using fallback data");
          // Fallback category data
          return [
            {
              id: 1,
              name: "Diamonds",
              description: "The hardest natural material and the most popular gemstone."
            },
            {
              id: 2,
              name: "Rubies",
              description: "Red variety of corundum, known for their deep red color and durability."
            },
            {
              id: 3,
              name: "Sapphires",
              description: "Blue variety of corundum, highly valued for their color and hardness."
            },
            {
              id: 4,
              name: "Emeralds",
              description: "Green variety of beryl, highly prized for their rich green color."
            },
            {
              id: 5,
              name: "Alexandrite",
              description: "A rare color-changing gemstone that shifts between green and red depending on the light source."
            },
            {
              id: 6,
              name: "Paraiba",
              description: "A highly valuable variety of tourmaline with a vivid blue-green color caused by copper content."
            },
            {
              id: 7,
              name: "Spinel",
              description: "A gem with brilliant clarity and rich colors, historically mistaken for ruby or sapphire."
            },
            {
              id: 8,
              name: "Tanzanite",
              description: "A blue-violet variety of zoisite found only near Mount Kilimanjaro in Tanzania."
            },
            {
              id: 9,
              name: "Aquamarine",
              description: "A blue to blue-green variety of beryl valued for its clear color and durability."
            },
            {
              id: 10,
              name: "Garnet",
              description: "A diverse family of gemstones available in virtually every color with rich, saturated hues."
            },
            {
              id: 11,
              name: "Opal",
              description: "A gemstone known for its play of color, where flashes of rainbow colors appear when viewed from different angles."
            },
            {
              id: 12,
              name: "Peridot",
              description: "A vibrant lime-green gemstone formed deep in the earth and sometimes found in meteorites."
            },
            {
              id: 13,
              name: "Topaz",
              description: "A gemstone occurring in a wide range of colors, with blue and imperial topaz being the most valued."
            },
            {
              id: 14,
              name: "Tourmaline",
              description: "A versatile gemstone with the widest color range of any gem, often showing multiple colors in a single stone."
            },
            {
              id: 15,
              name: "Moonstone",
              description: "Known for its adularescence, creating a floating light effect that resembles moonlight."
            }
          ];
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Same fallback data as above in case of any error
        return [
          {
            id: 1,
            name: "Diamonds",
            description: "The hardest natural material and the most popular gemstone.",
            imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 2,
            name: "Rubies",
            description: "Red variety of corundum, known for their deep red color and durability.",
            imageUrl: "https://images.unsplash.com/photo-1602491676584-c2440094a171?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 3,
            name: "Sapphires",
            description: "Blue variety of corundum, highly valued for their color and hardness.",
            imageUrl: "https://images.unsplash.com/photo-1616404595522-4ad1788d2c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 4,
            name: "Emeralds",
            description: "Green variety of beryl, highly prized for their rich green color.",
            imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 5,
            name: "Alexandrite",
            description: "A rare color-changing gemstone that shifts between green and red depending on the light source."
          },
          {
            id: 6,
            name: "Paraiba",
            description: "A highly valuable variety of tourmaline with a vivid blue-green color caused by copper content."
          },
          {
            id: 7,
            name: "Spinel",
            description: "A gem with brilliant clarity and rich colors, historically mistaken for ruby or sapphire."
          },
          {
            id: 8,
            name: "Tanzanite",
            description: "A blue-violet variety of zoisite found only near Mount Kilimanjaro in Tanzania."
          },
          {
            id: 9,
            name: "Aquamarine",
            description: "A blue to blue-green variety of beryl valued for its clear color and durability."
          },
          {
            id: 10,
            name: "Garnet",
            description: "A diverse family of gemstones available in virtually every color with rich, saturated hues."
          },
          {
            id: 11,
            name: "Opal",
            description: "A gemstone known for its play of color, where flashes of rainbow colors appear when viewed from different angles."
          },
          {
            id: 12,
            name: "Peridot",
            description: "A vibrant lime-green gemstone formed deep in the earth and sometimes found in meteorites."
          },
          {
            id: 13,
            name: "Topaz",
            description: "A gemstone occurring in a wide range of colors, with blue and imperial topaz being the most valued."
          },
          {
            id: 14,
            name: "Tourmaline",
            description: "A versatile gemstone with the widest color range of any gem, often showing multiple colors in a single stone."
          },
          {
            id: 15,
            name: "Moonstone",
            description: "Known for its adularescence, creating a floating light effect that resembles moonlight."
          }
        ];
      }
    }
  });

  // Fetch suppliers
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: async () => {
      try {
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(BACKEND_URL+"/api/suppliers");
        if (!response.ok) {
          console.warn("Failed to fetch suppliers from API, using fallback data");
          // Fallback supplier data
          return [
            {
              id: 1,
              name: "GemsBiz",
              description: "Premium supplier of high-quality gemstones for the jewelry industry.",
              location: "New York, NY",
              website: "www.gemsbiz.com",
              createdAt: new Date()
            }
          ];
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        // Same fallback data as above in case of any error
        return [
          {
            id: 1,
            name: "GemsBiz",
            description: "Premium supplier of high-quality gemstones for the jewelry industry.",
            location: "New York, NY",
            website: "www.gemsbiz.com",
            createdAt: new Date()
          }
        ];
      }
    }
  });

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    // Always show featured gemstones
    params.append("featured", "true");
    
    if (searchQuery) params.append("q", searchQuery);
    if (selectedCategory) params.append("categoryId", selectedCategory);
    if (selectedSupplier) params.append("supplierId", selectedSupplier);
    
    return params.toString();
  };

  // Fetch gemstones
  const { 
    data: gemstones, 
    isLoading: isLoadingGemstones,
    refetch: refetchGemstones
  } = useQuery<Gemstone[]>({
    queryKey: ["/api/gemstones", searchQuery, selectedCategory, selectedSupplier],
    queryFn: async () => {
      try {
        const queryParams = buildQueryParams();
        const url = `/api/gemstones${queryParams ? `?${queryParams}` : ""}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn("Failed to fetch gemstones from API, using fallback data");
          // Fallback gemstone data
          return getFallbackGemstones(searchQuery, selectedCategory, selectedSupplier);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching gemstones:", error);
        // Same fallback data as above in case of any error
        return getFallbackGemstones(searchQuery, selectedCategory, selectedSupplier);
      }
    }
  });
  
  // Helper function to get fallback gemstone data with filtering
  function getFallbackGemstones(query?: string, categoryId?: string | null, supplierId?: string | null): Gemstone[] {
    const fallbackGemstones: Gemstone[] = [
      {
        id: 1,
        supplierId: 1,
        categoryId: 1,
        name: "Round Brilliant Diamond",
        description: "Premium round brilliant cut diamond with exceptional clarity and brilliance.",
        price: "5999.99",
        caratWeight: "1.50",
        color: "D",
        clarity: "VVS1",
        cut: "Excellent",
        shape: "Round",
        origin: "South Africa",
        certification: "GIA",
        imageUrl: "https://images.unsplash.com/photo-1600267185393-e158a98703de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        inventory: 5,
        isAvailable: true,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        id: 2,
        supplierId: 1,
        categoryId: 2,
        name: "Burmese Ruby",
        description: "Exquisite Burmese ruby with a vibrant red color known as pigeon's blood.",
        price: "8500.00",
        caratWeight: "2.05",
        color: "Vivid Red",
        clarity: "VS",
        cut: "Oval",
        shape: "Oval",
        origin: "Burma (Myanmar)",
        certification: "GRS",
        imageUrl: "https://images.unsplash.com/photo-1611425143678-08fc480cafde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        inventory: 2,
        isAvailable: true,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        id: 3,
        supplierId: 1,
        categoryId: 3,
        name: "Kashmir Sapphire",
        description: "Rare Kashmir sapphire with the highly coveted cornflower blue color.",
        price: "12500.00",
        caratWeight: "1.82",
        color: "Cornflower Blue",
        clarity: "VS",
        cut: "Oval",
        shape: "Oval",
        origin: "Kashmir",
        certification: "SSEF",
        imageUrl: "https://images.unsplash.com/photo-1616404535726-01f7a5e055c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        inventory: 1,
        isAvailable: true,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        id: 4,
        supplierId: 1,
        categoryId: 4,
        name: "Colombian Emerald",
        description: "Premium Colombian emerald with an intense green color and garden inclusions.",
        price: "9200.00",
        caratWeight: "1.95",
        color: "Vivid Green",
        clarity: "VS",
        cut: "Emerald",
        shape: "Emerald",
        origin: "Colombia",
        certification: "GIA",
        imageUrl: "https://images.unsplash.com/photo-1624954636362-c87756c7f30f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        inventory: 2,
        isAvailable: true,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        id: 5,
        supplierId: 1,
        categoryId: 5,
        name: "South Sea Pearl Strand",
        description: "Luxurious strand of perfectly matched South Sea pearls with excellent luster.",
        price: "7500.00",
        caratWeight: "100.00",
        color: "White",
        clarity: "AAA",
        cut: "N/A",
        shape: "Round",
        origin: "Australia",
        certification: "GIA",
        imageUrl: "https://images.unsplash.com/photo-1611759386164-424107027edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        inventory: 2,
        isAvailable: true,
        isFeatured: true,
        createdAt: new Date()
      }
    ];
    
    // Apply filters similar to server-side filtering
    let filteredGemstones = fallbackGemstones;
    
    // Filter by search query
    if (query) {
      const queryLower = query.toLowerCase();
      filteredGemstones = filteredGemstones.filter(g => 
        g.name.toLowerCase().includes(queryLower) || 
        g.description.toLowerCase().includes(queryLower) ||
        g.color.toLowerCase().includes(queryLower) ||
        g.origin?.toLowerCase().includes(queryLower)
      );
    }
    
    // Filter by category
    if (categoryId && categoryId !== 'all') {
      const catId = parseInt(categoryId);
      filteredGemstones = filteredGemstones.filter(g => g.categoryId === catId);
    }
    
    // Filter by supplier
    if (supplierId && supplierId !== 'all') {
      const supId = parseInt(supplierId);
      filteredGemstones = filteredGemstones.filter(g => g.supplierId === supId);
    }
    
    return filteredGemstones;
  }

  // Add to cart function
  const addToCart = async (gemstoneId: number) => {
    try {
      await apiRequest("POST", "/api/cart/items", {
        gemstoneId,
        quantity: 1
      });
      
      toast({
        title: "Added to cart",
        description: "Gemstone has been added to your cart",
      });
    } catch (error) {
      let errorMessage = "There was an error adding the gemstone to your cart.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Format price
  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice);
  };

  // Handle search
  const handleSearch = () => {
    refetchGemstones();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center focus:outline-none group">
          <div className="relative mb-0 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-green-100 opacity-70 blur-sm transform scale-95 group-hover:scale-100 transition-all duration-300"></div>
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 transform transition-all duration-300 group-hover:scale-110 relative z-10 shadow-sm group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-700">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-serif font-semibold text-lg text-neutral-800 group-hover:text-green-700 transition-colors duration-300">
              Back to Home
            </h3>
            <div className="text-xs mt-1 flex items-center justify-start gap-1 py-0.5 px-2 rounded-full bg-neutral-50 group-hover:bg-neutral-100 transition-colors duration-300 border border-neutral-100">
              <span className="text-neutral-500">Return to main menu</span>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Gemstone Marketplace</h1>
          <p className="text-neutral-600 mb-4 max-w-xl">
            Discover exceptional, handpicked gemstones from multiple trusted industry suppliers. Every transaction is secured with advanced protection for your complete peace of mind.
          </p>
        </div>
        <div className="flex items-center">
          <Button asChild variant="outline" size="sm" className="flex items-center">
            <a href="/cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </a>
          </Button>
        </div>
      </div>

      {/* Simplified Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search gemstones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <div className="w-full md:w-40">
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => setSelectedCategory(value || null)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-40">
          <Select
            value={selectedSupplier || ""}
            onValueChange={(value) => setSelectedSupplier(value || null)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers?.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} size="sm" className="h-9">
          Search
        </Button>
      </div>

      {/* Featured Gemstones Table */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-neutral-800">Featured Gemstones</h2>
      </div>
      {isLoadingGemstones ? (
        // Loading placeholders - simplified version
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 h-14 rounded-md"></div>
          ))}
        </div>
      ) : gemstones && gemstones.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-neutral-600">Name</th>
                <th className="text-center py-3 px-4 font-medium text-neutral-600 hidden sm:table-cell">Details</th>
                <th className="text-right py-3 px-4 font-medium text-neutral-600">Price</th>
                <th className="text-right py-3 px-4 font-medium text-neutral-600 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gemstones.map(gemstone => (
                <tr key={gemstone.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{gemstone.name}</div>
                      <div className="text-xs text-neutral-500">
                        {gemstone.caratWeight} carats · {gemstone.color}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-neutral-600 hidden sm:table-cell">
                    <span className="block text-xs">{gemstone.clarity || "N/A"} clarity</span>
                    <span className="block text-xs">{gemstone.origin || "Various origins"}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-primary">{formatPrice(gemstone.price)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      onClick={() => addToCart(gemstone.id)}
                      variant="outline"
                      size="sm"
                      disabled={!gemstone.isAvailable}
                      className="text-xs h-8 px-3"
                    >
                      {gemstone.isAvailable ? 'Add' : 'Out of Stock'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-neutral-50">
          <h3 className="text-lg font-medium text-neutral-600 mb-2">No gemstones found</h3>
          <p className="text-neutral-500 text-sm mb-4">Try adjusting your search or filter criteria</p>
          <Button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
              setSelectedSupplier(null);
              refetchGemstones();
            }}
            variant="outline"
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
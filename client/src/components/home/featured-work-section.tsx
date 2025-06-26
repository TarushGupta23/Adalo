import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { InventoryItem } from "@shared/schema";

export default function FeaturedWorkSection() {
  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory?featured=true"],
    queryFn: async () => {
      const response = await fetch("/api/inventory?featured=true");
      if (!response.ok) throw new Error("Failed to fetch featured work");
      return await response.json();
    }
  });
  
  // Featured work images for placeholders
  const workImages = [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Creator names for placeholders
  const creatorNames = [
    "Elena Craftsman",
    "Royal Gems",
    "Modern Metals",
    "Timeless Collection",
    "Green Jewels",
    "Fusion Designs",
    "Ocean Treasures",
    "Vintage Revival"
  ];

  return (
    <div className="bg-neutral-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-neutral-800">Featured Work</h2>
          <Link href="/inventory">
            <a className="text-primary font-semibold hover:underline">View All</a>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Loading placeholders
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg overflow-hidden">
                <div className="h-56 md:h-64 bg-neutral-200"></div>
              </div>
            ))
          ) : items?.length ? (
            items.map((item, index) => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg cursor-pointer">
                <img 
                  src={item.imageUrl || workImages[index % workImages.length]} 
                  alt={item.title} 
                  className="w-full h-56 md:h-64 object-cover transition-all group-hover:scale-105"
                />

                {item.isNew && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-neutral-900 text-xs font-bold py-1 px-2 rounded-md">New</span>
                  </div>
                )}
                {item.isFeatured && !item.isNew && index % 4 === 3 && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-neutral-900 text-xs font-bold py-1 px-2 rounded-md">Featured</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Use placeholders if no items from API
            workImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg cursor-pointer">
                <img 
                  src={image}
                  alt={`Featured jewelry item ${index + 1}`} 
                  className="w-full h-56 md:h-64 object-cover transition-all group-hover:scale-105"
                />

                {index === 0 || index === 6 ? (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-neutral-900 text-xs font-bold py-1 px-2 rounded-md">New</span>
                  </div>
                ) : index === 3 ? (
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary text-neutral-900 text-xs font-bold py-1 px-2 rounded-md">Featured</span>
                  </div>
                ) : null}
              </div>
            )).slice(0, 8)
          )}
        </div>
      </div>
    </div>
  );
}

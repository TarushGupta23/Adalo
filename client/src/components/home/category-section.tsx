import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Gem, Camera, Compass, Package, Store, Monitor, ShoppingBag, Building, 
  LayoutGrid, BookOpen, School, LineChart, Printer, Box, Hammer, CircleDot,
  GraduationCap, Book
} from "lucide-react";

const categories = [
  {
    icon: <Compass className="text-primary" size={34} />,
    name: "Designers",
    count: 0,
    description: "Connect with talented jewelry designers",
    color: "bg-secondary/20",
    path: "/directory?profession=designer"
  },
  {
    icon: <Gem className="text-primary" size={34} />,
    name: "Gemstone Dealers",
    count: 0,
    description: "Source quality gemstones from trusted dealers",
    color: "bg-primary/20",
    path: "/directory?profession=gemstone_dealer"
  },
  {
    icon: <Printer className="text-accent" size={34} />,
    name: "Casting & 3D Printing",
    count: 0,
    description: "Find casting and 3D printing services",
    color: "bg-accent/20",
    path: "/directory?profession=casting"
  },
  {
    icon: (
      <div className="text-primary">
        {/* <svg 
          width="38" 
          height="38" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2" strokeWidth="0" fill="none" />
          <path d="M8 5.5C9.5 3.5 14.5 3.5 16 5.5C17.5 7.5 15.5 11 12 11C8.5 11 6.5 7.5 8 5.5Z" />
          <path d="M8 18.5C9.5 20.5 14.5 20.5 16 18.5C17.5 16.5 15.5 13 12 13C8.5 13 6.5 16.5 8 18.5Z" />
        </svg> */}
        <img 
          src="/images/bench-jewelers-icon.jpg" 
          alt="bench jewelers" 
          width="40" 
          height="40" 
          className="object-contain"
        />
      </div>
    ),
    name: "Bench Jewelers & Setters",
    count: 0,
    description: "Connect with skilled bench jewelers and stone setters",
    color: "bg-secondary/20",
    path: "/directory?profession=bench_jeweler"
  },
  {
    icon: <div className="flex items-center justify-center">
        {/* <img 
          src="/packaging-icon.svg" 
          alt="Packaging" 
          width="34" 
          height="34" 
          className="object-contain"
        /> */}
        <img 
          src="/images/packaging-icon.jpg" 
          alt="Packaging" 
          width="44" 
          height="44" 
          className="object-contain"
        />
      </div>,
    name: "Packaging",
    count: 1,
    description: "Discover premium packaging solutions",
    color: "bg-accent2/20",
    path: "/directory?profession=packaging"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 100 100" fill="none" className="text-secondary">
        {/* Bust body outline */}
        <path
          d="M20 35 L20 60 Q20 65, 25 70 L35 80 L65 80 Q70 75, 75 70 Q80 65, 80 60 L80 35 Q80 30, 75 25 L60 15 Q55 10, 50 10 Q45 10, 40 15 L25 25 Q20 30, 20 35 Z"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        {/* Neck curve */}
        <path
          d="M40 15 Q45 12, 50 12 Q55 12, 60 15"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        {/* Necklace */}
        <path
          d="M35 30 Q50 40, 65 30"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        {/* Pendant */}
        <ellipse cx="50" cy="38" rx="4" ry="6" fill="currentColor"/>
        {/* Stand post */}
        <rect x="45" y="80" width="10" height="8" fill="currentColor"/>
        {/* Base */}
        <rect x="25" y="88" width="50" height="8" rx="4" fill="currentColor"/>
      </svg>
    ),
    name: "Displays",
    count: 1,
    description: "Explore elegant display solutions for your jewelry",
    color: "bg-secondary/20",
    path: "/directory?profession=displays"
  },
  {
    icon: <Camera className="text-accent" size={34} />,
    name: "Photographers",
    count: 0,
    description: "Work with professional jewelry photographers",
    color: "bg-accent/20",
    path: "/directory?profession=photographer"
  },
  {
    icon: <LayoutGrid className="text-primary" size={34} />,
    name: "Store Design & Furniture",
    count: 0,
    description: "Create stunning retail environments",
    color: "bg-primary/20",
    path: "/directory?profession=store_design"
  },
  {
    icon: <Monitor className="text-secondary" size={34} />,
    name: "Marketing & Media",
    count: 0,
    description: "Enhance your brand with marketing professionals",
    color: "bg-secondary/20",
    path: "/directory?profession=marketing"
  },
  {
    icon: <div className="relative flex items-center justify-center w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-30"></div>
      <BookOpen className="text-accent2" size={34} />
    </div>,
    name: "Education",
    count: 0,
    description: "Learn from industry experts and educators",
    color: "bg-accent2/20",
    path: "/directory?profession=education"
  },
  {
    icon: <LineChart className="text-primary" size={34} />,
    name: "Consulting",
    count: 0,
    description: "Get expert advice from industry consultants",
    color: "bg-primary/20",
    path: "/directory?profession=consulting"
  },
  {
    icon: <CircleDot className="text-accent2" size={34} />,
    name: "Other Professionals",
    count: 0,
    description: "Discover other jewelry industry professionals",
    color: "bg-accent2/20",
    path: "/directory?profession=other"
  },
];

export default function CategorySection() {
  return (
    <section className="bg-gradient-to-b from-white to-neutral-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-2">
            <div className="h-1 w-20 bg-gradient-to-r from-primary-light to-primary rounded-full mb-1 mx-auto"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-primary-light to-primary rounded-full mx-auto"></div>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-800 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Professional Categories
          </h2>
          <p className="font-sans text-neutral-600 text-lg max-w-3xl mx-auto">
            Browse professionals by specialty and connect with the perfect partners for your business needs.
          </p>
        </div>
        
        <TooltipProvider>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link to={category.path} className="block w-full h-full">
                    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-neutral-100/80 h-full group overflow-hidden hover:border-primary/20 hover:ring-1 hover:ring-primary/20 hover:bg-gradient-to-b hover:from-white hover:to-neutral-50/80">
                      <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full relative z-0">
                        <div className="relative mb-4 w-20 h-20">
                          <div className={`absolute inset-0 rounded-full ${category.color} opacity-70 blur-sm transform scale-95 group-hover:scale-100 transition-all duration-300 group-hover:opacity-90`}></div>
                          <div className={`w-20 h-20 flex items-center justify-center rounded-full ${category.color} transform transition-all duration-300 group-hover:scale-110 relative z-10 shadow-sm group-hover:shadow-lg border border-white/40`}>
                            {category.icon}
                          </div>
                        </div>
                        <h3 className="font-serif font-semibold text-lg text-neutral-800 group-hover:text-primary transition-colors duration-300">
                          {category.name}
                        </h3>
                        <div className="text-xs mt-1 flex items-center justify-center gap-1 py-0.5 px-3 rounded-full bg-white/80 group-hover:bg-white transition-all duration-300 border border-neutral-100 shadow-sm group-hover:shadow">
                          <span className="font-semibold text-primary">{category.count}</span> 
                          <span className="text-neutral-500">{category.count === 1 ? 'professional' : 'professionals'}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-neutral-50/10 to-primary/5 z-[-1] opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg"></div>
                      </CardContent>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{category.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}

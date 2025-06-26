import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar } from "lucide-react";

const testimonials = [
  {
    name: "Sophia Martinez",
    role: "Jewelry Designer, New York",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
    quote: "I connected with an amazing photographer who perfectly captured my new collection. The quality of professionals on this platform is outstanding.",
    memberSince: "March 2023",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Packaging Designer, Chicago",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
    quote: "Within two weeks of joining, I secured three new clients for my sustainable packaging solutions. The networking opportunities here are unmatched.",
    memberSince: "January 2023",
    rating: 4.5
  },
  {
    name: "Daniel Chen",
    role: "Gemstone Supplier, San Francisco",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
    quote: "The events feature helped me showcase my rare gemstone collection to serious buyers. I've expanded my client base across three continents!",
    memberSince: "October 2022",
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          Success Stories
        </h2>
        <p className="font-sans text-neutral-600 max-w-2xl mx-auto">
          Hear from professionals who have connected and collaborated through our platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-white border-none shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Avatar className="w-12 h-12 mr-4">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-800">{testimonial.name}</h3>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="mb-6 flex">
                {Array(Math.floor(testimonial.rating)).fill(0).map((_, i) => (
                  <Star key={i} className="text-secondary h-4 w-4" fill="currentColor" />
                ))}
                {testimonial.rating % 1 !== 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-secondary h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className="w-4 h-4 text-secondary" />
                    <path d="M 10,4 V 16" className="stroke-white stroke-[3]" />
                  </svg>
                )}
              </div>
              
              <p className="text-neutral-700 italic mb-4">{testimonial.quote}</p>
              
              <div className="flex items-center">
                <Calendar className="text-accent h-4 w-4 mr-2" />
                <span className="text-neutral-500 text-sm">Member since {testimonial.memberSince}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

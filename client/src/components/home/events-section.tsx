import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Event } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { MapPin, Clock, CalendarPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EventsSection() {
  const { toast } = useToast();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events?limit=3"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=3");
      if (!response.ok) throw new Error("Failed to fetch events");
      return await response.json();
    }
  });
  
  const handleRSVP = async (eventId: number, eventTitle: string) => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/rsvp`, {});
      
      toast({
        title: "RSVP Successful",
        description: `You have successfully RSVP'd to ${eventTitle}.`,
      });
    } catch (error) {
      toast({
        title: "RSVP Failed",
        description: "There was an error with your RSVP. You might have already RSVP'd to this event.",
        variant: "destructive",
      });
    }
  };
  
  // Event images for placeholders
  const eventImages = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://pixabay.com/get/g1eccfda343a06b98c3c8bec9788b357bcf326e7151aa57e43167743ece37ab8c9011d4c278f200a20198ab108251dc6e575840bdec047c628bdaefc972cf0f24_1280.jpg",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Formatting date function
  const formatEventDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' })
    };
  };
  
  // Placeholder attendees for demo
  const placeholderAttendees = [
    { name: "Jane Doe", src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48" },
    { name: "John Smith", src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48" },
    { name: "Alice Johnson", src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48" },
    { name: "Bob Brown", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48" },
    { name: "Emma Wilson", src: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48" }
  ];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h2 className="font-serif text-3xl font-bold text-neutral-800">Upcoming Events</h2>
        <Link href="/events">
          <a className="text-primary font-semibold hover:underline">All Events</a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading placeholders
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-neutral-200"></div>
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-neutral-200 mb-2"></div>
                <div className="h-4 w-1/2 bg-neutral-200 mb-2"></div>
                <div className="h-4 w-1/3 bg-neutral-200 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-neutral-200"></div>
                  <div className="h-4 w-full bg-neutral-200"></div>
                </div>
                <div className="h-8 w-32 bg-neutral-200 mb-5"></div>
                <div className="flex justify-between">
                  <div className="h-10 bg-neutral-200 rounded-lg w-32"></div>
                  <div className="h-10 w-10 bg-neutral-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : events?.length ? (
          events.map((event, index) => (
            <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img 
                  src={event.imageUrl || eventImages[index % eventImages.length]} 
                  alt={event.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-0 left-0 bg-primary text-white text-center p-3">
                  <span className="block text-2xl font-bold font-serif">
                    {formatEventDate(event.date).day}
                  </span>
                  <span className="text-xs uppercase tracking-wider">
                    {formatEventDate(event.date).month}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-bold text-neutral-800 mb-2">{event.title}</h3>
                  <div className="flex items-center text-neutral-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 text-accent mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-neutral-600 text-sm">
                    <Clock className="h-4 w-4 text-accent mr-2" />
                    <span>{event.time}</span>
                  </div>
                </div>
                
                <p className="text-neutral-700 mb-5 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center mb-5">
                  <AvatarGroup 
                    items={placeholderAttendees.slice(0, index + 3)}
                    className="mr-3"
                  />
                  <span className="text-neutral-600 text-sm">
                    {Math.floor(Math.random() * 40) + 20} attending
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    onClick={() => handleRSVP(event.id, event.title)}
                    className="bg-secondary hover:bg-secondary-light text-neutral-900 font-semibold"
                  >
                    RSVP
                  </Button>
                  <Button variant="outline" size="icon">
                    <CalendarPlus className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p>No upcoming events found at the moment.</p>
            <Button asChild className="mt-4">
              <Link href="/events">
                <a>View All Events</a>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

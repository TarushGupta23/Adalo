import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Event, isAdminUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  FacebookShareButton, 
  WhatsappShareButton, 
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon
} from "react-share";
import { FaInstagram } from "react-icons/fa";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Plus, 
  CalendarDays,
  ChevronDown
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

// Form schema for creating an event
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  date: z.date({
    required_error: "Event date is required",
  }),
  time: z.string().min(3, "Event time is required"),
  imageUrl: z.string().optional(),
});

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

  // Fetch all events
  const { data: events, isLoading: isEventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch(BACKEND_URL + "/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return await response.json();
    }
  });
  
  // Fetch user's RSVP events
  const { data: rsvps, isLoading: isRsvpsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/rsvps"],
    enabled: !!user,
    queryFn: async () => {
      try {
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(BACKEND_URL+"/api/user/rsvps");
        if (response.status === 404) return [];
        if (!response.ok) throw new Error("Failed to fetch user RSVPs");
        return await response.json();
      } catch (error) {
        console.error("Error fetching RSVPs:", error);
        return [];
      }
    }
  });
  
  // Create event form
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      time: "",
      imageUrl: "",
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof eventFormSchema>) => {
      const formattedDate = format(values.date, "yyyy-MM-dd");
      const res = await apiRequest("POST", "/api/events", {
        ...values,
        date: formattedDate,
        creatorId: user?.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
      setOpenCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // RSVP to event mutation with visibility preference
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, isPublic }: { eventId: number, isPublic: boolean }) => {
      await apiRequest("POST", `/api/events/${eventId}/rsvp`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/rsvps"] });
      toast({
        title: "RSVP Successful",
        description: "You have successfully RSVP'd to this event.",
      });
    },
    onError: (error) => {
      toast({
        title: "RSVP Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle RSVP visibility mutation
  const toggleRsvpVisibilityMutation = useMutation({
    mutationFn: async ({ eventId, isPublic }: { eventId: number, isPublic: boolean }) => {
      await apiRequest("PATCH", `/api/events/${eventId}/rsvp`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/rsvps"] });
      toast({
        title: "Visibility Updated",
        description: "Your RSVP visibility has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof eventFormSchema>) {
    createEventMutation.mutate(values);
  }
  
  // Filter events based on search query
  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Get upcoming events (events with dates in the future)
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get my events (events created by the current user)
  const myEvents = filteredEvents.filter(event => event.creatorId === user?.id);
  
  // Get RSVP'd events (events the user has RSVP'd to)
  const myRsvpEvents = rsvps?.length ? 
    filteredEvents.filter(event => 
      rsvps.some(rsvp => rsvp.eventId === event.id)
    ) : [];
  
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
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      fullDate: format(date, "MMMM d, yyyy")
    };
  };
  
  // Check if user has already RSVP'd to an event
  const hasRsvp = (eventId: number) => {
    return rsvps?.some(rsvp => rsvp.eventId === eventId);
  };
  
  // Generate Google Calendar link
  const generateCalendarLink = (event: Event) => {
    // Format date for calendar (YYYYMMDD)
    const eventDate = new Date(event.date);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };
    
    // Parse time if available or use default values
    let startTime = '000000';
    let endTime = '235900';
    
    if (event.time) {
      // Assuming time format like "10:00 AM - 6:00 PM"
      const timeParts = event.time.split('-').map(t => t.trim());
      if (timeParts.length === 2) {
        // This is a simplified version - a production app would need more robust time parsing
        const startHour = timeParts[0].includes('PM') && !timeParts[0].includes('12:') 
          ? parseInt(timeParts[0]) + 12 
          : parseInt(timeParts[0]);
        const endHour = timeParts[1].includes('PM') && !timeParts[1].includes('12:')
          ? parseInt(timeParts[1]) + 12
          : parseInt(timeParts[1]);
          
        startTime = `${String(startHour).padStart(2, '0')}0000`;
        endTime = `${String(endHour).padStart(2, '0')}0000`;
      }
    }
    
    const formattedStartDate = formatDate(eventDate) + 'T' + startTime;
    const formattedEndDate = formatDate(eventDate) + 'T' + endTime;
    
    const params = {
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: formattedStartDate + '/' + formattedEndDate
    };
    
    const url = new URL('https://calendar.google.com/calendar/render');
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key as keyof typeof params]);
    });
    
    return url.toString();
  };
  
  // Placeholder attendees
  const placeholderAttendees = Array(5).fill(0).map((_, i) => ({ name: `Attendee ${i + 1}` }));

  return (
    <>
      <Helmet>
        <title>Events - JewelConnect</title>
        <meta name="description" content="Browse and RSVP to jewelry industry events. Connect with professionals and stay updated on the latest industry gatherings." />
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
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-800 mb-2">Events</h1>
              <p className="text-neutral-600">Discover and join industry events</p>
              {!user && (
                <div className="mt-2 text-xs text-primary">
                  <Link to="/auth" className="underline">Sign in</Link> or <Link to="/auth" className="underline">register</Link> to RSVP to events and create your own events.
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
              
              {/* Show Create Event button for all authenticated users */}
              <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                {user ? (
                  <DialogTrigger asChild>
                    <Button className="whitespace-nowrap">
                      <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                  </DialogTrigger>
                ) : null}
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your jewelry industry event.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="International Jewelry Design Expo" {...field} />
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
                                placeholder="Provide details about your event..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Metropolitan Pavilion, New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <Input placeholder="10:00 AM - 6:00 PM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/event-image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              Add an image URL for your event banner
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                          disabled={createEventMutation.isPending}
                        >
                          {createEventMutation.isPending ? "Creating..." : "Create Event"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              {user && <TabsTrigger value="myRsvp">My RSVPs</TabsTrigger>}
              {user && <TabsTrigger value="myEvents">My Events</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {isEventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event, index) => (
                    <Card key={event.id} className="overflow-hidden transition-all hover:shadow-md">
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
                        <h3 className="font-serif text-xl font-bold text-neutral-800 mb-2">{event.title}</h3>
                        <div className="flex items-center text-neutral-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 text-accent mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-neutral-600 text-sm mb-4">
                          <Clock className="h-4 w-4 text-accent mr-2" />
                          <span>{event.time}</span>
                        </div>
                        <p className="text-neutral-700 mb-5 line-clamp-3">{event.description}</p>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-0">
                        {/* User action buttons */}
                        <div className="flex justify-between w-full items-center">
                          <AvatarGroup 
                            items={placeholderAttendees}
                            max={3}
                            className="mr-3"
                          />
                          
                          <div className="flex items-center gap-2">
                            {/* Add to Calendar Button - available for all users */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => window.open(generateCalendarLink(event), '_blank')}
                                >
                                  <CalendarIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Add to Google Calendar</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* RSVP buttons - only for logged in users */}
                            {user ? (
                              <>
                                {hasRsvp(event.id) ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline">
                                        <span className="mr-2">✓ Going</span>
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56">
                                      <div className="grid gap-3">
                                        <div className="space-y-2">
                                          <h4 className="font-medium">RSVP Visibility</h4>
                                          <div className="flex items-center space-x-2">
                                            <Switch 
                                              id={`rsvp-visibility-${event.id}`}
                                              checked={rsvps?.find(rsvp => rsvp.eventId === event.id)?.isPublic ?? true}
                                              onCheckedChange={(isPublic) => {
                                                toggleRsvpVisibilityMutation.mutate({
                                                  eventId: event.id,
                                                  isPublic
                                                });
                                              }}
                                            />
                                            <Label htmlFor={`rsvp-visibility-${event.id}`}>Show publicly</Label>
                                          </div>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <Button 
                                    onClick={() => {
                                      rsvpMutation.mutate({
                                        eventId: event.id,
                                        isPublic: true
                                      });
                                    }}
                                    disabled={rsvpMutation.isPending}
                                    className="bg-secondary hover:bg-secondary/90 text-neutral-900"
                                  >
                                    RSVP
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button 
                                variant="outline"
                                asChild
                              >
                                <Link to="/auth">Sign in to RSVP</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Social sharing section - available for all users */}
                        <div className="flex items-center gap-2 mt-2 w-full">
                          <span className="text-sm text-neutral-500 mr-2">Share:</span>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FacebookShareButton 
                                  url={`${window.location.origin}/events/${event.id}`}
                                  hashtag="#jewelrydirectory"
                                >
                                  <FacebookIcon size={28} round />
                                </FacebookShareButton>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Share on Facebook</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <WhatsappShareButton
                                  url={`${window.location.origin}/events/${event.id}`}
                                  title={`Check out this jewelry industry event: ${event.title}`}
                                >
                                  <WhatsappIcon size={28} round />
                                </WhatsappShareButton>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Share on WhatsApp</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <TwitterShareButton
                                  url={`${window.location.origin}/events/${event.id}`}
                                  title={`Check out this jewelry industry event: ${event.title}`}
                                >
                                  <TwitterIcon size={28} round />
                                </TwitterShareButton>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Share on Twitter</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-full bg-[#E4405F] border-none p-0"
                                  onClick={() => {
                                    // Open Instagram sharing in new window - Instagram doesn't have direct URL sharing
                                    window.open('https://www.instagram.com/', '_blank');
                                  }}
                                >
                                  <FaInstagram className="text-white h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Share on Instagram</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CalendarDays className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-800 mb-2">No upcoming events</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    There are no upcoming events scheduled at the moment. Check back later
                    {user && isAdminUser(user.username) ? " or create your own event!" : "."}
                  </p>
                  {user && isAdminUser(user.username) && (
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpenCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="myRsvp" className="space-y-6">
              {isRsvpsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => (
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myRsvpEvents && myRsvpEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRsvpEvents.map((event, index) => (
                    <Card key={event.id} className="overflow-hidden transition-all hover:shadow-md">
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
                        <h3 className="font-serif text-xl font-bold text-neutral-800 mb-2">{event.title}</h3>
                        <div className="flex items-center text-neutral-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 text-accent mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-neutral-600 text-sm mb-4">
                          <Clock className="h-4 w-4 text-accent mr-2" />
                          <span>{event.time}</span>
                        </div>
                        <p className="text-neutral-700 mb-5 line-clamp-3">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-primary font-medium">
                            You're attending
                          </span>
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CalendarDays className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-800 mb-2">No RSVPs yet</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    You haven't RSVP'd to any events yet. Browse upcoming events and RSVP to the ones you'd like to attend.
                  </p>
                  <Button asChild className="bg-primary hover:bg-primary/90" onClick={() => setActiveTab("upcoming")}>
                    <a>Browse Events</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="myEvents" className="space-y-6">
              {isEventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => (
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myEvents && myEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map((event, index) => (
                    <Card key={event.id} className="overflow-hidden transition-all hover:shadow-md">
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
                      <CardHeader className="pt-6 pb-0">
                        <CardTitle className="font-serif text-xl">{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <CalendarDays className="h-4 w-4 text-accent mr-1" />
                            <span>{formatEventDate(event.date).fullDate}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center text-neutral-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 text-accent mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-neutral-600 text-sm mb-4">
                          <Clock className="h-4 w-4 text-accent mr-2" />
                          <span>{event.time}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0 justify-between">
                        <Button variant="outline" size="sm">
                          View Attendees
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Event
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CalendarDays className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-800 mb-2">No events created</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    You haven't created any events yet. Create your first event to connect with other professionals!
                  </p>
                  {user && (
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpenCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                  )}
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

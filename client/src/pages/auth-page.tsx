import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  loginIdentifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  userType: z.enum([
    "designer",
    "gemstone_dealer",
    "casting",
    "bench_jeweler",
    "packaging", 
    "displays",
    "photographer", 
    "store_design",
    "marketing",
    "education",
    "consulting",
    "other"
  ], { required_error: "Please select a user type" }),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  phone: z.string().optional(),
  logoImage: z.string().optional(),
  coverImage: z.string().optional(),
  // Contact information
  headquarters: z.string().optional(),
  showroom1: z.string().optional(),
  showroom2: z.string().optional(),
  // Social media
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  pinterest: z.string().optional(),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUsernameRecovery, setShowUsernameRecovery] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [usernameSent, setUsernameSent] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [productPhotos, setProductPhotos] = useState<string[]>([]);
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginIdentifier: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      userType: undefined,
      company: "",
      location: "",
      bio: "",
      website: "",
      phone: "",
      logoImage: "",
      coverImage: "",
      headquarters: "",
      showroom1: "",
      showroom2: "",
      instagram: "",
      facebook: "",
      pinterest: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    // Include product photos with the registration data
    const registrationData = {
      ...values,
      productPhotos: productPhotos
    };
    registerMutation.mutate(registrationData);
  }
  
  // Handle password reset request
  const handlePasswordReset = () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would call an API endpoint
    // For now, we'll just show a success message
    setResetSent(true);
    toast({
      title: "Reset email sent",
      description: "If an account exists with this email, you'll receive instructions to reset your password",
    });
    
    // In a production app, we would make an API request like:
    // apiRequest("POST", "/api/reset-password", { email: resetEmail })
    //   .then(() => {
    //     setResetSent(true);
    //     toast({
    //       title: "Reset email sent",
    //       description: "If an account exists with this email, you'll receive instructions to reset your password",
    //     });
    //   })
    //   .catch(error => {
    //     toast({
    //       title: "Error",
    //       description: error.message || "Failed to send reset email. Please try again.",
    //       variant: "destructive",
    //     });
    //   });
  };

  return (
    <>
      <Helmet>
        <title>JewelConnect - Login or Register</title>
        <meta name="description" content="Join the professional network for the jewelry industry. Connect with designers, photographers, retailers and more." />
      </Helmet>
      
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Auth Forms */}
        <div className="flex items-center justify-center px-4 py-12 bg-white">
          <div className="w-full max-w-md">
            {/* Back button */}
            <div className="mb-8 flex justify-center">
              <Link to="/" className="inline-flex items-center text-sm text-neutral-600 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Link>
            </div>
            
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold font-serif">
                <span className="text-secondary">Jewel</span>Connect
              </h1>
              <p className="text-neutral-600 mt-2">The professional network for the jewelry industry</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Guest browsing option - PROMINENT */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6">
                <div className="flex flex-col items-center">
                  <p className="font-medium mb-3">Browse without creating an account</p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate("/directory")}
                  >
                    Continue as Guest
                  </Button>
                  <p className="text-xs text-neutral-500 mt-2">Limited to browsing the directory only</p>
                </div>
              </div>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="loginIdentifier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your username or email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Password</FormLabel>
                                <Button 
                                  type="button" 
                                  variant="link" 
                                  className="h-auto p-0 text-xs text-primary"
                                  onClick={() => setShowResetPassword(true)}
                                >
                                  Forgot password?
                                </Button>
                              </div>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                        
                        <div className="mt-6 text-center">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">New to JewelConnect?</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline" 
                            className="mt-4 w-full"
                            onClick={() => setActiveTab("register")}
                          >
                            Create a free account
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Join the professional network for jewelry industry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username*</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password*</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email*</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name*</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="userType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profession*</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your profession" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="designer">Designer</SelectItem>
                                    <SelectItem value="gemstone_dealer">Gemstone Dealer</SelectItem>
                                    <SelectItem value="casting">Casting House</SelectItem>
                                    <SelectItem value="bench_jeweler">Bench Jeweler & Setter</SelectItem>
                                    <SelectItem value="packaging">Packaging</SelectItem>
                                    <SelectItem value="displays">Displays</SelectItem>
                                    <SelectItem value="photographer">Photographer</SelectItem>
                                    <SelectItem value="store_design">Store Design & Furniture</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="consulting">Consulting</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={registerForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. New York, NY" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Tell us about your expertise and experience in the jewelry industry"
                                  className="resize-none"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                          <h3 className="font-semibold">Contact Information & Locations</h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="https://www.example.com" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="+1 (555) 555-5555" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name="headquarters"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g. Milan, Italy" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="showroom1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Address (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. New York, NY" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="showroom2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Address (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. Los Angeles, CA" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <h4 className="font-medium text-sm mt-4">Social Media</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="instagram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="@username" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="facebook"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Facebook</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="username or page name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="pinterest"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pinterest</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="username" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                          <h3 className="font-semibold">Profile Images</h3>
                          <p className="text-sm text-neutral-500">You can add up to 10 product photos after registration from your profile page</p>

                          <FormField
                            control={registerForm.control}
                            name="logoImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Logo</FormLabel>
                                <div className="space-y-3">
                                  <FormControl>
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            const result = e.target?.result as string;
                                            field.onChange(result);
                                            setLogoPreview(result);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="cursor-pointer"
                                    />
                                  </FormControl>
                                  {logoPreview && (
                                    <div className="mt-2">
                                      <img 
                                        src={logoPreview} 
                                        alt="Logo preview" 
                                        className="w-24 h-24 object-cover rounded-lg border"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                          setLogoPreview("");
                                          field.onChange("");
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="coverImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cover/Background Image</FormLabel>
                                <div className="space-y-3">
                                  <FormControl>
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            const result = e.target?.result as string;
                                            field.onChange(result);
                                            setCoverPreview(result);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="cursor-pointer"
                                    />
                                  </FormControl>
                                  {coverPreview && (
                                    <div className="mt-2">
                                      <img 
                                        src={coverPreview} 
                                        alt="Cover preview" 
                                        className="w-full h-32 object-cover rounded-lg border"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                          setCoverPreview("");
                                          field.onChange("");
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Product Photos (Optional)</h4>
                              <span className="text-sm text-neutral-500">{productPhotos.length}/10</span>
                            </div>
                            <p className="text-sm text-neutral-500">Upload up to 10 photos of your products or work</p>
                            
                            {productPhotos.length < 10 && (
                              <Input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  const remainingSlots = 10 - productPhotos.length;
                                  const filesToProcess = files.slice(0, remainingSlots);
                                  
                                  filesToProcess.forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const result = e.target?.result as string;
                                      setProductPhotos(prev => [...prev, result]);
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                  
                                  // Clear the input
                                  e.target.value = '';
                                }}
                                className="cursor-pointer"
                              />
                            )}
                            
                            {productPhotos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {productPhotos.map((photo, index) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={photo} 
                                      alt={`Product ${index + 1}`} 
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-1 right-1 h-6 w-6 p-0"
                                      onClick={() => {
                                        setProductPhotos(prev => prev.filter((_, i) => i !== index));
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating Account..." : "Create a free account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("login")}
                    >
                      Already have an account? Login
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex bg-gradient-to-br from-primary to-primary-dark text-white flex-col justify-center px-8 py-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">
              Connect With Jewelry Professionals
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of jewelry industry professionals who are growing their businesses through meaningful connections.
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Network with Industry Professionals</h3>
                  <p className="opacity-80">Connect with jewelers, photographers, designers, and more.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Discover Industry Events</h3>
                  <p className="opacity-80">Find and attend jewelry events, trade shows, and workshops.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Showcase Your Craftsmanship</h3>
                  <p className="opacity-80">Display your jewelry creations and professional services.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {resetSent ? (
            <div className="py-6 text-center">
              <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-500 mb-4">
                If an account exists with the email you entered, you'll receive instructions to reset your password.
              </p>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                  setResetSent(false);
                  setResetEmail("");
                }}>
                  Close
                </Button>
              </DialogClose>
            </div>
          ) : (
            <>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetPassword(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordReset}>
                  Send Reset Link
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

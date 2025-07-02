import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isAdminUser } from "@shared/schema";
import { Link } from "wouter";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Users,
  Code,
  Globe,
  Github,
  Linkedin,
  Clock,
  DollarSign,
  Calendar,
  Trash2,
  Edit,
  ExternalLink
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const developerFormSchema = z.object({
  userId: z.number(),
  githubUsername: z.string().optional(),
  role: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'ui_ux', 'qa_tester', 'project_manager', 'tech_lead']),
  accessLevel: z.enum(['read_only', 'contributor', 'maintainer', 'admin']).default('contributor'),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.string().optional(),
  availability: z.string().optional(),
  timezone: z.string().optional(),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  yearsExperience: z.number().optional(),
});

const projectFormSchema = z.object({
  developerId: z.number(),
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedHours: z.number().optional(),
  dueDate: z.string().optional(),
});

export default function DeveloperManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addDeveloperOpen, setAddDeveloperOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<any>(null);

  // Check if user is admin
  if (!user || !isAdminUser(user.username)) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-4">You need administrator privileges to access this page.</p>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Add BACKEND_URL constant
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env

  // Fetch developers
  const { data: developers, isLoading: developersLoading } = useQuery({
    queryKey: ["/api/developers"],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/developers`); // Changed: Prepended BACKEND_URL to the request URL
      if (!response.ok) throw new Error("Failed to fetch developers");
      return await response.json();
    }
  });
  // Fetch all users for the dropdown
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/users`); // Changed: Prepended BACKEND_URL to the request URL
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    }
  });
  // Fetch project assignments
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/project-assignments"],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/project-assignments`); // Changed: Prepended BACKEND_URL to the request URL
      if (!response.ok) throw new Error("Failed to fetch project assignments");
      return await response.json();
    }
  });

  // Developer form
  const developerForm = useForm<z.infer<typeof developerFormSchema>>({
    resolver: zodResolver(developerFormSchema),
    defaultValues: {
      role: 'fullstack',
      accessLevel: 'contributor',
    },
  });

  // Project form
  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      status: 'active',
      priority: 'medium',
    },
  });

  // Add developer mutation
  const addDeveloperMutation = useMutation({
    mutationFn: async (values: z.infer<typeof developerFormSchema>) => {
      const skillsArray = typeof values.skills === 'string'
        ? values.skills.split(',').map(s => s.trim()).filter(Boolean)
        : values.skills || [];

      const res = await apiRequest("POST", "/api/developers", {
        ...values,
        skills: skillsArray,
        hourlyRate: values.hourlyRate ? parseFloat(values.hourlyRate) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({
        title: "Developer Added",
        description: "The developer has been successfully added to the team.",
      });
      setAddDeveloperOpen(false);
      developerForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectFormSchema>) => {
      const res = await apiRequest("POST", "/api/project-assignments", {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-assignments"] });
      toast({
        title: "Project Assigned",
        description: "The project has been successfully assigned.",
      });
      setAddProjectOpen(false);
      projectForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete developer mutation
  const deleteDeveloperMutation = useMutation({
    mutationFn: async (developerId: number) => {
      await apiRequest("DELETE", `/api/developers/${developerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({
        title: "Developer Removed",
        description: "The developer has been removed from the team.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      frontend: "bg-blue-100 text-blue-800",
      backend: "bg-green-100 text-green-800",
      fullstack: "bg-purple-100 text-purple-800",
      mobile: "bg-orange-100 text-orange-800",
      devops: "bg-red-100 text-red-800",
      ui_ux: "bg-pink-100 text-pink-800",
      qa_tester: "bg-yellow-100 text-yellow-800",
      project_manager: "bg-indigo-100 text-indigo-800",
      tech_lead: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAccessBadgeColor = (level: string) => {
    const colors = {
      read_only: "bg-gray-100 text-gray-800",
      contributor: "bg-green-100 text-green-800",
      maintainer: "bg-blue-100 text-blue-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8">
        <div className="mb-6">
          <Link to="/admin-dashboard" className="text-primary hover:underline">
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Management</h1>
            <p className="text-muted-foreground">
              Manage your development team and project assignments
            </p>
          </div>
          <div className="flex gap-4">
            <Dialog open={addDeveloperOpen} onOpenChange={setAddDeveloperOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Developer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Developer</DialogTitle>
                  <DialogDescription>
                    Add a developer to your team with their role and access level.
                  </DialogDescription>
                </DialogHeader>

                <Form {...developerForm}>
                  <form onSubmit={developerForm.handleSubmit((data) => addDeveloperMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={developerForm.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select User</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users?.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName} (@{user.username})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={developerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="frontend">Frontend</SelectItem>
                                <SelectItem value="backend">Backend</SelectItem>
                                <SelectItem value="fullstack">Full Stack</SelectItem>
                                <SelectItem value="mobile">Mobile</SelectItem>
                                <SelectItem value="devops">DevOps</SelectItem>
                                <SelectItem value="ui_ux">UI/UX</SelectItem>
                                <SelectItem value="qa_tester">QA Tester</SelectItem>
                                <SelectItem value="project_manager">Project Manager</SelectItem>
                                <SelectItem value="tech_lead">Tech Lead</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={developerForm.control}
                        name="accessLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="read_only">Read Only</SelectItem>
                                <SelectItem value="contributor">Contributor</SelectItem>
                                <SelectItem value="maintainer">Maintainer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={developerForm.control}
                        name="githubUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub Username</FormLabel>
                            <FormControl>
                              <Input placeholder="octocat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={developerForm.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="75" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={developerForm.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="React, Node.js, PostgreSQL, AWS"
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={developerForm.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://portfolio.dev" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={developerForm.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setAddDeveloperOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addDeveloperMutation.isPending}>
                        {addDeveloperMutation.isPending ? "Adding..." : "Add Developer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Project</DialogTitle>
                  <DialogDescription>
                    Assign a project to one of your developers.
                  </DialogDescription>
                </DialogHeader>

                <Form {...projectForm}>
                  <form onSubmit={projectForm.handleSubmit((data) => addProjectMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={projectForm.control}
                      name="developerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Developer</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a developer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {developers?.map((dev: any) => (
                                <SelectItem key={dev.id} value={dev.id.toString()}>
                                  {dev.user?.fullName} - {dev.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Mobile App Redesign" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Project description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={projectForm.control}
                        name="estimatedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Hours</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="40"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={projectForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setAddProjectOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addProjectMutation.isPending}>
                        {addProjectMutation.isPending ? "Assigning..." : "Assign Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="developers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="developers">
              <Users className="h-4 w-4 mr-2" />
              Developers ({developers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Code className="h-4 w-4 mr-2" />
              Projects ({projects?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="developers">
            <Card>
              <CardHeader>
                <CardTitle>Development Team</CardTitle>
                <CardDescription>
                  Manage your developers and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {developersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : developers && developers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Developer</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {developers.map((dev: any) => (
                        <TableRow key={dev.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{dev.user?.fullName}</div>
                              <div className="text-sm text-muted-foreground">@{dev.user?.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(dev.role)}>
                              {dev.role.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAccessBadgeColor(dev.accessLevel)}>
                              {dev.accessLevel.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {dev.skills && dev.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {dev.skills.slice(0, 3).map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {dev.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{dev.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No skills listed</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {dev.hourlyRate ? (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {dev.hourlyRate}/hr
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {dev.githubUsername && (
                                <a
                                  href={`https://github.com/${dev.githubUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Github className="h-4 w-4" />
                                </a>
                              )}
                              {dev.portfolioUrl && (
                                <a
                                  href={dev.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Globe className="h-4 w-4" />
                                </a>
                              )}
                              {dev.linkedinUrl && (
                                <a
                                  href={dev.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDeveloperMutation.mutate(dev.id)}
                              disabled={deleteDeveloperMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No developers added</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding developers to your team.
                    </p>
                    <Button onClick={() => setAddDeveloperOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Developer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Assignments</CardTitle>
                <CardDescription>
                  Track project assignments and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : projects && projects.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.projectName}</div>
                              {project.description && (
                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.developer?.user?.fullName}</div>
                              <Badge className={getRoleBadgeColor(project.developer?.role)} variant="secondary">
                                {project.developer?.role?.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                    project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                              }
                            >
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                project.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    project.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                              }
                            >
                              {project.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.estimatedHours ? (
                              <div className="text-sm">
                                <div>{project.actualHours || 0}/{project.estimatedHours}h</div>
                                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(100, ((project.actualHours || 0) / project.estimatedHours) * 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {project.dueDate ? (
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(project.dueDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No due date</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects assigned</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by assigning projects to your developers.
                    </p>
                    <Button onClick={() => setAddProjectOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}
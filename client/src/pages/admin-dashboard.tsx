import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
  Star,
  Calendar,
  ShoppingBag,
  Users,
  FileText,
  Mail,
  Gem,
  TrendingUp,
  Image,
  ArrowLeft,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Component to display saved articles
function SavedArticlesSection() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/admin/articles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/articles/${articleId}`);
      if (!res.ok) throw new Error('Failed to delete article');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
    }
  });

  if (articlesLoading) {
    return <div className="text-center py-4">Loading saved articles...</div>;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No articles saved yet</p>
        <p className="text-sm">Import your first article using the form above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article: any) => (
        <div key={article.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 mb-1">
                {article.title}
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                {article.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>👤 {article.author || 'Unknown Author'}</span>
                <span>📅 {new Date(article.importedAt).toLocaleDateString()}</span>
              </div>
              {article.sourceUrl && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Original Source: </span>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium break-all"
                  >
                    {article.sourceUrl}
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Create a modal-like view for better article reading
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                  modal.innerHTML = `
                    <div class="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-6 relative">
                      <button onclick="this.parentElement.parentElement.remove()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">×</button>
                      <h2 class="text-2xl font-bold mb-4">${article.title}</h2>
                      <div class="mb-4 text-sm text-gray-600">
                        <p><strong>Author:</strong> ${article.author || 'Unknown'}</p>
                        <p><strong>Date:</strong> ${new Date(article.importedAt).toLocaleDateString()}</p>
                        ${article.sourceUrl ? `<p><strong>Source:</strong> <a href="${article.sourceUrl}" target="_blank" class="text-blue-600 hover:underline">${article.sourceUrl}</a></p>` : ''}
                      </div>
                      <div class="prose max-w-none">
                        ${article.description ? `<p class="text-lg text-gray-700 mb-4"><em>${article.description}</em></p>` : ''}
                        <div class="text-gray-800 leading-relaxed">
                          ${article.content?.substring(0, 2000) || 'No content available'}...
                        </div>
                      </div>
                      <div class="mt-6 pt-4 border-t">
                        <p class="text-sm text-gray-500">Click outside this window or the × button to close</p>
                      </div>
                    </div>
                  `;
                  modal.onclick = (e) => {
                    if (e.target === modal) modal.remove();
                  };
                  document.body.appendChild(modal);
                }}
              >
                📖 Read Article
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    deleteArticleMutation.mutate(article.id);
                  }
                }}
                disabled={deleteArticleMutation.isPending}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Total: {articles.length} saved article{articles.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Get all users (admin only)
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: !!user
  });

  // Get all events
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to delete user');
      // Handle both JSON and text responses
      try {
        return await res.json();
      } catch {
        return { success: true };
      }
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/events/${eventId}`);
      if (!res.ok) throw new Error('Failed to delete event');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "Event has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle user delete
  const handleDeleteUser = (userId: number, username: string) => {
    console.log('Delete button clicked for user:', userId, username); // Debug log

    const confirmMessage = `⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to permanently delete user "${username}" (ID: ${userId})?\n\nThis will remove:\n• User account and profile\n• All user data and posts\n• Connection history\n• All associated content\n\nType "DELETE" to confirm:`;

    const userInput = window.prompt(confirmMessage);
    console.log('User input:', userInput); // Debug log

    if (userInput === "DELETE") {
      console.log('Proceeding with deletion...'); // Debug log
      deleteUserMutation.mutate(userId);
    } else if (userInput !== null) {
      toast({
        title: "Deletion cancelled",
        description: "User account was not deleted - confirmation text didn't match",
        variant: "destructive"
      });
    }
  };

  // Handle event delete
  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => window.location.href = '/developer-management'}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Developer Team</h3>
                <p className="text-sm text-muted-foreground">Manage developers and projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">Platform statistics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Communications</h3>
                <p className="text-sm text-muted-foreground">Email and notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Content</h3>
                <p className="text-sm text-muted-foreground">Articles and media</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 p-1 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="users" className="flex items-center gap-1 min-w-max">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-1 min-w-max">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1 min-w-max">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-1 min-w-max">
            <FileText className="h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="newsletters" className="flex items-center gap-1 min-w-max">
            <Mail className="h-4 w-4" />
            Newsletters
          </TabsTrigger>
          <TabsTrigger value="gemstones" className="flex items-center gap-1 min-w-max">
            <Gem className="h-4 w-4" />
            Gemstones
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-1 min-w-max">
            <ShoppingBag className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1 min-w-max">
            <Image className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bulk Account Management */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-sm md:max-w-lg lg:max-w-2xl"> {/* Adjusted max-width values for more flexibility */}
                  <h4 className="font-medium text-red-700 mb-2 text-base sm:text-lg"> {/* Responsive font sizes */}
                    ⚠️ Bulk Account Management
                  </h4>
                  <p className="text-sm text-red-600 mb-3"> {/* Font size adjusted, `text-xs` was too small for readability */}
                    Permanently delete multiple user accounts at once
                  </p>
                  {/*
    Button Container:
    - grid grid-cols-1: Always 1 column on extra-small screens.
    - gap-3: Spacing between buttons (both row and column).
    - sm:grid-cols-2: 2 columns from 'sm' breakpoint.
    - md:grid-cols-3: 3 columns from 'md' breakpoint.
    This explicit grid approach with responsive columns is more robust for buttons with varying content length.
  */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full whitespace-normal text-sm px-3 py-2 h-auto" // Key: whitespace-normal, h-auto, increased padding
                    >
                      🗑️ Delete Inactive Users(30+ days)
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full whitespace-normal text-sm px-3 py-2 h-auto" // Key: whitespace-normal, h-auto, increased padding
                    >
                      🗑️ Delete All Test Accounts
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full whitespace-normal text-sm px-3 py-2 h-auto" // Key: whitespace-normal, h-auto, increased padding
                    >
                      🗑️ Delete Users Without Profiles
                    </Button>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium text-gray-700">Total Users</h4>
                    <p className="text-2xl font-bold text-blue-600">{users?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium text-gray-700">Active This Month</h4>
                    <p className="text-2xl font-bold text-green-600">{users?.filter((u: any) => u.userType !== 'inactive')?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium text-gray-700">Admin Accounts</h4>
                    <p className="text-2xl font-bold text-purple-600">{users?.filter((u: any) => u.username === 'admin')?.length || 0}</p>
                  </div>
                </div>

                {/* Users Table */}
                {usersLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : usersError ? (
                  <div className="text-center py-4 text-red-500">Error loading users</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user: User) => (
                          <TableRow key={user.id} className={user.username === 'admin' ? 'bg-purple-50' : ''}>
                            <TableCell className="font-mono">{user.id}</TableCell>
                            <TableCell className="font-medium">
                              {user.username}
                              {user.username === 'admin' && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ADMIN</span>}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.fullName || <span className="text-gray-400">No name set</span>}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs ${user.userType === 'business' ? 'bg-blue-100 text-blue-700' :
                                user.userType === 'individual' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                {user.userType || 'Standard'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-green-600">● Active</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setEditMode(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                {user.username !== 'admin' && (
                                  <>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id, user.username)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="ml-1"
                                      onClick={() => {
                                        if (window.confirm(`Delete ${user.username}?`)) {
                                          deleteUserMutation.mutate(user.id);
                                        }
                                      }}
                                    >
                                      🗑️ Quick Delete
                                    </Button>
                                  </>
                                )}
                                {user.username === 'admin' && (
                                  <span className="text-xs text-gray-500 px-2 py-1">Protected</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>Create, edit, and delete events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Events Management
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Create New Event
                  </Button>
                </div>

                {/* Create New Event Form */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h4 className="font-medium mb-4 text-blue-700">📅 Create New Event</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input id="event-title" placeholder="Enter event name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="event-location">Location</Label>
                      <Input id="event-location" placeholder="Event location" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input id="event-date" type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input id="event-time" type="time" className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea id="event-description" placeholder="Event description..." className="mt-1" />
                  </div>

                  {/* Event Image Upload Section */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium">Event Images (Upload up to 3)</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="event-image-1"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Image 1 selected:', file.name);

                              // Create preview
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const preview = document.getElementById('preview-1');
                                if (preview && e.target?.result) {
                                  preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded" alt="Image 1 preview" />`;
                                }
                              };
                              reader.readAsDataURL(file);

                              toast({
                                title: "Image 1 loaded",
                                description: `${file.name} ready for upload`,
                              });
                            }
                          }}
                        />
                        <label htmlFor="event-image-1" className="h-24 w-full flex flex-col items-center justify-center cursor-pointer">
                          <div id="preview-1" className="w-full h-full flex flex-col items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Click to upload<br />Image 1</p>
                          </div>
                        </label>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="event-image-2"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Image 2 selected:', file.name);

                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const preview = document.getElementById('preview-2');
                                if (preview && e.target?.result) {
                                  preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded" alt="Image 2 preview" />`;
                                }
                              };
                              reader.readAsDataURL(file);

                              toast({
                                title: "Image 2 loaded",
                                description: `${file.name} ready for upload`,
                              });
                            }
                          }}
                        />
                        <label htmlFor="event-image-2" className="h-24 w-full flex flex-col items-center justify-center cursor-pointer">
                          <div id="preview-2" className="w-full h-full flex flex-col items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Click to upload<br />Image 2</p>
                          </div>
                        </label>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="event-image-3"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Image 3 selected:', file.name);

                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const preview = document.getElementById('preview-3');
                                if (preview && e.target?.result) {
                                  preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded" alt="Image 3 preview" />`;
                                }
                              };
                              reader.readAsDataURL(file);

                              toast({
                                title: "Image 3 loaded",
                                description: `${file.name} ready for upload`,
                              });
                            }
                          }}
                        />
                        <label htmlFor="event-image-3" className="h-24 w-full flex flex-col items-center justify-center cursor-pointer">
                          <div id="preview-3" className="w-full h-full flex flex-col items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Click to upload<br />Image 3</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      const title = (document.getElementById('event-title') as HTMLInputElement)?.value;
                      const location = (document.getElementById('event-location') as HTMLInputElement)?.value;
                      const date = (document.getElementById('event-date') as HTMLInputElement)?.value;
                      const time = (document.getElementById('event-time') as HTMLInputElement)?.value;
                      const description = (document.getElementById('event-description') as HTMLTextAreaElement)?.value;

                      if (!title || !location || !date) {
                        toast({
                          title: "Missing information",
                          description: "Please fill in title, location and date",
                          variant: "destructive"
                        });
                        return;
                      }

                      // Create event via API - simplified approach
                      const eventData = {
                        title,
                        location,
                        date: date,  // Send as simple date string
                        time: time || '09:00',
                        description: description || ''
                      };

                      console.log('Sending simplified event data:', eventData);

                      // Use direct database insertion for now since API validation is problematic
                      const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env

                      fetch(`${BACKEND_URL}/api/admin/events/create`, { // Changed: Prepended BACKEND_URL to the request URL
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(eventData)
                      })
                        .then(res => {
                          if (res.ok) {
                            toast({
                              title: "Event created",
                              description: `"${title}" has been created successfully`,
                            });
                            // Clear form
                            (document.getElementById('event-title') as HTMLInputElement).value = '';
                            (document.getElementById('event-location') as HTMLInputElement).value = '';
                            (document.getElementById('event-date') as HTMLInputElement).value = '';
                            (document.getElementById('event-time') as HTMLInputElement).value = '';
                            (document.getElementById('event-description') as HTMLTextAreaElement).value = '';
                            // Refresh events list
                            queryClient.invalidateQueries({ queryKey: ['/api/events'] });
                          } else {
                            toast({
                              title: "Error creating event",
                              description: "Failed to create event",
                              variant: "destructive"
                            });
                          }
                        })
                        .catch(err => {
                          console.error('Create event error:', err);
                          toast({
                            title: "Error",
                            description: "Network error creating event",
                            variant: "destructive"
                          });
                        });
                    }}
                  >
                    📅 Create Event
                  </Button>
                </div>

                {/* Existing Events List */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">📋 Existing Events</h4>
                  {eventsLoading ? (
                    <div className="text-center py-4">Loading events...</div>
                  ) : eventsError ? (
                    <div className="text-center py-4 text-red-500">Error loading events</div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No events found. Create your first event above!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h5 className="font-medium text-lg">{event.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                📍 {event.location} • 📅 {new Date(event.date).toLocaleDateString()}
                                {new Date(event.date) < new Date() && <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">PAST EVENT</span>}
                                {new Date(event.date) >= new Date() && <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded">CURRENT/UPCOMING</span>}
                              </p>
                              {event.description && (
                                <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-1 gap-2 p-1 sm:grid-cols-2 md:grid-cols-3 w-full mx-auto max-w-sm sm:max-w-md lg:max-w-lg mt-2 sm:mt-0">
                              {/* Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                // CRITICAL: Allow text to wrap if button is too narrow
                                className="w-full text-sm px-3 py-1.5 h-auto whitespace-normal"
                                onClick={() => {
                                  const editForm = document.getElementById(`edit-form-${event.id}`);
                                  if (editForm) {
                                    editForm.classList.toggle('hidden');
                                  }
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>

                              {/* Delete Button (with confirmation) */}
                              <Button
                                variant="destructive"
                                size="sm"
                                // CRITICAL: Allow text to wrap if button is too narrow
                                className="w-full text-sm px-3 py-1.5 h-auto whitespace-normal"
                                onClick={() => {
                                  console.log('Delete button clicked for event:', event);
                                  if (window.confirm(`Delete event "${event.title}"?\n\nThis action cannot be undone.`)) {
                                    console.log('User confirmed deletion, calling mutation...');
                                    deleteEventMutation.mutate(event.id);
                                  } else {
                                    console.log('User cancelled deletion');
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>

                              {/* Test Delete Button (direct API call) */}
                              <Button
                                variant="outline"
                                size="sm"
                                // CRITICAL: Allow text to wrap if button is too narrow
                                className="w-full text-sm px-3 py-1.5 h-auto whitespace-normal"
                                onClick={() => {
                                  console.log('Simple delete clicked for event:', event.id);
                                  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env
                                  // Test direct API call
                                  fetch(`${BACKEND_URL}/api/admin/events/${event.id}`, {
                                    method: 'DELETE',
                                    credentials: 'include'
                                  })
                                    .then(res => {
                                      console.log('Delete response:', res.status);
                                      if (res.ok) {
                                        toast({
                                          title: "Event deleted",
                                          description: "Event removed successfully",
                                        });
                                        // Refresh events list
                                        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
                                      } else {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete event",
                                          variant: "destructive"
                                        });
                                      }
                                    })
                                    .catch(err => {
                                      console.error('Delete error:', err);
                                      toast({
                                        title: "Error",
                                        description: "Network error deleting event",
                                        variant: "destructive"
                                      });
                                    });
                                }}
                              >
                                🗑️ Test Delete
                              </Button>
                            </div>
                          </div>

                          {/* Event Images Section */}
                          <div className="mt-4">
                            <Label className="text-sm font-medium text-gray-700">Event Images</Label>
                            <div className="grid grid-cols-3 gap-3 mt-2">
                              <div className="relative group">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 cursor-pointer transition-colors h-20">
                                  <div className="h-full flex flex-col items-center justify-center">
                                    <Image className="h-6 w-6 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">Add Image 1</p>
                                  </div>
                                </div>
                              </div>
                              <div className="relative group">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 cursor-pointer transition-colors h-20">
                                  <div className="h-full flex flex-col items-center justify-center">
                                    <Image className="h-6 w-6 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">Add Image 2</p>
                                  </div>
                                </div>
                              </div>
                              <div className="relative group">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 cursor-pointer transition-colors h-20">
                                  <div className="h-full flex flex-col items-center justify-center">
                                    <Image className="h-6 w-6 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">Add Image 3</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Edit Form - Initially Hidden */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg hidden" id={`edit-form-${event.id}`}>
                            <h6 className="font-medium mb-3">✏️ Edit Event: {event.title}</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`edit-title-${event.id}`}>Title</Label>
                                <Input id={`edit-title-${event.id}`} defaultValue={event.title} className="mt-1" />
                              </div>
                              <div>
                                <Label htmlFor={`edit-location-${event.id}`}>Location</Label>
                                <Input id={`edit-location-${event.id}`} defaultValue={event.location} className="mt-1" />
                              </div>
                              <div>
                                <Label htmlFor={`edit-date-${event.id}`}>Date</Label>
                                <Input id={`edit-date-${event.id}`} type="date" defaultValue={event.date?.split('T')[0]} className="mt-1" />
                              </div>
                              <div>
                                <Label htmlFor={`edit-time-${event.id}`}>Time</Label>
                                <Input id={`edit-time-${event.id}`} type="time" defaultValue="09:00" className="mt-1" />
                              </div>
                            </div>
                            <div className="mt-3">
                              <Label htmlFor={`edit-description-${event.id}`}>Description</Label>
                              <Textarea id={`edit-description-${event.id}`} defaultValue={event.description || ''} className="mt-1" />
                            </div>

                            {/* Edit Event Images */}
                            <div className="mt-4">
                              <Label className="text-sm font-medium text-gray-700">Update Event Images</Label>
                              <div className="grid grid-cols-3 gap-3 mt-2">
                                <div className="relative group">
                                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 text-center hover:border-blue-500 cursor-pointer transition-colors h-20">
                                    <div className="h-full flex flex-col items-center justify-center">
                                      <Image className="h-6 w-6 text-blue-400 mb-1" />
                                      <p className="text-xs text-blue-600">Update Image 1</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 text-center hover:border-blue-500 cursor-pointer transition-colors h-20">
                                    <div className="h-full flex flex-col items-center justify-center">
                                      <Image className="h-6 w-6 text-blue-400 mb-1" />
                                      <p className="text-xs text-blue-600">Update Image 2</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 text-center hover:border-blue-500 cursor-pointer transition-colors h-20">
                                    <div className="h-full flex flex-col items-center justify-center">
                                      <Image className="h-6 w-6 text-blue-400 mb-1" />
                                      <p className="text-xs text-blue-600">Update Image 3</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  // Get form values
                                  const title = (document.getElementById(`edit-title-${event.id}`) as HTMLInputElement)?.value;
                                  const location = (document.getElementById(`edit-location-${event.id}`) as HTMLInputElement)?.value;
                                  const date = (document.getElementById(`edit-date-${event.id}`) as HTMLInputElement)?.value;
                                  const time = (document.getElementById(`edit-time-${event.id}`) as HTMLInputElement)?.value;
                                  const description = (document.getElementById(`edit-description-${event.id}`) as HTMLTextAreaElement)?.value;

                                  if (!title || !location || !date || !time) {
                                    toast({
                                      title: "Missing Information",
                                      description: "Please fill in all required fields",
                                      variant: "destructive"
                                    });
                                    return;
                                  }

                                  try {
                                    const updateData = {
                                      title,
                                      location,
                                      date: new Date(date + 'T' + time + ':00'),
                                      time,
                                      description
                                    };
                                    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env
                                    const response = await fetch(`${BACKEND_URL}/api/admin/events/${event.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      credentials: 'include',
                                      body: JSON.stringify(updateData)
                                    });

                                    if (response.ok) {
                                      toast({
                                        title: "Event Updated",
                                        description: `"${title}" has been updated successfully`,
                                      });

                                      // Hide edit form
                                      const editForm = document.getElementById(`edit-form-${event.id}`);
                                      if (editForm) {
                                        editForm.classList.add('hidden');
                                      }

                                      // Refresh events list
                                      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
                                    } else {
                                      throw new Error('Failed to update event');
                                    }
                                  } catch (error) {
                                    console.error('Update error:', error);
                                    toast({
                                      title: "Update Failed",
                                      description: "Could not update the event",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                💾 Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const editForm = document.getElementById(`edit-form-${event.id}`);
                                  if (editForm) {
                                    editForm.classList.add('hidden');
                                  }
                                }}
                              >
                                ❌ Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bulk Event Management */}
                <div className="space-y-4 mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-700">⚠️ Bulk Event Management</h4>
                  <p className="text-sm text-red-600">Permanently delete multiple events at once</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3"> {/* Key changes for responsiveness */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full whitespace-normal text-sm px-3 py-2 h-auto" // Added w-full, whitespace-normal, h-auto, px/py
                    >
                      🗑️ Delete All Past Events
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full whitespace-normal text-sm px-3 py-2 h-auto" // Added w-full, whitespace-normal, h-auto, px/py
                    >
                      🗑️ Delete All Events
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Professionals Tab */}
        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Professionals Management</CardTitle>
              <CardDescription>Manage trending professionals and featured work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Trending Professionals
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Add Featured Professional
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">To Be Packing</h4>
                        <p className="text-sm text-muted-foreground">Packaging & Displays</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Articles & Insights Management</CardTitle>
              <CardDescription>Import content from websites or create original articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Industry Articles
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Create New Article
                  </Button>
                </div>

                {/* Import from Website Section */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50"> {/* Adjusted padding for mobile */}
                  <h4 className="font-medium mb-3 text-gray-700 text-base sm:text-lg">📥 Import Content from Website</h4> {/* Adjusted margin and font size */}
                  <div className="space-y-3 sm:space-y-4"> {/* Adjusted vertical spacing */}
                    <div>
                      <Label htmlFor="import-url" className="text-sm">Website URL</Label> {/* Added text-sm for label */}
                      <Input
                        id="import-url"
                        placeholder="https://example.com/jewelry-article"
                        className="mt-1 text-sm sm:text-base" // Adjusted font size for input
                      />
                    </div>
                    {/* Button Container: */}
                    {/* flex flex-col: Stack buttons vertically on smallest screens */}
                    {/* sm:flex-row: Arrange buttons horizontally from 'sm' breakpoint */}
                    {/* gap-2: Consistent spacing between buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // whitespace-normal: Allow text to wrap if necessary (e.g., if content pushes button to be very narrow)
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                        onClick={async () => {
                          const urlInput = document.getElementById('import-url') as HTMLInputElement;
                          const url = urlInput?.value?.trim();

                          if (!url) {
                            toast({
                              title: "URL Required",
                              description: "Please enter a website URL to preview",
                              variant: "destructive"
                            });
                            return;
                          }

                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            toast({
                              title: "Invalid URL",
                              description: "Please enter a valid URL starting with http:// or https://",
                              variant: "destructive"
                            });
                            return;
                          }

                          toast({
                            title: "Previewing Content",
                            description: `Fetching content from ${url}...`
                          });

                          try {
                            const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env
                            const response = await fetch(BACKEND_URL+'/api/admin/preview-content', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({ url })
                            });

                            if (response.ok) {
                              const data = await response.json();
                              console.log('Preview data:', data);

                              // Show preview in a modal or update UI
                              const previewDiv = document.getElementById('content-preview');
                              if (previewDiv) {
                                previewDiv.innerHTML = `
                  <div class="border rounded-lg p-4 mt-4 bg-white">
                    <h5 class="font-medium text-lg mb-2">${data.title || 'Untitled'}</h5>
                    <p class="text-sm text-gray-600 mb-3">Author: ${data.author || 'Unknown'}</p>
                    <div class="text-sm text-gray-800 max-h-96 overflow-y-auto">
                      ${data.content || 'No content found'}
                    </div>
                  </div>
                `;
                                previewDiv.classList.remove('hidden');
                              }

                              toast({
                                title: "Preview Ready",
                                description: "Content preview loaded successfully"
                              });
                            } else {
                              throw new Error('Failed to preview content');
                            }
                          } catch (error) {
                            console.error('Preview error:', error);
                            toast({
                              title: "Preview Failed",
                              description: "Could not preview content from this website",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        🔍 Preview Content
                      </Button>
                      <Button
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // whitespace-normal: Allow text to wrap if necessary
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                        onClick={async () => {
                          const urlInput = document.getElementById('import-url') as HTMLInputElement;
                          const url = urlInput?.value?.trim();

                          if (!url) {
                            toast({
                              title: "URL Required",
                              description: "Please enter a website URL to import",
                              variant: "destructive"
                            });
                            return;
                          }

                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            toast({
                              title: "Invalid URL",
                              description: "Please enter a valid URL starting with http:// or https://",
                              variant: "destructive"
                            });
                            return;
                          }

                          toast({
                            title: "Importing Article",
                            description: `Importing content from ${url}...`
                          });

                          try {
                            const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env
                            const response = await fetch(`${BACKEND_URL}/api/admin/import-article`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({ url })
                            });

                            if (response.ok) {
                              const article = await response.json();
                              console.log('Imported article:', article);

                              toast({
                                title: "Article Imported",
                                description: `Successfully imported "${article.title || 'article'}" from ${url}`
                              });

                              // Clear the URL input
                              urlInput.value = '';

                              // Hide preview if shown
                              const previewDiv = document.getElementById('content-preview');
                              if (previewDiv) {
                                previewDiv.classList.add('hidden');
                              }

                              // Refresh articles list (if we have one)
                              // queryClient.invalidateQueries({ queryKey: ['/api/articles'] });

                            } else {
                              throw new Error('Failed to import article');
                            }
                          } catch (error) {
                            console.error('Import error:', error);
                            toast({
                              title: "Import Failed",
                              description: "Could not import content from this website",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        📥 Import Article
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview Area */}
                  <div id="content-preview" className="hidden">
                    {/* Preview content will be dynamically inserted here */}
                  </div>
                </div>

                {/* Manual Article Creation */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">✍️ Create Original Article</h4>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="article-title">Article Title</Label>
                    <Input id="article-title" placeholder="Enter article title" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="article-author">Author</Label>
                    <Input id="article-author" placeholder="Article author name" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="article-source">Source Website (optional)</Label>
                    <Input id="article-source" placeholder="Original source URL" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="article-content">Content</Label>
                    <Textarea id="article-content" placeholder="Write your article content here..." className="mt-1 min-h-[150px]" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="article-tags">Tags</Label>
                    <Input id="article-tags" placeholder="jewelry, trends, industry (comma separated)" className="mt-1" />
                  </div>
                  <Button className="w-full">📄 Save Article</Button>
                </div>

                {/* Saved Articles Display */}
                <div className="space-y-4 mt-8">
                  <h4 className="font-medium text-gray-700">📰 Saved Articles</h4>
                  <SavedArticlesSection />
                </div>

                {/* Existing Articles Management */}
                <div className="space-y-4 mt-8">
                  <h4 className="font-medium text-gray-700">📝 Article Templates</h4>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">Sample Article Template</h5>
                        <p className="text-sm text-gray-600">Published by Industry Expert • 3 days ago</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">Sustainable Jewelry Manufacturing</h5>
                        <p className="text-sm text-gray-600">Published by Green Jewelry Magazine • 1 week ago</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletters Tab */}
        <TabsContent value="newsletters">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Management</CardTitle>
              <CardDescription>Import content from websites or create newsletters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    My Newsletters
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Create Newsletter
                  </Button>
                </div>

                {/* Import Newsletter Content Section */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 sm:p-6 bg-blue-50"> {/* Adjusted padding for mobile */}
                  <h4 className="font-medium mb-3 text-blue-700 text-base sm:text-lg">📧 Import Newsletter Content</h4> {/* Adjusted margin and font size */}
                  <div className="space-y-3 sm:space-y-4"> {/* Adjusted vertical spacing */}
                    <div>
                      <Label htmlFor="newsletter-import-url" className="text-sm">Newsletter/Article URL</Label> {/* Added text-sm for label */}
                      <Input
                        id="newsletter-import-url"
                        placeholder="https://example.com/newsletter-article"
                        className="mt-1 text-sm sm:text-base" // Adjusted font size for input
                      />
                    </div>
                    {/* Button Container: */}
                    {/* flex flex-col: Stack buttons vertically on smallest screens */}
                    {/* sm:flex-row: Arrange buttons horizontally from 'sm' breakpoint */}
                    {/* gap-2: Consistent spacing between buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // CRITICAL: Allow text to wrap if necessary (e.g., if content pushes button to be very narrow)
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                      // Add your onClick logic here, similar to your original code
                      // onClick={() => { /* ... */ }}
                      >
                        🔍 Preview Content
                      </Button>
                      <Button
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // CRITICAL: Allow text to wrap if necessary
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                      // Add your onClick logic here, similar to your original code
                      // onClick={() => { /* ... */ }}
                      >
                        📧 Import to Newsletter
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Manual Newsletter Creation */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">✍️ Create Original Newsletter</h4>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="newsletter-title">Newsletter Title</Label>
                    <Input id="newsletter-title" placeholder="Enter newsletter title" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="newsletter-content">Newsletter Content</Label>
                    <Textarea id="newsletter-content" placeholder="Write your newsletter content..." className="mt-1 min-h-[120px]" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="newsletter-source">Source URLs (optional)</Label>
                    <Textarea id="newsletter-source" placeholder="List source URLs for content references..." className="mt-1 h-20" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="subscriber-list">Send To</Label>
                    <Input id="subscriber-list" placeholder="All subscribers" className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button>💾 Save Draft</Button>
                    <Button variant="outline">📤 Send Newsletter</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gemstones Tab */}
        <TabsContent value="gemstones">
          <Card>
            <CardHeader>
              <CardTitle>Gemstone Management</CardTitle>
              <CardDescription>Manage featured gemstones and suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Featured Gemstones
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Add Featured Gemstone
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="gemstone-name">Gemstone Name</Label>
                    <Input id="gemstone-name" placeholder="Enter gemstone name" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="gemstone-description">Description</Label>
                    <Textarea id="gemstone-description" placeholder="Describe the gemstone..." className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gemstone-price">Price</Label>
                      <Input id="gemstone-price" placeholder="$0.00" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="gemstone-supplier">Supplier</Label>
                      <Input id="gemstone-supplier" placeholder="Supplier name" className="mt-1" />
                    </div>
                  </div>
                  <Button>Add Gemstone</Button>
                </div>

                {/* Existing Featured Gemstones Management */}
                <div className="space-y-4 mt-8 px-4 sm:px-0"> {/* Added horizontal padding for very small screens */}
                  <h4 className="font-medium text-gray-700 text-lg">💎 Manage Featured Gemstones</h4>
                  <div className="grid gap-4">
                    {/* Gemstone Card 1 */}
                    <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2"> {/* Changed to flex-col on mobile, flex-row on sm */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"> {/* flex-shrink-0 to prevent icon from shrinking */}
                          <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /> {/* Adjusted icon size */}
                        </div>
                        <div>
                          <h5 className="font-medium text-base sm:text-lg leading-tight">Premium Blue Sapphire</h5> {/* Adjusted font size and line height */}
                          <p className="text-xs sm:text-sm text-gray-600 leading-tight">GemsBiz Supplier • $2,400 per carat</p> {/* Adjusted font size and line height */}
                        </div>
                      </div>
                      {/* Buttons Container: */}
                      {/* flex flex-col: Stack buttons vertically on smallest screens */}
                      {/* xs:flex-row: Arrange buttons horizontally from 'xs' breakpoint (if defined), or sm:flex-row */}
                      {/* w-full: Make button container take full width when stacked */}
                      {/* sm:w-auto: Revert to auto width on larger screens */}
                      <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto whitespace-nowrap text-sm px-3 py-1.5"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full xs:w-auto whitespace-nowrap text-sm px-3 py-1.5"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Gemstone Card 2 (apply same classes) */}
                    <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-base sm:text-lg leading-tight">Colombian Emerald Collection</h5>
                          <p className="text-xs sm:text-sm text-gray-600 leading-tight">Elite Gems • $1,800 per carat</p>
                        </div>
                      </div>
                      <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto whitespace-nowrap text-sm px-3 py-1.5"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full xs:w-auto whitespace-nowrap text-sm px-3 py-1.5"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Management</CardTitle>
              <CardDescription>Manage jewelry marketplace and group purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Marketplace Listings
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Create New Listing
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="listing-title">Listing Title</Label>
                    <Input id="listing-title" placeholder="Enter listing title" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="listing-description">Description</Label>
                    <Textarea id="listing-description" placeholder="Describe the item..." className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listing-price">Price</Label>
                      <Input id="listing-price" placeholder="$0.00" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="listing-category">Category</Label>
                      <Input id="listing-category" placeholder="Select category" className="mt-1" />
                    </div>
                  </div>
                  <Button>Create Listing</Button>
                </div>

                {/* Existing Marketplace Listings Management */}
                <div className="space-y-4 mt-8">
                  <h4 className="font-medium text-gray-700">🛍️ Manage Marketplace Listings</h4>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">Vintage Silver Ring Collection</h5>
                        <p className="text-sm text-gray-600">Posted by Carmela • $450 • Closeout Sale</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">Professional Jewelry Tools Set</h5>
                        <p className="text-sm text-gray-600">Posted by Admin • $1,200 • Equipment</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Import images and content from websites or upload directly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"> {/* Key changes for responsiveness */}
                  {/* Heading: Responsive font size */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 text-center sm:text-left w-full sm:w-auto"> {/* Added w-full for stacking, text alignment */}
                    Featured Work Gallery
                  </h3>
                  {/* Button: Responsive width and text wrapping */}
                  <Button
                    className="w-full sm:w-auto whitespace-normal h-auto py-2 px-4 text-sm" // Ensure button takes full width when stacked
                  >
                    <Plus className="h-4 w-4 mr-2 sm:mr-1 lg:mr-2" /> {/* Adjusted margin for icon on smaller screens */}
                    Upload Featured Work
                  </Button>
                </div>

                {/* Import Images from Website Section */}
                <div className="border-2 border-dashed border-green-200 rounded-lg p-4 sm:p-6 bg-green-50"> {/* Adjusted padding for mobile */}
                  <h4 className="font-medium mb-3 text-green-700 text-base sm:text-lg">🖼️ Import Images from Website</h4> {/* Adjusted margin and font size */}
                  <div className="space-y-3 sm:space-y-4"> {/* Adjusted vertical spacing */}
                    <div>
                      <Label htmlFor="image-import-url" className="text-sm">Website or Image URL</Label> {/* Added text-sm for label */}
                      <Input
                        id="image-import-url"
                        placeholder="https://example.com/jewelry-images or direct image URL"
                        className="mt-1 text-sm sm:text-base" // Adjusted font size for input
                      />
                    </div>
                    {/* Button Container: */}
                    {/* flex flex-col: Stack buttons vertically on smallest screens */}
                    {/* sm:flex-row: Arrange buttons horizontally from 'sm' breakpoint */}
                    {/* gap-2: Consistent spacing between buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // CRITICAL: Allow text to wrap if necessary (e.g., if content pushes button to be very narrow)
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                      // Add your onClick logic here
                      // onClick={() => { /* ... */ }}
                      >
                        🔍 Scan for Images
                      </Button>
                      <Button
                        // w-full: Make button take full width when stacked (on flex-col)
                        // sm:flex-1: Make button take equal available width when in a row (on sm:flex-row)
                        // CRITICAL: Allow text to wrap if necessary
                        // h-auto py-2: Adjust height if text wraps, ensure good vertical padding
                        className="w-full sm:flex-1 whitespace-normal h-auto py-2 text-sm sm:text-base"
                      // Add your onClick logic here
                      // onClick={() => { /* ... */ }}
                      >
                        📥 Import Images
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Manual Upload Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">📁 Direct Upload</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary cursor-pointer">
                      <div className="h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm">Click to Upload</p>
                    </div>
                  </div>
                </div>

                {/* Homepage Content Management */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Homepage Content</h3>

                  {/* Import Homepage Content */}
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="font-medium mb-3 text-purple-700">🏠 Import Homepage Content</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Import content from website URL"
                        className="text-sm"
                      />
                      <Button variant="outline" size="sm" className="w-full">
                        📥 Import Content
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <Label htmlFor="hero-title">Hero Section Title</Label>
                    <Input id="hero-title" placeholder="Main headline" className="mt-1" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
                    <Textarea id="hero-subtitle" placeholder="Supporting text..." className="mt-1" />
                  </div>
                  <Button>💾 Update Homepage</Button>
                </div>

                {/* Existing Content Management */}
                <div className="space-y-4 mt-8">
                  <h4 className="font-medium text-gray-700">🖼️ Manage Featured Work Gallery</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 relative group">
                      <img src="/api/placeholder/150/100" alt="Featured work" className="w-full h-24 object-cover rounded" />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs mt-1">Diamond Ring Collection</p>
                    </div>
                    <div className="border rounded-lg p-3 relative group">
                      <img src="/api/placeholder/150/100" alt="Featured work" className="w-full h-24 object-cover rounded" />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs mt-1">Artisan Necklaces</p>
                    </div>
                  </div>
                </div>

                {/* Bulk Content Management */}
                <div className="space-y-3 mt-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg"> {/* Adjusted padding and spacing */}
                  <h4 className="font-medium text-red-700 text-base sm:text-lg">⚠️ Bulk Content Management</h4> {/* Adjusted font size */}
                  <p className="text-xs sm:text-sm text-red-600">Use these tools carefully - bulk deletions cannot be undone!</p> {/* Adjusted font size */}

                  {/* Buttons Grid Container: */}
                  {/* grid grid-cols-1: Stack buttons in a single column on smallest screens */}
                  {/* xs:grid-cols-2: On 'xs' breakpoint (e.g., 475px), try for 2 columns. Adjust if you don't have xs. */}
                  {/* md:grid-cols-2 (or md:grid-cols-3/4 if content fits well): On larger screens, maintain 2 columns or expand. */}
                  {/* gap-2 sm:gap-3: Responsive gap between buttons. */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      // CRITICAL: Allow text to wrap and adjust height
                      className="w-full h-auto py-2 text-sm whitespace-normal text-center"
                    // Add onClick handler here if applicable
                    >
                      🗑️ Delete All Articles
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-auto py-2 text-sm whitespace-normal text-center"
                    // Add onClick handler here if applicable
                    >
                      🗑️ Delete All Featured Work
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-auto py-2 text-sm whitespace-normal text-center"
                    // Add onClick handler here if applicable
                    >
                      🗑️ Delete All Gemstones
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-auto py-2 text-sm whitespace-normal text-center"
                    // Add onClick handler here if applicable
                    >
                      🗑️ Delete All Marketplace
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
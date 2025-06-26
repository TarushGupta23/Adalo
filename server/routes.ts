import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertConnectionSchema, 
  insertMessageSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertInventoryItemSchema,
  insertCartSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertMarketplaceListingSchema,
  insertGroupPurchaseSchema,
  insertGroupPurchaseParticipantSchema,
  insertProfilePhotoSchema,
  isAdminUser
} from "@shared/schema";

function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

// Middleware to check if the user is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }
  
  if (!isAdminUser(req.user!.username)) {
    return res.status(403).send("Admin access required");
  }
  
  return next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Username recovery route
  app.post("/api/recover-username", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If this email is registered, you'll receive your username shortly." });
      }

      // For now, return success message (email sending will work once SendGrid is configured)
      res.json({ 
        message: "If this email is registered, you'll receive your username shortly.",
        username: user.username // Remove this in production, only for testing
      });
    } catch (error) {
      console.error("Username recovery error:", error);
      res.status(500).json({ message: "Failed to process username recovery" });
    }
  });

  // API routes
  
  // User routes
  app.get("/api/users", async (req, res) => {
    const { query, userType, location } = req.query;
    const users = await storage.searchUsers(
      query as string || "", 
      userType as string, 
      location as string
    );
    res.json(users);
  });
  
  // Profile Photos routes
  app.get("/api/users/:userId/photos", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const photos = await storage.getProfilePhotosByUser(userId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/users/:userId/photos", isAuthenticated, async (req, res) => {
    try {
      // Ensure users can only upload photos to their own profile
      if (req.user?.id !== parseInt(req.params.userId)) {
        return res.status(403).json({ error: "Unauthorized to add photos to this profile" });
      }
      
      const photoData = {
        userId: parseInt(req.params.userId),
        photoUrl: req.body.photoUrl,
        caption: req.body.caption,
        displayOrder: req.body.displayOrder
      };
      
      const photo = await storage.createProfilePhoto(photoData);
      res.status(201).json(photo);
    } catch (error: any) {
      if (error.message === "Maximum number of photos (10) reached") {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  });
  
  app.put("/api/photos/:id", isAuthenticated, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const photo = await storage.getProfilePhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      // Ensure users can only update their own photos
      if (req.user?.id !== photo.userId) {
        return res.status(403).json({ error: "Unauthorized to update this photo" });
      }
      
      const updatedPhoto = await storage.updateProfilePhoto(photoId, req.body);
      res.json(updatedPhoto);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.delete("/api/photos/:id", isAuthenticated, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const photo = await storage.getProfilePhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      // Ensure users can only delete their own photos
      if (req.user?.id !== photo.userId) {
        return res.status(403).json({ error: "Unauthorized to delete this photo" });
      }
      
      await storage.deleteProfilePhoto(photoId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    if (req.user!.id !== parseInt(req.params.id)) {
      return res.status(403).send("Forbidden");
    }
    
    const updatedUser = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!updatedUser) return res.status(404).send("User not found");
    res.json(updatedUser);
  });
  
  // Admin route for updating any user (requires admin authentication)
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    const updatedUser = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!updatedUser) return res.status(404).send("User not found");
    res.json(updatedUser);
  });
  
  // Admin route to delete a user (requires admin authentication)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists first
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).send("User not found");
      
      // Delete the user and all associated data
      await storage.deleteUser(userId);
      res.status(200).send("User and associated data deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Error deleting user");
    }
  });
  
  // Admin route to get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.searchUsers(""); // Get all users by searching with empty query
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).send("Error fetching users");
    }
  });
  
  // Admin route to update user photos
  app.patch("/api/admin/users/:userId/photos/:photoId", isAdmin, async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const photo = await storage.getProfilePhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      const updatedPhoto = await storage.updateProfilePhoto(photoId, req.body);
      res.json(updatedPhoto);
    } catch (error) {
      console.error("Error updating user photo:", error);
      res.status(500).json({ error: "Error updating photo" });
    }
  });
  
  // Admin route to add photos to any user's profile
  app.post("/api/admin/users/:userId/photos", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const photoData = {
        userId: userId,
        photoUrl: req.body.photoUrl,
        caption: req.body.caption,
        displayOrder: req.body.displayOrder
      };
      
      const photo = await storage.createProfilePhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error adding photo to user profile:", error);
      res.status(500).json({ error: "Error adding photo" });
    }
  });

  // Connection routes
  app.get("/api/connections", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const status = req.query.status as string;
    const connections = await storage.getUserConnections(userId, status);
    res.json(connections);
  });

  app.post("/api/connections", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertConnectionSchema.parse({
        ...req.body,
        requesterId: req.user!.id
      });
      
      // Check if connection already exists
      const existingConnection = await storage.getConnectionByUsers(
        validatedData.requesterId,
        validatedData.recipientId
      );
      
      if (existingConnection) {
        return res.status(400).send("Connection already exists");
      }
      
      const connection = await storage.createConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });

  app.patch("/api/connections/:id", isAuthenticated, async (req, res) => {
    try {
      const connection = await storage.getConnection(parseInt(req.params.id));
      if (!connection) return res.status(404).send("Connection not found");
      
      // Only recipient can update status
      if (connection.recipientId !== req.user!.id) {
        return res.status(403).send("Forbidden");
      }
      
      const { status } = req.body;
      if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).send("Invalid status");
      }
      
      const updatedConnection = await storage.updateConnection(parseInt(req.params.id), status);
      res.json(updatedConnection);
    } catch (error) {
      throw error;
    }
  });

  // Message routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const messages = await storage.getUserMessages(userId);
    res.json(messages);
  });

  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    const currentUserId = req.user!.id;
    const otherUserId = parseInt(req.params.userId);
    
    // Check if users are connected
    const connection = await storage.getConnectionByUsers(currentUserId, otherUserId);
    if (!connection || connection.status !== "accepted") {
      return res.status(403).send("Users are not connected");
    }
    
    const conversation = await storage.getConversation(currentUserId, otherUserId);
    res.json(conversation);
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });
      
      // Check if users are connected
      const connection = await storage.getConnectionByUsers(
        validatedData.senderId,
        validatedData.recipientId
      );
      
      if (!connection || connection.status !== "accepted") {
        return res.status(403).send("Users are not connected");
      }
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    const messageId = parseInt(req.params.id);
    const message = await storage.getMessage(messageId);
    
    if (!message) return res.status(404).send("Message not found");
    if (message.recipientId !== req.user!.id) {
      return res.status(403).send("Forbidden");
    }
    
    const updatedMessage = await storage.markMessageAsRead(messageId);
    res.json(updatedMessage);
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(parseInt(req.params.id));
    if (!event) return res.status(404).send("Event not found");
    res.json(event);
  });

  // All authenticated users can create events
  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse({
        ...req.body,
        creatorId: req.user!.id
      });
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });
  
  // Content import routes for administrators
  app.post("/api/admin/preview-content", isAdmin, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Valid URL is required" });
      }
      
      console.log('Previewing content from:', url);
      
      // Basic content extraction
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Content-Preview-Bot/1.0)'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Simple content extraction 
      const titleRegex = new RegExp('<title[^>]*>([^<]+)</title>', 'i');
      const titleMatch = html.match(titleRegex);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
      
      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract author
      const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i);
      const author = authorMatch ? authorMatch[1] : '';
      
      // Basic content extraction (remove HTML tags for preview)
      let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      content = content.replace(/<[^>]+>/g, ' ');
      content = content.replace(/\s+/g, ' ').trim();
      
      // Limit content for preview
      if (content.length > 1000) {
        content = content.substring(0, 1000) + '...';
      }
      
      res.json({
        title,
        author,
        description,
        content,
        url
      });
      
    } catch (error) {
      console.error('Content preview error:', error);
      res.status(500).json({ 
        error: "Failed to preview content",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.post("/api/admin/import-article", isAdmin, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Valid URL is required" });
      }
      
      console.log('Importing article from:', url);
      
      // Get content (similar to preview but save to database)
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Content-Import-Bot/1.0)'
        },
        timeout: 15000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract content
      const titleRegex = new RegExp('<title[^>]*>([^<]+)</title>', 'i');
      const titleMatch = html.match(titleRegex);
      const title = titleMatch ? titleMatch[1].trim() : 'Imported Article';
      
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const description = descMatch ? descMatch[1] : '';
      
      const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i);
      const author = authorMatch ? authorMatch[1] : 'Unknown';
      
      // Extract main content
      let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
      content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
      content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      
      // Save article to database
      const articleData = {
        title,
        author,
        description,
        content: content.substring(0, 5000), // Limit content length
        sourceUrl: url,
        importedBy: req.user!.id
      };
      
      const savedArticle = await storage.createArticle(articleData);
      
      console.log('Article imported successfully:', { title, author, url });
      
      res.status(201).json(savedArticle);
      
    } catch (error) {
      console.error('Article import error:', error);
      res.status(500).json({ 
        error: "Failed to import article",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all articles (admin only)
  app.get("/api/admin/articles", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // Delete article (admin only)
  app.delete("/api/admin/articles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      await storage.deleteArticle(articleId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  // Admin route to update events
  app.patch("/api/admin/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Administrators can update any event
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Error updating event" });
    }
  });
  
  // Admin route to create events (simplified)
  app.post("/api/admin/events/create", isAdmin, async (req, res) => {
    try {
      const { title, location, date, time, description } = req.body;
      
      // Create event directly without strict validation
      const eventData = {
        creatorId: req.user!.id,
        title: title || 'Untitled Event',
        location: location || 'TBD',
        date: new Date(date + 'T' + (time || '09:00') + ':00'),
        time: time || '09:00',
        description: description || '',
        imageUrl: null
      };
      
      console.log('Creating event with data:', eventData);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Error creating event: " + error.message });
    }
  });

  // Admin route to delete events
  app.delete("/api/admin/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Administrators can delete any event
      await storage.deleteEvent(eventId);
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Error deleting event" });
    }
  });

  // Developer management routes
  app.get("/api/developers", isAdmin, async (req, res) => {
    try {
      const developers = await storage.getAllDevelopers();
      
      // Get user details for each developer
      const developersWithUsers = await Promise.all(
        developers.map(async (dev) => {
          const user = await storage.getUser(dev.userId);
          return { ...dev, user };
        })
      );
      
      res.json(developersWithUsers);
    } catch (error) {
      console.error("Error fetching developers:", error);
      res.status(500).json({ error: "Error fetching developers" });
    }
  });

  app.post("/api/developers", isAdmin, async (req, res) => {
    try {
      const developerData = {
        ...req.body,
        addedBy: req.user!.id
      };
      
      const developer = await storage.createDeveloper(developerData);
      res.status(201).json(developer);
    } catch (error) {
      console.error("Error creating developer:", error);
      res.status(500).json({ error: "Error creating developer" });
    }
  });

  app.put("/api/developers/:id", isAdmin, async (req, res) => {
    try {
      const developerId = parseInt(req.params.id);
      const updatedDeveloper = await storage.updateDeveloper(developerId, req.body);
      
      if (!updatedDeveloper) {
        return res.status(404).json({ error: "Developer not found" });
      }
      
      res.json(updatedDeveloper);
    } catch (error) {
      console.error("Error updating developer:", error);
      res.status(500).json({ error: "Error updating developer" });
    }
  });

  app.delete("/api/developers/:id", isAdmin, async (req, res) => {
    try {
      const developerId = parseInt(req.params.id);
      await storage.deleteDeveloper(developerId);
      res.status(200).json({ message: "Developer removed successfully" });
    } catch (error) {
      console.error("Error deleting developer:", error);
      res.status(500).json({ error: "Error deleting developer" });
    }
  });

  // Project assignment routes
  app.get("/api/project-assignments", isAdmin, async (req, res) => {
    try {
      const assignments = await storage.getAllProjectAssignments();
      
      // Get developer and user details for each assignment
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const developer = await storage.getDeveloper(assignment.developerId);
          const user = developer ? await storage.getUser(developer.userId) : null;
          return { ...assignment, developer: { ...developer, user } };
        })
      );
      
      res.json(assignmentsWithDetails);
    } catch (error) {
      console.error("Error fetching project assignments:", error);
      res.status(500).json({ error: "Error fetching project assignments" });
    }
  });

  app.post("/api/project-assignments", isAdmin, async (req, res) => {
    try {
      const assignmentData = {
        ...req.body,
        assignedBy: req.user!.id
      };
      
      const assignment = await storage.createProjectAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating project assignment:", error);
      res.status(500).json({ error: "Error creating project assignment" });
    }
  });

  app.put("/api/project-assignments/:id", isAdmin, async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const updatedAssignment = await storage.updateProjectAssignment(assignmentId, req.body);
      
      if (!updatedAssignment) {
        return res.status(404).json({ error: "Project assignment not found" });
      }
      
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating project assignment:", error);
      res.status(500).json({ error: "Error updating project assignment" });
    }
  });

  // RSVP routes
  app.get("/api/events/:id/rsvps", async (req, res) => {
    const eventId = parseInt(req.params.id);
    const rsvps = await storage.getRsvpsByEvent(eventId);
    
    // Get user details for each RSVP
    const rsvpsWithUsers = await Promise.all(
      rsvps.map(async (rsvp) => {
        const user = await storage.getUser(rsvp.userId);
        return { ...rsvp, user };
      })
    );
    
    res.json(rsvpsWithUsers);
  });
  
  // Get current user's RSVPs
  app.get("/api/user/rsvps", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      // Try to get RSVPs - handle database schema differences
      let rsvps;
      try {
        rsvps = await storage.getRsvpsByUser(userId);
      } catch (err) {
        console.error("Error fetching RSVPs, returning empty array:", err);
        return res.json([]);
      }
      
      // Get event details for each RSVP
      const rsvpsWithEvents = await Promise.all(
        rsvps.map(async (rsvp) => {
          const event = await storage.getEvent(rsvp.eventId);
          return { ...rsvp, event };
        })
      );
      
      res.json(rsvpsWithEvents);
    } catch (error) {
      console.error("Error in /api/user/rsvps:", error);
      res.status(500).json({ message: "Failed to retrieve RSVPs" });
    }
  });

  app.post("/api/events/:id/rsvp", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) return res.status(404).send("Event not found");
      
      // Check if user already RSVP'd
      try {
        const existingRsvp = await storage.getRsvp(eventId, userId);
        if (existingRsvp) {
          return res.status(400).send("Already RSVP'd to this event");
        }
      } catch (error) {
        console.error("Error checking for existing RSVP:", error);
        // Continue with creation even if check fails
      }
      
      // Create RSVP without isPublic field to avoid schema issues
      const validatedData = insertEventRsvpSchema.parse({
        eventId,
        userId
      });
      
      try {
        const rsvp = await storage.createRsvp(validatedData);
        res.status(201).json(rsvp);
      } catch (error) {
        console.error("Error creating RSVP:", error);
        return res.status(500).json({ message: "Failed to create RSVP due to database error" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Unhandled error in RSVP creation:", error);
      return res.status(500).json({ message: "An error occurred while processing your request" });
    }
  });
  
  // Update RSVP visibility
  app.patch("/api/events/:id/rsvp", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user!.id;
      const isPublic = req.body.isPublic;
      
      if (isPublic === undefined) {
        return res.status(400).send("Visibility preference required");
      }
      
      // Check if RSVP exists
      const existingRsvp = await storage.getRsvp(eventId, userId);
      if (!existingRsvp) {
        return res.status(404).send("RSVP not found");
      }
      
      // Update RSVP visibility
      const updatedRsvp = {
        ...existingRsvp,
        isPublic
      };
      
      // We need to implement this storage method
      const rsvp = await storage.updateRsvp(existingRsvp.id, updatedRsvp);
      res.json(rsvp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    const featured = req.query.featured === "true";
    const items = await storage.getAllInventory(featured);
    
    // Get creator details for each item
    const itemsWithCreators = await Promise.all(
      items.map(async (item) => {
        const user = await storage.getUser(item.userId);
        return { ...item, creator: user };
      })
    );
    
    res.json(itemsWithCreators);
  });

  app.get("/api/users/:id/inventory", async (req, res) => {
    const userId = parseInt(req.params.id);
    const items = await storage.getUserInventory(userId);
    res.json(items);
  });

  app.post("/api/inventory", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });

  // Gemstone Marketplace routes
  
  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      // Try to get from storage first
      try {
        const suppliers = await storage.getAllSuppliers();
        if (suppliers && suppliers.length > 0) {
          return res.json(suppliers);
        }
      } catch (storageError) {
        console.error("Storage error fetching suppliers:", storageError);
        // Continue with fallback data if storage fails
      }
      
      // Fallback supplier data
      const suppliers = [
        {
          id: 1,
          name: "GemsBiz",
          description: "Premium supplier of high-quality gemstones for the jewelry industry.",
          location: "New York, NY",
          website: "www.gemsbiz.com",
          createdAt: new Date()
        }
      ];
      
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to retrieve suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      
      // Try to get from storage first
      try {
        const supplier = await storage.getSupplier(supplierId);
        if (supplier) {
          return res.json(supplier);
        }
      } catch (storageError) {
        console.error("Storage error fetching supplier:", storageError);
        // Continue with fallback data if storage fails
      }
      
      // Fallback supplier data
      if (supplierId === 1) {
        return res.json({
          id: 1,
          name: "GemsBiz",
          description: "Premium supplier of high-quality gemstones for the jewelry industry.",
          location: "New York, NY",
          website: "www.gemsbiz.com",
          createdAt: new Date()
        });
      }
      
      res.status(404).send("Supplier not found");
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to retrieve supplier" });
    }
  });

  // Category routes
  app.get("/api/gemstone-categories", async (req, res) => {
    try {
      // Try to get from storage first
      try {
        const categories = await storage.getAllGemstoneCategories();
        if (categories && categories.length > 0) {
          return res.json(categories);
        }
      } catch (storageError) {
        console.error("Storage error fetching categories:", storageError);
        // Continue with fallback data if storage fails
      }
      
      // Fallback category data
      const categories = [
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
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching gemstone categories:", error);
      res.status(500).json({ message: "Failed to retrieve gemstone categories" });
    }
  });

  app.get("/api/gemstone-categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Try to get from storage first
      try {
        const category = await storage.getGemstoneCategory(categoryId);
        if (category) {
          return res.json(category);
        }
      } catch (storageError) {
        console.error("Storage error fetching category:", storageError);
        // Continue with fallback data if storage fails
      }
      
      // Fallback category data
      const categories = {
        1: {
          id: 1,
          name: "Diamonds",
          description: "The hardest natural material and the most popular gemstone.",
          imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        2: {
          id: 2,
          name: "Rubies",
          description: "Red variety of corundum, known for their deep red color and durability.",
          imageUrl: "https://images.unsplash.com/photo-1602491676584-c2440094a171?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        3: {
          id: 3,
          name: "Sapphires",
          description: "Blue variety of corundum, highly valued for their color and hardness.",
          imageUrl: "https://images.unsplash.com/photo-1616404595522-4ad1788d2c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        4: {
          id: 4,
          name: "Emeralds",
          description: "Green variety of beryl, highly prized for their rich green color.",
          imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        5: {
          id: 5,
          name: "Pearls",
          description: "Organic gems formed inside mollusks, known for their luster and elegance.",
          imageUrl: "https://images.unsplash.com/photo-1608736007209-7c9309ccaecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
      };
      
      if (categories[categoryId]) {
        return res.json(categories[categoryId]);
      }
      
      res.status(404).send("Category not found");
    } catch (error) {
      console.error("Error fetching gemstone category:", error);
      res.status(500).json({ message: "Failed to retrieve gemstone category" });
    }
  });

  // Gemstone routes
  app.get("/api/gemstones", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;
      const searchQuery = req.query.q as string || "";
      
      // Try to get from storage first
      try {
        let gemstones;
        if (searchQuery || categoryId || supplierId) {
          gemstones = await storage.searchGemstones(searchQuery, categoryId, supplierId, featured);
        } else {
          gemstones = await storage.getAllGemstones(featured);
        }
        
        // If we got gemstones successfully, return them
        if (gemstones && gemstones.length > 0) {
          return res.json(gemstones);
        }
      } catch (storageError) {
        console.error("Storage error fetching gemstones:", storageError);
        // Continue with fallback data if storage fails
      }
      
      // Fallback gemstone data when storage fails
      const gemstones = [
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
      
      // Filter by search query
      let filteredGemstones = gemstones;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredGemstones = filteredGemstones.filter(g => 
          g.name.toLowerCase().includes(query) || 
          g.description.toLowerCase().includes(query) ||
          g.color.toLowerCase().includes(query) ||
          g.origin?.toLowerCase().includes(query)
        );
      }
      
      // Filter by category
      if (categoryId) {
        filteredGemstones = filteredGemstones.filter(g => g.categoryId === categoryId);
      }
      
      // Filter by supplier
      if (supplierId) {
        filteredGemstones = filteredGemstones.filter(g => g.supplierId === supplierId);
      }
      
      // Filter by featured
      if (featured) {
        filteredGemstones = filteredGemstones.filter(g => g.isFeatured);
      }
      
      res.json(filteredGemstones);
    } catch (error) {
      console.error("Error fetching gemstones:", error);
      res.status(500).json({ message: "Failed to retrieve gemstones" });
    }
  });

  app.get("/api/gemstones/:id", async (req, res) => {
    try {
      const gemstone = await storage.getGemstone(parseInt(req.params.id));
      if (!gemstone) return res.status(404).send("Gemstone not found");
      res.json(gemstone);
    } catch (error) {
      console.error("Error fetching gemstone:", error);
      res.status(500).json({ message: "Failed to retrieve gemstone" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      let cart = await storage.getUserCart(userId);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      // Get cart items with gemstone details
      const cartItems = await storage.getCartItems(cart.id);
      const cartItemsWithGemstones = await Promise.all(
        cartItems.map(async (item) => {
          const gemstone = await storage.getGemstone(item.gemstoneId);
          return { ...item, gemstone };
        })
      );
      
      res.json({ ...cart, items: cartItemsWithGemstones });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to retrieve cart" });
    }
  });

  app.post("/api/cart/items", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      let cart = await storage.getUserCart(userId);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const { gemstoneId, quantity } = req.body;
      
      // Validate gemstone exists
      const gemstone = await storage.getGemstone(gemstoneId);
      if (!gemstone) return res.status(404).send("Gemstone not found");
      
      // Check if this item is already in the cart
      const cartItems = await storage.getCartItems(cart.id);
      const existingItem = cartItems.find(item => item.gemstoneId === gemstoneId);
      
      let cartItem;
      if (existingItem) {
        // Update quantity
        cartItem = await storage.updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        cartItem = await storage.addCartItem({
          cartId: cart.id,
          gemstoneId,
          quantity
        });
      }
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Get cart
      const cart = await storage.getUserCart(userId);
      if (!cart) return res.status(404).send("Cart not found");
      
      // Get cart item
      const cartItem = await storage.getCartItem(itemId);
      if (!cartItem) return res.status(404).send("Cart item not found");
      
      // Check if item belongs to user's cart
      if (cartItem.cartId !== cart.id) {
        return res.status(403).send("Forbidden");
      }
      
      // Update quantity
      const updatedItem = await storage.updateCartItem(itemId, quantity);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.id);
      
      // Get cart
      const cart = await storage.getUserCart(userId);
      if (!cart) return res.status(404).send("Cart not found");
      
      // Get cart item
      const cartItem = await storage.getCartItem(itemId);
      if (!cartItem) return res.status(404).send("Cart item not found");
      
      // Check if item belongs to user's cart
      if (cartItem.cartId !== cart.id) {
        return res.status(403).send("Forbidden");
      }
      
      // Remove item
      await storage.removeCartItem(itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const orders = await storage.getUserOrders(userId);
      
      // Get order items with gemstone details
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const itemsWithGemstones = await Promise.all(
            items.map(async (item) => {
              const gemstone = await storage.getGemstone(item.gemstoneId);
              return { ...item, gemstone };
            })
          );
          return { ...order, items: itemsWithGemstones };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      // Check if order belongs to user
      if (order.userId !== userId) {
        return res.status(403).send("Forbidden");
      }
      
      // Get order items with gemstone details
      const items = await storage.getOrderItems(order.id);
      const itemsWithGemstones = await Promise.all(
        items.map(async (item) => {
          const gemstone = await storage.getGemstone(item.gemstoneId);
          return { ...item, gemstone };
        })
      );
      
      res.json({ ...order, items: itemsWithGemstones });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's cart
      const cart = await storage.getUserCart(userId);
      if (!cart) return res.status(400).send("No cart found");
      
      // Get cart items
      const cartItems = await storage.getCartItems(cart.id);
      if (cartItems.length === 0) {
        return res.status(400).send("Cart is empty");
      }
      
      // Calculate total amount and verify gemstone availability
      let totalAmount = 0;
      for (const item of cartItems) {
        const gemstone = await storage.getGemstone(item.gemstoneId);
        if (!gemstone) {
          return res.status(400).send(`Gemstone with ID ${item.gemstoneId} not found`);
        }
        if (!gemstone.isAvailable || gemstone.inventory < item.quantity) {
          return res.status(400).send(`Gemstone ${gemstone.name} is not available in the requested quantity`);
        }
        totalAmount += parseFloat(gemstone.price.toString()) * item.quantity;
      }
      
      // Create order
      const {
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        paymentMethod
      } = req.body;
      
      const order = await storage.createOrder({
        userId,
        status: "pending",
        totalAmount,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        paymentMethod
      });
      
      // Create order items
      for (const item of cartItems) {
        const gemstone = await storage.getGemstone(item.gemstoneId);
        await storage.createOrderItem({
          orderId: order.id,
          gemstoneId: item.gemstoneId,
          quantity: item.quantity,
          price: parseFloat(gemstone!.price.toString())
        });
        
        // Update gemstone inventory
        // await storage.updateGemstone(item.gemstoneId, {
        //   inventory: gemstone!.inventory - item.quantity
        // });
      }
      
      // Clear cart
      await storage.deleteCart(cart.id);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Marketplace Listing Routes
  app.get("/api/marketplace", async (req, res) => {
    try {
      // Since we're just demonstrating this functionality, we'll use mock data
      // In a real implementation, we would query the database
      const listings = [
        {
          id: 1,
          userId: 2,
          title: "Vintage Silver Bracelet Collection",
          description: "Assortment of 5 sterling silver bracelets, perfect for resale. Slight tarnish but excellent condition.",
          price: "350",
          listingType: "jewelry",
          condition: "Used - Excellent",
          isCloseout: true,
          isTradeAvailable: true,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 2,
            username: "silversmith",
            company: "Silver Artistry",
            location: "New York, NY"
          }
        },
        {
          id: 2,
          userId: 3,
          title: "Professional Jeweler's Bench",
          description: "Well-maintained professional jeweler's bench with built-in drawers and attachments for various tools.",
          price: "1200",
          listingType: "equipment",
          condition: "Used - Good",
          isCloseout: false,
          isTradeAvailable: false,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 3,
            username: "toolmaster",
            company: "Jewel Tools Inc",
            location: "Chicago, IL"
          }
        },
        {
          id: 3,
          userId: 4,
          title: "Bulk Gold-Filled Jump Rings",
          description: "Closeout sale on 14k gold-filled jump rings, 4mm and 5mm sizes. Perfect for chainmaille and other jewelry work.",
          price: "85",
          listingType: "supplies",
          condition: "New",
          isCloseout: true,
          isTradeAvailable: false,
          availableQuantity: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 4,
            username: "supplysource",
            company: "Wholesale Findings",
            location: "Miami, FL"
          }
        }
      ];
      
      const { q, type, closeout } = req.query;
      
      // Filter listings based on query parameters
      let filteredListings = listings;
      
      if (q) {
        const searchQuery = (q as string).toLowerCase();
        filteredListings = filteredListings.filter(listing => 
          listing.title.toLowerCase().includes(searchQuery) || 
          listing.description.toLowerCase().includes(searchQuery)
        );
      }
      
      if (type && type !== "all") {
        filteredListings = filteredListings.filter(listing => 
          listing.listingType === type
        );
      }
      
      if (closeout === "true") {
        filteredListings = filteredListings.filter(listing => 
          listing.isCloseout
        );
      }
      
      res.json(filteredListings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });

  app.get("/api/marketplace/my-listings", isAuthenticated, async (req, res) => {
    try {
      // For demonstration purposes, we'll return sample user listings
      // In a real implementation, we would filter listings by the user's ID
      const userListings = [
        {
          id: 4,
          userId: req.user!.id,
          title: "Handmade Jewelry Tool Set",
          description: "Complete set of professional jewelry making tools, barely used. Selling because I'm downsizing my workshop.",
          price: "650",
          listingType: "equipment",
          condition: "Like New",
          isCloseout: false,
          isTradeAvailable: true,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          userId: req.user!.id,
          title: "Sterling Silver Chain Assortment",
          description: "Various styles and lengths of sterling silver chains, approximately 20 feet total. Perfect for jewelry makers.",
          price: "180",
          listingType: "supplies",
          condition: "New",
          isCloseout: true,
          isTradeAvailable: false,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(userListings);
    } catch (error) {
      console.error("Error fetching user's marketplace listings:", error);
      res.status(500).json({ message: "Failed to fetch your marketplace listings" });
    }
  });

  app.get("/api/marketplace/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Sample listings by ID for demonstration purposes
      const listingsById = {
        1: {
          id: 1,
          userId: 2,
          title: "Vintage Silver Bracelet Collection",
          description: "Assortment of 5 sterling silver bracelets, perfect for resale. Slight tarnish but excellent condition.",
          price: "350",
          listingType: "jewelry",
          condition: "Used - Excellent",
          isCloseout: true,
          isTradeAvailable: true,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 2,
            username: "silversmith",
            company: "Silver Artistry",
            location: "New York, NY"
          }
        },
        2: {
          id: 2,
          userId: 3,
          title: "Professional Jeweler's Bench",
          description: "Well-maintained professional jeweler's bench with built-in drawers and attachments for various tools.",
          price: "1200",
          listingType: "equipment",
          condition: "Used - Good",
          isCloseout: false,
          isTradeAvailable: false,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 3,
            username: "toolmaster",
            company: "Jewel Tools Inc",
            location: "Chicago, IL"
          }
        },
        3: {
          id: 3,
          userId: 4,
          title: "Bulk Gold-Filled Jump Rings",
          description: "Closeout sale on 14k gold-filled jump rings, 4mm and 5mm sizes. Perfect for chainmaille and other jewelry work.",
          price: "85",
          listingType: "supplies",
          condition: "New",
          isCloseout: true,
          isTradeAvailable: false,
          availableQuantity: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 4,
            username: "supplysource",
            company: "Wholesale Findings",
            location: "Miami, FL"
          }
        },
        4: {
          id: 4,
          userId: req.user?.id || 4,
          title: "Handmade Jewelry Tool Set",
          description: "Complete set of professional jewelry making tools, barely used. Selling because I'm downsizing my workshop.",
          price: "650",
          listingType: "equipment",
          condition: "Like New",
          isCloseout: false,
          isTradeAvailable: true,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: req.user?.id || 4,
            username: req.user?.username || "admin",
            company: "Your Workshop",
            location: "Your Location"
          }
        },
        5: {
          id: 5,
          userId: req.user?.id || 4,
          title: "Sterling Silver Chain Assortment",
          description: "Various styles and lengths of sterling silver chains, approximately 20 feet total. Perfect for jewelry makers.",
          price: "180",
          listingType: "supplies",
          condition: "New",
          isCloseout: true,
          isTradeAvailable: false,
          availableQuantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: req.user?.id || 4,
            username: req.user?.username || "admin",
            company: "Your Workshop",
            location: "Your Location"
          }
        }
      };
      
      const listing = listingsById[id as keyof typeof listingsById];
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching marketplace listing:", error);
      res.status(500).json({ message: "Failed to fetch marketplace listing" });
    }
  });

  app.post("/api/marketplace", isAuthenticated, async (req, res) => {
    try {
      const listingData = insertMarketplaceListingSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const listing = await storage.createMarketplaceListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      res.status(400).json({ message: "Failed to create marketplace listing" });
    }
  });

  app.patch("/api/marketplace/:id", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getMarketplaceListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only edit your own listings" });
      }
      
      const updatedListing = await storage.updateMarketplaceListing(listingId, req.body);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating marketplace listing:", error);
      res.status(400).json({ message: "Failed to update marketplace listing" });
    }
  });

  app.delete("/api/marketplace/:id", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getMarketplaceListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own listings" });
      }
      
      await storage.deleteMarketplaceListing(listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      res.status(500).json({ message: "Failed to delete marketplace listing" });
    }
  });

  // Group Purchase Routes
  app.get("/api/group-purchases", async (req, res) => {
    try {
      const { status } = req.query;
      
      // Sample group purchase data
      const sampleGroupPurchases = [
        {
          id: 1,
          title: "Bulk Silver Wire Purchase",
          description: "Group purchase for 0.5mm sterling silver wire from European supplier. Looking to reach 10kg minimum order for better pricing.",
          status: "open",
          creatorId: 3,
          targetQuantity: 10000,
          currentQuantity: 3500,
          unitPrice: "0.45",
          discountedUnitPrice: "0.32",
          deadline: new Date(new Date().setDate(new Date().getDate() + 14)),
          vendorName: "European Metals Ltd.",
          vendorContact: "sales@europeanmetals.com",
          productUrl: "https://europeanmetals.com/silver-wire-0.5mm",
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          participantsCount: 4,
          creator: {
            id: 3,
            username: "silverworks",
            company: "Silver Works Studio",
            location: "Milan, Italy"
          }
        },
        {
          id: 2,
          title: "Custom Display Cases",
          description: "Group order for custom jewelry display cases with glass tops and felt bottoms. 50 unit minimum order required by manufacturer.",
          status: "in_progress",
          creatorId: 2,
          targetQuantity: 50,
          currentQuantity: 32,
          unitPrice: "45.00",
          discountedUnitPrice: "36.00",
          deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
          vendorName: "ShowCase Designs",
          vendorContact: "orders@showcasedesigns.com",
          productUrl: "https://showcasedesigns.com/custom-jewelry-case",
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          participantsCount: 6,
          creator: {
            id: 2,
            username: "displaypro",
            company: "Display Pro",
            location: "New York, NY"
          }
        },
        {
          id: 3,
          title: "Packaging Supplies Bulk Order",
          description: "Coordinating a large order of gift boxes, tissue paper, and ribbon for the holiday season. Join to receive significant discounts.",
          status: "completed",
          creatorId: 4,
          targetQuantity: 2000,
          currentQuantity: 2500,
          unitPrice: "2.25",
          discountedUnitPrice: "1.15",
          deadline: new Date(new Date().setDate(new Date().getDate() - 30)),
          vendorName: "Packaging Plus",
          vendorContact: "wholesale@packagingplus.com",
          productUrl: "https://packagingplus.com/holiday-sets",
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          participantsCount: 15,
          creator: {
            id: 4,
            username: "admin",
            company: "Jewel Connect",
            location: "Los Angeles, CA"
          }
        }
      ];
      
      // Filter group purchases by status if provided
      let filteredPurchases = sampleGroupPurchases;
      if (status && status !== 'all') {
        filteredPurchases = sampleGroupPurchases.filter(purchase => purchase.status === status);
      }
      
      res.json(filteredPurchases);
    } catch (error) {
      console.error("Error fetching group purchases:", error);
      res.status(500).json({ message: "Failed to fetch group purchases" });
    }
  });

  app.get("/api/group-purchases/created", isAuthenticated, async (req, res) => {
    try {
      const purchases = await storage.getUserCreatedGroupPurchases(req.user!.id);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user's created group purchases:", error);
      res.status(500).json({ message: "Failed to fetch your created group purchases" });
    }
  });

  app.get("/api/group-purchases/participating", isAuthenticated, async (req, res) => {
    try {
      const purchases = await storage.getUserParticipatingGroupPurchases(req.user!.id);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user's participating group purchases:", error);
      res.status(500).json({ message: "Failed to fetch your participating group purchases" });
    }
  });

  app.get("/api/group-purchases/:id", async (req, res) => {
    try {
      const groupPurchase = await storage.getGroupPurchase(parseInt(req.params.id));
      if (!groupPurchase) return res.status(404).json({ message: "Group purchase not found" });
      
      // Add creator info
      const creator = await storage.getUser(groupPurchase.creatorId);
      const enhancedPurchase = {
        ...groupPurchase,
        creator: creator ? {
          id: creator.id,
          username: creator.username,
          company: creator.company
        } : undefined
      };
      
      res.json(enhancedPurchase);
    } catch (error) {
      console.error("Error fetching group purchase:", error);
      res.status(500).json({ message: "Failed to fetch group purchase" });
    }
  });

  app.get("/api/group-purchases/:id/participants", async (req, res) => {
    try {
      const participants = await storage.getGroupPurchaseParticipants(parseInt(req.params.id));
      
      // Enhance with user info
      const enhancedParticipants = await Promise.all(participants.map(async (participant) => {
        try {
          const user = await storage.getUser(participant.userId);
          return {
            ...participant,
            user: user ? {
              id: user.id,
              username: user.username,
              company: user.company
            } : undefined
          };
        } catch (error) {
          return participant;
        }
      }));
      
      res.json(enhancedParticipants);
    } catch (error) {
      console.error("Error fetching group purchase participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.post("/api/group-purchases", isAuthenticated, async (req, res) => {
    try {
      const purchaseData = insertGroupPurchaseSchema.parse({
        ...req.body,
        creatorId: req.user!.id
      });
      
      const groupPurchase = await storage.createGroupPurchase(purchaseData);
      
      // Add creator as first participant automatically
      await storage.addGroupPurchaseParticipant({
        groupPurchaseId: groupPurchase.id,
        userId: req.user!.id,
        quantity: 1,
        status: "committed"
      });
      
      res.status(201).json(groupPurchase);
    } catch (error) {
      console.error("Error creating group purchase:", error);
      res.status(400).json({ message: "Failed to create group purchase" });
    }
  });

  app.post("/api/group-purchases/:id/join", isAuthenticated, async (req, res) => {
    try {
      const groupPurchaseId = parseInt(req.params.id);
      const groupPurchase = await storage.getGroupPurchase(groupPurchaseId);
      
      if (!groupPurchase) {
        return res.status(404).json({ message: "Group purchase not found" });
      }
      
      if (groupPurchase.status !== "open") {
        return res.status(400).json({ message: "This group purchase is no longer open for joining" });
      }
      
      // Check if user is already a participant
      const existingParticipation = await storage.getUserGroupPurchaseParticipation(
        req.user!.id, 
        groupPurchaseId
      );
      
      if (existingParticipation) {
        return res.status(400).json({ message: "You are already participating in this group purchase" });
      }
      
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const participant = await storage.addGroupPurchaseParticipant({
        groupPurchaseId,
        userId: req.user!.id,
        quantity,
        status: "committed"
      });
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error joining group purchase:", error);
      res.status(500).json({ message: "Failed to join group purchase" });
    }
  });

  app.patch("/api/group-purchases/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const groupPurchaseId = parseInt(req.params.id);
      const groupPurchase = await storage.getGroupPurchase(groupPurchaseId);
      
      if (!groupPurchase) {
        return res.status(404).json({ message: "Group purchase not found" });
      }
      
      if (groupPurchase.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "Only the creator can cancel a group purchase" });
      }
      
      const updatedGroupPurchase = await storage.updateGroupPurchaseStatus(groupPurchaseId, "cancelled");
      res.json(updatedGroupPurchase);
    } catch (error) {
      console.error("Error cancelling group purchase:", error);
      res.status(500).json({ message: "Failed to cancel group purchase" });
    }
  });
  
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections with user IDs
  const activeConnections = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    let userId = 0;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          if (data.userId && typeof data.userId === 'number') {
            userId = data.userId;
            activeConnections.set(userId, ws);
            console.log(`User ${userId} authenticated on WebSocket`);
          }
        }
        
        // Handle chat messages
        if (data.type === 'message' && userId) {
          // Save the message to the database
          try {
            const messageData = {
              senderId: userId,
              recipientId: data.recipientId,
              content: data.content
            };
            
            // Check if users are connected before allowing messages
            const connection = await storage.getConnectionByUsers(
              messageData.senderId,
              messageData.recipientId
            );
            
            if (!connection || connection.status !== "accepted") {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'You are not connected with this user'
              }));
              return;
            }
            
            const newMessage = await storage.createMessage(messageData);
            
            // Send message to recipient if they're online
            const recipientWs = activeConnections.get(data.recipientId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'message',
                message: newMessage
              }));
            }
            
            // Send confirmation to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: newMessage
            }));
          } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to send message'
            }));
          }
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        activeConnections.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  return httpServer;
}

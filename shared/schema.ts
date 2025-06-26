import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User account type enum
export const userTypeEnum = pgEnum('user_type', [
  'designer',
  'gemstone_dealer',
  'casting',
  'bench_jeweler',
  'packaging', 
  'displays',
  'photographer', 
  'store_design',
  'marketing',
  'education',
  'consulting',
  'developer',
  'other'
]);

// User profile table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  secondaryType: userTypeEnum("secondary_type"),
  company: text("company"),
  location: text("location"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  logoImage: text("logo_image"),
  
  // Contact information
  website: text("website"),
  phone: text("phone"),
  headquarters: text("headquarters"),
  showroom1: text("showroom1"),
  showroom2: text("showroom2"),
  
  // Social media
  instagram: text("instagram"),
  facebook: text("facebook"),
  pinterest: text("pinterest"),
  
  isPremium: boolean("is_premium").default(false),
  // isAdmin field is commented out as it's causing DB issues
  // We're using a hardcoded username list instead
  // isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  userType: true,
  secondaryType: true,
  company: true,
  location: true,
  bio: true,
  profileImage: true,
  coverImage: true,
  logoImage: true,
  website: true,
  phone: true,
  headquarters: true,
  showroom1: true,
  showroom2: true,
  instagram: true,
  facebook: true,
  pinterest: true
});

// Connections between users
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  status: text("status").notNull(), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  requesterId: true,
  recipientId: true,
  status: true,
});

// Messages between connected users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  content: true,
});

// Industry events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  creatorId: true,
  title: true,
  description: true,
  location: true,
  date: true,
  time: true,
  imageUrl: true,
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).pick({
  eventId: true,
  userId: true,
  isPublic: true,
});

// Inventory items for jewelers
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  userId: true,
  title: true,
  description: true,
  imageUrl: true,
  isNew: true,
  isFeatured: true,
});

// Gemstone suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
  description: text("description").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  logo: true,
  website: true,
  description: true,
  location: true,
});

// Gemstone categories: diamonds, rubies, emeralds, sapphires, etc.
export const gemstoneCategories = pgTable("gemstone_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const insertGemstoneCategorySchema = createInsertSchema(gemstoneCategories).pick({
  name: true,
  description: true,
  imageUrl: true,
});

// Gemstones for sale
export const gemstones = pgTable("gemstones", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  caratWeight: numeric("carat_weight").notNull(),
  color: text("color").notNull(),
  clarity: text("clarity"),
  cut: text("cut"),
  shape: text("shape"),
  origin: text("origin"),
  certification: text("certification"),
  imageUrl: text("image_url").notNull(),
  inventory: integer("inventory").notNull().default(1),
  isAvailable: boolean("is_available").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGemstoneSchema = createInsertSchema(gemstones).pick({
  supplierId: true,
  categoryId: true,
  name: true,
  description: true,
  price: true,
  caratWeight: true,
  color: true,
  clarity: true,
  cut: true,
  shape: true,
  origin: true,
  certification: true,
  imageUrl: true,
  inventory: true,
  isAvailable: true,
  isFeatured: true,
});

// Shopping cart
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartSchema = createInsertSchema(carts).pick({
  userId: true,
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  gemstoneId: integer("gemstone_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  gemstoneId: true,
  quantity: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: numeric("total_amount").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingCountry: text("shipping_country").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  shippingAddress: true,
  shippingCity: true,
  shippingState: true,
  shippingZip: true,
  shippingCountry: true,
  paymentMethod: true,
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  gemstoneId: integer("gemstone_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  gemstoneId: true,
  quantity: true,
  price: true,
});

// Jewelry marketplace items 
export const marketplaceListingTypeEnum = pgEnum('marketplace_listing_type', [
  'finished_jewelry',
  'jewelry_parts',
  'chains',
  'equipment',
  'supplies',
  'other'
]);

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  listingType: marketplaceListingTypeEnum("listing_type").notNull(),
  condition: text("condition").notNull(), // new, like-new, used, refurbished
  imageUrl: text("image_url"),
  isCloseout: boolean("is_closeout").default(false),
  isTradeAvailable: boolean("is_trade_available").default(false),
  availableQuantity: integer("available_quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).pick({
  userId: true,
  title: true,
  description: true,
  price: true,
  listingType: true,
  condition: true,
  imageUrl: true,
  isCloseout: true,
  isTradeAvailable: true,
  availableQuantity: true,
});

// Group purchases
export const groupPurchases = pgTable("group_purchases", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  productUrl: text("product_url"),
  imageUrl: text("image_url"),
  targetQuantity: integer("target_quantity").notNull(),
  currentQuantity: integer("current_quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  discountedUnitPrice: numeric("discounted_unit_price"),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("open"), // open, fulfilled, expired, cancelled
  vendorName: text("vendor_name").notNull(),
  vendorContact: text("vendor_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGroupPurchaseSchema = createInsertSchema(groupPurchases).pick({
  creatorId: true,
  title: true,
  description: true,
  productUrl: true,
  imageUrl: true,
  targetQuantity: true,
  unitPrice: true,
  discountedUnitPrice: true,
  deadline: true,
  vendorName: true,
  vendorContact: true,
});

// Group purchase participants
export const groupPurchaseParticipants = pgTable("group_purchase_participants", {
  id: serial("id").primaryKey(),
  groupPurchaseId: integer("group_purchase_id").notNull(),
  userId: integer("user_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("committed"), // interested, committed, paid
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGroupPurchaseParticipantSchema = createInsertSchema(groupPurchaseParticipants).pick({
  groupPurchaseId: true,
  userId: true,
  quantity: true,
  status: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type GemstoneCategory = typeof gemstoneCategories.$inferSelect;
export type InsertGemstoneCategory = z.infer<typeof insertGemstoneCategorySchema>;

export type Gemstone = typeof gemstones.$inferSelect;
export type InsertGemstone = z.infer<typeof insertGemstoneSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;

export type GroupPurchase = typeof groupPurchases.$inferSelect;
export type InsertGroupPurchase = z.infer<typeof insertGroupPurchaseSchema>;

export type GroupPurchaseParticipant = typeof groupPurchaseParticipants.$inferSelect; 
export type InsertGroupPurchaseParticipant = z.infer<typeof insertGroupPurchaseParticipantSchema>;

// Profile photos table for user galleries
export const profilePhotos = pgTable("profile_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfilePhotoSchema = createInsertSchema(profilePhotos).pick({
  userId: true,
  photoUrl: true,
  caption: true,
  displayOrder: true,
});

export type ProfilePhoto = typeof profilePhotos.$inferSelect;
export type InsertProfilePhoto = z.infer<typeof insertProfilePhotoSchema>;

// Articles table for imported content
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  description: text("description"),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  importedBy: integer("imported_by").notNull(),
  importedAt: timestamp("imported_at").defaultNow(),
  isPublished: boolean("is_published").default(true),
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  author: true,
  description: true,
  content: true,
  sourceUrl: true,
  importedBy: true,
  isPublished: true,
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Developer permissions enum
export const developerRoleEnum = pgEnum('developer_role', [
  'frontend',
  'backend', 
  'fullstack',
  'mobile',
  'devops',
  'ui_ux',
  'qa_tester',
  'project_manager',
  'tech_lead'
]);

// Developer access level enum
export const accessLevelEnum = pgEnum('access_level', [
  'read_only',
  'contributor', 
  'maintainer',
  'admin'
]);

// Developers table
export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  githubUsername: text("github_username"),
  role: developerRoleEnum("role").notNull(),
  accessLevel: accessLevelEnum("access_level").default('contributor'),
  skills: text("skills").array(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  availability: text("availability"),
  timezone: text("timezone"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  yearsExperience: integer("years_experience"),
  isActive: boolean("is_active").default(true),
  addedBy: integer("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

export const insertDeveloperSchema = createInsertSchema(developers).pick({
  userId: true,
  githubUsername: true,
  role: true,
  accessLevel: true,
  skills: true,
  hourlyRate: true,
  availability: true,
  timezone: true,
  portfolioUrl: true,
  linkedinUrl: true,
  yearsExperience: true,
  isActive: true,
  addedBy: true,
});

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;

// Project assignments table
export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull(),
  projectName: text("project_name").notNull(),
  description: text("description"),
  status: text("status").default('active'), // active, completed, paused, cancelled
  priority: text("priority").default('medium'), // low, medium, high, urgent
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  startDate: timestamp("start_date").defaultNow(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  assignedBy: integer("assigned_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).pick({
  developerId: true,
  projectName: true,
  description: true,
  status: true,
  priority: true,
  estimatedHours: true,
  dueDate: true,
  assignedBy: true,
});

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;

// Helper function to check if a user is an admin
export function isAdminUser(username: string): boolean {
  const adminUsernames = ['admin', 'admin1', 'admin2', 'carmelar', 'tobepacking'];
  return adminUsernames.includes(username);
}

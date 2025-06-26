import { 
  users, connections, messages, events, eventRsvps, inventoryItems,
  suppliers, gemstoneCategories, gemstones, carts, cartItems, orders, orderItems,
  marketplaceListings, groupPurchases, groupPurchaseParticipants, profilePhotos, articles,
  developers, projectAssignments
} from "@shared/schema";
import type { 
  User, InsertUser, 
  Connection, InsertConnection,
  Message, InsertMessage,
  Event, InsertEvent,
  EventRsvp, InsertEventRsvp,
  InventoryItem, InsertInventoryItem,
  Supplier, InsertSupplier,
  GemstoneCategory, InsertGemstoneCategory,
  Gemstone, InsertGemstone,
  Cart, InsertCart,
  CartItem, InsertCartItem,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  MarketplaceListing, InsertMarketplaceListing,
  GroupPurchase, InsertGroupPurchase,
  GroupPurchaseParticipant, InsertGroupPurchaseParticipant,
  ProfilePhoto, InsertProfilePhoto,
  Article, InsertArticle,
  Developer, InsertDeveloper,
  ProjectAssignment, InsertProjectAssignment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, and, or, desc, asc, like, ilike, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface with all CRUD operations needed
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  searchUsers(query: string, userType?: string, location?: string): Promise<User[]>;
  
  // Profile Photo operations
  getProfilePhoto(id: number): Promise<ProfilePhoto | undefined>;
  getProfilePhotosByUser(userId: number): Promise<ProfilePhoto[]>;
  createProfilePhoto(photo: InsertProfilePhoto): Promise<ProfilePhoto>;
  updateProfilePhoto(id: number, data: Partial<ProfilePhoto>): Promise<ProfilePhoto | undefined>;
  deleteProfilePhoto(id: number): Promise<void>;

  // Article operations
  getArticle(id: number): Promise<Article | undefined>;
  getAllArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  
  // Connection operations
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionByUsers(requesterId: number, recipientId: number): Promise<Connection | undefined>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, status: string): Promise<Connection | undefined>;
  getUserConnections(userId: number, status?: string): Promise<Connection[]>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<void>;
  getAllEvents(): Promise<Event[]>;
  getUserEvents(userId: number): Promise<Event[]>;
  
  // Event RSVP operations
  createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  getRsvpsByEvent(eventId: number): Promise<EventRsvp[]>;
  getRsvpsByUser(userId: number): Promise<EventRsvp[]>;
  getRsvp(eventId: number, userId: number): Promise<EventRsvp | undefined>;
  updateRsvp(id: number, data: Partial<EventRsvp>): Promise<EventRsvp | undefined>;
  
  // Inventory operations
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getUserInventory(userId: number): Promise<InventoryItem[]>;
  getAllInventory(featured?: boolean): Promise<InventoryItem[]>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<void>;

  // Gemstone Category operations
  getGemstoneCategory(id: number): Promise<GemstoneCategory | undefined>;
  getAllGemstoneCategories(): Promise<GemstoneCategory[]>;
  createGemstoneCategory(category: InsertGemstoneCategory): Promise<GemstoneCategory>;
  updateGemstoneCategory(id: number, data: Partial<GemstoneCategory>): Promise<GemstoneCategory | undefined>;
  deleteGemstoneCategory(id: number): Promise<void>;

  // Gemstone operations
  getGemstone(id: number): Promise<Gemstone | undefined>;
  getGemstonesBySupplier(supplierId: number): Promise<Gemstone[]>;
  getGemstonesByCategory(categoryId: number): Promise<Gemstone[]>;
  getAllGemstones(featured?: boolean): Promise<Gemstone[]>;
  searchGemstones(query: string, categoryId?: number, supplierId?: number, featured?: boolean): Promise<Gemstone[]>;
  createGemstone(gemstone: InsertGemstone): Promise<Gemstone>;
  updateGemstone(id: number, data: Partial<Gemstone>): Promise<Gemstone | undefined>;
  deleteGemstone(id: number): Promise<void>;

  // Cart operations
  getCart(id: number): Promise<Cart | undefined>;
  getUserCart(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  deleteCart(id: number): Promise<void>;

  // Cart Item operations
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item operations
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Marketplace Listing operations
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  getAllMarketplaceListings(listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]>;
  getUserMarketplaceListings(userId: number): Promise<MarketplaceListing[]>;
  searchMarketplaceListings(query: string, listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: number, data: Partial<MarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: number): Promise<void>;

  // Group Purchase operations
  getGroupPurchase(id: number): Promise<GroupPurchase | undefined>;
  getAllGroupPurchases(status?: string): Promise<GroupPurchase[]>;
  getUserCreatedGroupPurchases(userId: number): Promise<GroupPurchase[]>;
  getUserParticipatingGroupPurchases(userId: number): Promise<GroupPurchase[]>;
  createGroupPurchase(groupPurchase: InsertGroupPurchase): Promise<GroupPurchase>;
  updateGroupPurchase(id: number, data: Partial<GroupPurchase>): Promise<GroupPurchase | undefined>;
  updateGroupPurchaseStatus(id: number, status: string): Promise<GroupPurchase | undefined>;
  deleteGroupPurchase(id: number): Promise<void>;

  // Group Purchase Participant operations
  getGroupPurchaseParticipant(id: number): Promise<GroupPurchaseParticipant | undefined>;
  getGroupPurchaseParticipants(groupPurchaseId: number): Promise<GroupPurchaseParticipant[]>;
  getUserGroupPurchaseParticipation(userId: number, groupPurchaseId: number): Promise<GroupPurchaseParticipant | undefined>;
  addGroupPurchaseParticipant(participant: InsertGroupPurchaseParticipant): Promise<GroupPurchaseParticipant>;
  updateGroupPurchaseParticipant(id: number, data: Partial<GroupPurchaseParticipant>): Promise<GroupPurchaseParticipant | undefined>;
  removeGroupPurchaseParticipant(id: number): Promise<void>;

  // Marketplace Listing operations
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  getAllMarketplaceListings(listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]>;
  getUserMarketplaceListings(userId: number): Promise<MarketplaceListing[]>;
  searchMarketplaceListings(query: string, listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: number, data: Partial<MarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: number): Promise<void>;

  // Group Purchase operations
  getGroupPurchase(id: number): Promise<GroupPurchase | undefined>;
  getAllGroupPurchases(status?: string): Promise<GroupPurchase[]>;
  getUserCreatedGroupPurchases(userId: number): Promise<GroupPurchase[]>;
  getUserParticipatingGroupPurchases(userId: number): Promise<GroupPurchase[]>;
  createGroupPurchase(groupPurchase: InsertGroupPurchase): Promise<GroupPurchase>;
  updateGroupPurchase(id: number, data: Partial<GroupPurchase>): Promise<GroupPurchase | undefined>;
  updateGroupPurchaseStatus(id: number, status: string): Promise<GroupPurchase | undefined>;
  deleteGroupPurchase(id: number): Promise<void>;

  // Group Purchase Participant operations
  getGroupPurchaseParticipant(id: number): Promise<GroupPurchaseParticipant | undefined>;
  getGroupPurchaseParticipants(groupPurchaseId: number): Promise<GroupPurchaseParticipant[]>;
  getUserGroupPurchaseParticipation(userId: number, groupPurchaseId: number): Promise<GroupPurchaseParticipant | undefined>;
  addGroupPurchaseParticipant(participant: InsertGroupPurchaseParticipant): Promise<GroupPurchaseParticipant>;
  updateGroupPurchaseParticipant(id: number, data: Partial<GroupPurchaseParticipant>): Promise<GroupPurchaseParticipant | undefined>;
  removeGroupPurchaseParticipant(id: number): Promise<void>;

  // Developer operations
  getDeveloper(id: number): Promise<Developer | undefined>;
  getAllDevelopers(): Promise<Developer[]>;
  getDevelopersByRole(role: string): Promise<Developer[]>;
  getDeveloperByUserId(userId: number): Promise<Developer | undefined>;
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
  updateDeveloper(id: number, data: Partial<Developer>): Promise<Developer | undefined>;
  deleteDeveloper(id: number): Promise<void>;

  // Project Assignment operations  
  getProjectAssignment(id: number): Promise<ProjectAssignment | undefined>;
  getAllProjectAssignments(): Promise<ProjectAssignment[]>;
  getDeveloperProjectAssignments(developerId: number): Promise<ProjectAssignment[]>;
  createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  updateProjectAssignment(id: number, data: Partial<ProjectAssignment>): Promise<ProjectAssignment | undefined>;
  deleteProjectAssignment(id: number): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private connections: Map<number, Connection>;
  private messages: Map<number, Message>;
  private events: Map<number, Event>;
  private eventRsvps: Map<number, EventRsvp>;
  private inventoryItems: Map<number, InventoryItem>;
  private suppliers: Map<number, Supplier>;
  private gemstoneCategories: Map<number, GemstoneCategory>;
  private gemstones: Map<number, Gemstone>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private marketplaceListings: Map<number, MarketplaceListing>;
  private groupPurchases: Map<number, GroupPurchase>;
  private groupPurchaseParticipants: Map<number, GroupPurchaseParticipant>;
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private connectionIdCounter: number;
  private messageIdCounter: number;
  private eventIdCounter: number;
  private rsvpIdCounter: number;
  private inventoryIdCounter: number;
  private supplierIdCounter: number;
  private categoryIdCounter: number;
  private gemstoneIdCounter: number;
  private cartIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private marketplaceListingIdCounter: number;
  private groupPurchaseIdCounter: number;
  private groupPurchaseParticipantIdCounter: number;

  constructor() {
    this.users = new Map();
    this.connections = new Map();
    this.messages = new Map();
    this.events = new Map();
    this.eventRsvps = new Map();
    this.inventoryItems = new Map();
    this.suppliers = new Map();
    this.gemstoneCategories = new Map();
    this.gemstones = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.marketplaceListings = new Map();
    this.groupPurchases = new Map();
    this.groupPurchaseParticipants = new Map();
    
    this.userIdCounter = 1;
    this.connectionIdCounter = 1;
    this.messageIdCounter = 1;
    this.eventIdCounter = 1;
    this.rsvpIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.supplierIdCounter = 1;
    this.categoryIdCounter = 1;
    this.gemstoneIdCounter = 1;
    this.cartIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.marketplaceListingIdCounter = 1;
    this.groupPurchaseIdCounter = 1;
    this.groupPurchaseParticipantIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    // We're using a hardcoded admin list instead of isAdmin field
    const user: User = { 
      ...insertUser, 
      id,
      isPremium: false,
      profileImage: "",
      coverImage: "",
      logoImage: "",
      location: insertUser.location || null,
      secondaryType: insertUser.secondaryType || null,
      bio: insertUser.bio || null,
      company: insertUser.company || null,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    
    // Also delete related data like connections, messages, etc.
    // Remove connections where this user is requester or recipient
    const connectionsToDelete: number[] = [];
    this.connections.forEach((conn, connId) => {
      if (conn.requesterId === id || conn.recipientId === id) {
        connectionsToDelete.push(connId);
      }
    });
    connectionsToDelete.forEach(connId => this.connections.delete(connId));
    
    // Remove messages sent by or to this user
    const messagesToDelete: number[] = [];
    this.messages.forEach((msg, msgId) => {
      if (msg.senderId === id || msg.recipientId === id) {
        messagesToDelete.push(msgId);
      }
    });
    messagesToDelete.forEach(msgId => this.messages.delete(msgId));
    
    // Remove events created by this user
    const eventsToDelete: number[] = [];
    this.events.forEach((event, eventId) => {
      if (event.creatorId === id) {
        eventsToDelete.push(eventId);
      }
    });
    eventsToDelete.forEach(eventId => this.events.delete(eventId));
    
    // Remove RSVPs by this user
    const rsvpsToDelete: number[] = [];
    this.eventRsvps.forEach((rsvp, rsvpId) => {
      if (rsvp.userId === id) {
        rsvpsToDelete.push(rsvpId);
      }
    });
    rsvpsToDelete.forEach(rsvpId => this.eventRsvps.delete(rsvpId));
    
    // Remove inventory items by this user
    const itemsToDelete: number[] = [];
    this.inventoryItems.forEach((item, itemId) => {
      if (item.userId === id) {
        itemsToDelete.push(itemId);
      }
    });
    itemsToDelete.forEach(itemId => this.inventoryItems.delete(itemId));
  }

  async searchUsers(query: string, userType?: string, location?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    // Filter based on search query if provided
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      users = users.filter(user => 
        user.fullName.toLowerCase().includes(lowercaseQuery) ||
        user.username.toLowerCase().includes(lowercaseQuery) ||
        (user.company && user.company.toLowerCase().includes(lowercaseQuery)) ||
        (user.bio && user.bio.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply user type filter including secondary_type
    if (userType && userType !== "all") {
      const lowercaseUserType = userType.toLowerCase();
      users = users.filter(user => 
        (user.userType && user.userType.toLowerCase() === lowercaseUserType) || // Match primary type
        (user.secondaryType && user.secondaryType.toLowerCase() === lowercaseUserType) // Match secondary type
      );
    } else {
      // If no userType filter or "all", include everything
    }
    
    if (location) {
      users = users.filter(user => 
        user.location && user.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    return users;
  }

  // Connection methods
  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async getConnectionByUsers(requesterId: number, recipientId: number): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(
      (conn) => 
        (conn.requesterId === requesterId && conn.recipientId === recipientId) ||
        (conn.requesterId === recipientId && conn.recipientId === requesterId)
    );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = this.connectionIdCounter++;
    const now = new Date();
    const connection: Connection = { ...insertConnection, id, createdAt: now };
    this.connections.set(id, connection);
    return connection;
  }

  async updateConnection(id: number, status: string): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, status };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  async getUserConnections(userId: number, status?: string): Promise<Connection[]> {
    let connections = Array.from(this.connections.values()).filter(
      (conn) => conn.requesterId === userId || conn.recipientId === userId
    );
    
    if (status) {
      connections = connections.filter(conn => conn.status === status);
    }
    
    return connections;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, isRead: false, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.senderId === userId || msg.recipientId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => 
        (msg.senderId === user1Id && msg.recipientId === user2Id) ||
        (msg.senderId === user2Id && msg.recipientId === user1Id)
    ).sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return aTime - bTime;
    });
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: now,
      imageUrl: insertEvent.imageUrl || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, data: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...data };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    this.events.delete(id);
    
    // Also delete related RSVPs
    const rsvpsToDelete: number[] = [];
    this.eventRsvps.forEach((rsvp, rsvpId) => {
      if (rsvp.eventId === id) {
        rsvpsToDelete.push(rsvpId);
      }
    });
    rsvpsToDelete.forEach(rsvpId => this.eventRsvps.delete(rsvpId));
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.creatorId === userId
    );
  }

  // Event RSVP methods
  async createRsvp(insertRsvp: InsertEventRsvp): Promise<EventRsvp> {
    const id = this.rsvpIdCounter++;
    const now = new Date();
    const rsvp: EventRsvp = { 
      ...insertRsvp, 
      id, 
      createdAt: now,
      isPublic: insertRsvp.isPublic ?? true
    };
    this.eventRsvps.set(id, rsvp);
    return rsvp;
  }

  async getRsvpsByEvent(eventId: number): Promise<EventRsvp[]> {
    return Array.from(this.eventRsvps.values()).filter(
      (rsvp) => rsvp.eventId === eventId
    );
  }

  async getRsvpsByUser(userId: number): Promise<EventRsvp[]> {
    return Array.from(this.eventRsvps.values()).filter(
      (rsvp) => rsvp.userId === userId
    );
  }

  async getRsvp(eventId: number, userId: number): Promise<EventRsvp | undefined> {
    return Array.from(this.eventRsvps.values()).find(
      (rsvp) => rsvp.eventId === eventId && rsvp.userId === userId
    );
  }
  
  async updateRsvp(id: number, data: Partial<EventRsvp>): Promise<EventRsvp | undefined> {
    const rsvp = this.eventRsvps.get(id);
    if (!rsvp) return undefined;
    
    const updatedRsvp = { ...rsvp, ...data };
    this.eventRsvps.set(id, updatedRsvp);
    return updatedRsvp;
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryIdCounter++;
    const now = new Date();
    const item: InventoryItem = { 
      ...insertItem, 
      id, 
      createdAt: now,
      imageUrl: insertItem.imageUrl || null,
      isNew: insertItem.isNew ?? null,
      isFeatured: insertItem.isFeatured ?? null
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async getUserInventory(userId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getAllInventory(featured?: boolean): Promise<InventoryItem[]> {
    let items = Array.from(this.inventoryItems.values());
    
    if (featured) {
      items = items.filter(item => item.isFeatured);
    }
    
    return items;
  }
  
  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const now = new Date();
    const supplier: Supplier = { ...insertSupplier, id, createdAt: now };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...data };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    this.suppliers.delete(id);
  }

  // Gemstone Category methods
  async getGemstoneCategory(id: number): Promise<GemstoneCategory | undefined> {
    return this.gemstoneCategories.get(id);
  }

  async getAllGemstoneCategories(): Promise<GemstoneCategory[]> {
    return Array.from(this.gemstoneCategories.values());
  }

  async createGemstoneCategory(insertCategory: InsertGemstoneCategory): Promise<GemstoneCategory> {
    const id = this.categoryIdCounter++;
    const category: GemstoneCategory = { ...insertCategory, id };
    this.gemstoneCategories.set(id, category);
    return category;
  }

  async updateGemstoneCategory(id: number, data: Partial<GemstoneCategory>): Promise<GemstoneCategory | undefined> {
    const category = this.gemstoneCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...data };
    this.gemstoneCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteGemstoneCategory(id: number): Promise<void> {
    this.gemstoneCategories.delete(id);
  }

  // Gemstone methods
  async getGemstone(id: number): Promise<Gemstone | undefined> {
    return this.gemstones.get(id);
  }

  async getGemstonesBySupplier(supplierId: number): Promise<Gemstone[]> {
    return Array.from(this.gemstones.values()).filter(
      gemstone => gemstone.supplierId === supplierId
    );
  }

  async getGemstonesByCategory(categoryId: number): Promise<Gemstone[]> {
    return Array.from(this.gemstones.values()).filter(
      gemstone => gemstone.categoryId === categoryId
    );
  }

  async getAllGemstones(featured?: boolean): Promise<Gemstone[]> {
    const allGemstones = Array.from(this.gemstones.values());
    if (featured) {
      return allGemstones.filter(gemstone => gemstone.isFeatured);
    }
    return allGemstones;
  }

  async searchGemstones(query: string, categoryId?: number, supplierId?: number, featured: boolean = false): Promise<Gemstone[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.gemstones.values()).filter(gemstone => {
      const matchesQuery = 
        gemstone.name.toLowerCase().includes(lowercaseQuery) ||
        gemstone.description.toLowerCase().includes(lowercaseQuery) ||
        gemstone.color.toLowerCase().includes(lowercaseQuery) ||
        (gemstone.origin && gemstone.origin.toLowerCase().includes(lowercaseQuery));
        
      const matchesCategory = categoryId ? gemstone.categoryId === categoryId : true;
      const matchesSupplier = supplierId ? gemstone.supplierId === supplierId : true;
      const matchesFeatured = featured ? gemstone.isFeatured === true : true;
      
      return matchesQuery && matchesCategory && matchesSupplier && matchesFeatured;
    });
  }

  async createGemstone(insertGemstone: InsertGemstone): Promise<Gemstone> {
    const id = this.gemstoneIdCounter++;
    const now = new Date();
    const gemstone: Gemstone = { ...insertGemstone, id, createdAt: now };
    this.gemstones.set(id, gemstone);
    return gemstone;
  }

  async updateGemstone(id: number, data: Partial<Gemstone>): Promise<Gemstone | undefined> {
    const gemstone = this.gemstones.get(id);
    if (!gemstone) return undefined;
    
    const updatedGemstone = { ...gemstone, ...data };
    this.gemstones.set(id, updatedGemstone);
    return updatedGemstone;
  }

  async deleteGemstone(id: number): Promise<void> {
    this.gemstones.delete(id);
  }
  
  // Cart methods
  async getCart(id: number): Promise<Cart | undefined> {
    return this.carts.get(id);
  }

  async getUserCart(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      cart => cart.userId === userId
    );
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.cartIdCounter++;
    const now = new Date();
    const cart: Cart = { 
      ...insertCart, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.carts.set(id, cart);
    return cart;
  }

  async deleteCart(id: number): Promise<void> {
    this.carts.delete(id);
    
    // Delete all cart items
    const cartItemsToDelete: number[] = [];
    this.cartItems.forEach((item, itemId) => {
      if (item.cartId === id) {
        cartItemsToDelete.push(itemId);
      }
    });
    cartItemsToDelete.forEach(itemId => this.cartItems.delete(itemId));
  }

  // Cart Item methods
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.cartId === cartId
    );
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const cartItem: CartItem = { ...insertCartItem, id, createdAt: now };
    this.cartItems.set(id, cartItem);
    
    // Update the cart's updatedAt timestamp
    const cart = this.carts.get(insertCartItem.cartId);
    if (cart) {
      cart.updatedAt = now;
      this.carts.set(cart.id, cart);
    }
    
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    
    // Update the cart's updatedAt timestamp
    const cart = this.carts.get(cartItem.cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<void> {
    const cartItem = this.cartItems.get(id);
    if (cartItem) {
      // Update the cart's updatedAt timestamp
      const cart = this.carts.get(cartItem.cartId);
      if (cart) {
        cart.updatedAt = new Date();
        this.carts.set(cart.id, cart);
      }
    }
    
    this.cartItems.delete(id);
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: insertOrder.status || "pending",
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      item => item.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const now = new Date();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt: now };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Marketplace Listing methods
  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    return this.marketplaceListings.get(id);
  }

  async getAllMarketplaceListings(listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]> {
    let listings = Array.from(this.marketplaceListings.values());
    
    if (listingType) {
      listings = listings.filter(listing => listing.listingType === listingType);
    }
    
    if (isCloseout !== undefined) {
      listings = listings.filter(listing => listing.isCloseout === isCloseout);
    }
    
    return listings;
  }

  async getUserMarketplaceListings(userId: number): Promise<MarketplaceListing[]> {
    return Array.from(this.marketplaceListings.values()).filter(
      listing => listing.userId === userId
    );
  }

  async searchMarketplaceListings(query: string, listingType?: string, isCloseout?: boolean): Promise<MarketplaceListing[]> {
    const lowercaseQuery = query.toLowerCase();
    let listings = Array.from(this.marketplaceListings.values()).filter(
      listing => 
        listing.title.toLowerCase().includes(lowercaseQuery) || 
        listing.description.toLowerCase().includes(lowercaseQuery)
    );
    
    if (listingType) {
      listings = listings.filter(listing => listing.listingType === listingType);
    }
    
    if (isCloseout !== undefined) {
      listings = listings.filter(listing => listing.isCloseout === isCloseout);
    }
    
    return listings;
  }

  async createMarketplaceListing(insertListing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const id = this.marketplaceListingIdCounter++;
    const now = new Date();
    const listing: MarketplaceListing = { 
      ...insertListing, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.marketplaceListings.set(id, listing);
    return listing;
  }

  async updateMarketplaceListing(id: number, data: Partial<MarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const listing = this.marketplaceListings.get(id);
    if (!listing) return undefined;
    
    const updatedListing = { 
      ...listing, 
      ...data,
      updatedAt: new Date()
    };
    this.marketplaceListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteMarketplaceListing(id: number): Promise<void> {
    this.marketplaceListings.delete(id);
  }

  // Group Purchase methods
  async getGroupPurchase(id: number): Promise<GroupPurchase | undefined> {
    return this.groupPurchases.get(id);
  }

  async getAllGroupPurchases(status?: string): Promise<GroupPurchase[]> {
    let purchases = Array.from(this.groupPurchases.values());
    
    if (status) {
      purchases = purchases.filter(purchase => purchase.status === status);
    }
    
    return purchases;
  }

  async getUserCreatedGroupPurchases(userId: number): Promise<GroupPurchase[]> {
    return Array.from(this.groupPurchases.values()).filter(
      purchase => purchase.creatorId === userId
    );
  }

  async getUserParticipatingGroupPurchases(userId: number): Promise<GroupPurchase[]> {
    const participations = Array.from(this.groupPurchaseParticipants.values()).filter(
      participant => participant.userId === userId
    );
    
    const purchaseIds = new Set(participations.map(p => p.groupPurchaseId));
    
    return Array.from(this.groupPurchases.values()).filter(
      purchase => purchaseIds.has(purchase.id)
    );
  }

  async createGroupPurchase(insertGroupPurchase: InsertGroupPurchase): Promise<GroupPurchase> {
    const id = this.groupPurchaseIdCounter++;
    const now = new Date();
    const groupPurchase: GroupPurchase = { 
      ...insertGroupPurchase, 
      id, 
      currentQuantity: 1, // Creator counts as first participant
      status: "open",
      createdAt: now,
      updatedAt: now
    };
    this.groupPurchases.set(id, groupPurchase);
    return groupPurchase;
  }

  async updateGroupPurchase(id: number, data: Partial<GroupPurchase>): Promise<GroupPurchase | undefined> {
    const groupPurchase = this.groupPurchases.get(id);
    if (!groupPurchase) return undefined;
    
    const updatedGroupPurchase = { 
      ...groupPurchase, 
      ...data,
      updatedAt: new Date()
    };
    this.groupPurchases.set(id, updatedGroupPurchase);
    return updatedGroupPurchase;
  }

  async updateGroupPurchaseStatus(id: number, status: string): Promise<GroupPurchase | undefined> {
    const groupPurchase = this.groupPurchases.get(id);
    if (!groupPurchase) return undefined;
    
    const updatedGroupPurchase = { 
      ...groupPurchase, 
      status,
      updatedAt: new Date()
    };
    this.groupPurchases.set(id, updatedGroupPurchase);
    return updatedGroupPurchase;
  }

  async deleteGroupPurchase(id: number): Promise<void> {
    this.groupPurchases.delete(id);
  }

  // Group Purchase Participant methods
  async getGroupPurchaseParticipant(id: number): Promise<GroupPurchaseParticipant | undefined> {
    return this.groupPurchaseParticipants.get(id);
  }

  async getGroupPurchaseParticipants(groupPurchaseId: number): Promise<GroupPurchaseParticipant[]> {
    return Array.from(this.groupPurchaseParticipants.values()).filter(
      participant => participant.groupPurchaseId === groupPurchaseId
    );
  }

  async getUserGroupPurchaseParticipation(userId: number, groupPurchaseId: number): Promise<GroupPurchaseParticipant | undefined> {
    return Array.from(this.groupPurchaseParticipants.values()).find(
      participant => participant.userId === userId && participant.groupPurchaseId === groupPurchaseId
    );
  }

  async addGroupPurchaseParticipant(insertParticipant: InsertGroupPurchaseParticipant): Promise<GroupPurchaseParticipant> {
    const id = this.groupPurchaseParticipantIdCounter++;
    const now = new Date();
    const participant: GroupPurchaseParticipant = { 
      ...insertParticipant, 
      id, 
      status: insertParticipant.status || "committed",
      createdAt: now,
      updatedAt: now
    };
    this.groupPurchaseParticipants.set(id, participant);
    
    // Update the group purchase's current quantity
    const groupPurchase = this.groupPurchases.get(participant.groupPurchaseId);
    if (groupPurchase) {
      const updatedQuantity = groupPurchase.currentQuantity + (participant.quantity || 1);
      this.updateGroupPurchase(groupPurchase.id, { 
        currentQuantity: updatedQuantity,
        // If target reached, update status
        status: updatedQuantity >= groupPurchase.targetQuantity ? "fulfilled" : groupPurchase.status
      });
    }
    
    return participant;
  }

  async updateGroupPurchaseParticipant(id: number, data: Partial<GroupPurchaseParticipant>): Promise<GroupPurchaseParticipant | undefined> {
    const participant = this.groupPurchaseParticipants.get(id);
    if (!participant) return undefined;
    
    const oldQuantity = participant.quantity || 1;
    const updatedParticipant = { 
      ...participant, 
      ...data,
      updatedAt: new Date()
    };
    this.groupPurchaseParticipants.set(id, updatedParticipant);
    
    // If quantity changed, update group purchase
    if (data.quantity !== undefined && data.quantity !== oldQuantity) {
      const groupPurchase = this.groupPurchases.get(participant.groupPurchaseId);
      if (groupPurchase) {
        const updatedQuantity = groupPurchase.currentQuantity - oldQuantity + (data.quantity || 1);
        this.updateGroupPurchase(groupPurchase.id, { 
          currentQuantity: updatedQuantity,
          // If target reached, update status
          status: updatedQuantity >= groupPurchase.targetQuantity ? "fulfilled" : groupPurchase.status
        });
      }
    }
    
    return updatedParticipant;
  }

  async removeGroupPurchaseParticipant(id: number): Promise<void> {
    const participant = this.groupPurchaseParticipants.get(id);
    if (participant) {
      // Update group purchase quantity before removing participant
      const groupPurchase = this.groupPurchases.get(participant.groupPurchaseId);
      if (groupPurchase) {
        this.updateGroupPurchase(groupPurchase.id, { 
          currentQuantity: Math.max(1, groupPurchase.currentQuantity - (participant.quantity || 1))
        });
      }
      
      this.groupPurchaseParticipants.delete(id);
    }
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Profile Photo operations
  async getProfilePhoto(id: number): Promise<ProfilePhoto | undefined> {
    const [photo] = await db.select().from(profilePhotos).where(eq(profilePhotos.id, id));
    return photo;
  }
  
  async getProfilePhotosByUser(userId: number): Promise<ProfilePhoto[]> {
    const photos = await db
      .select()
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, userId))
      .orderBy(asc(profilePhotos.displayOrder));
    return photos;
  }
  
  async createProfilePhoto(photo: InsertProfilePhoto): Promise<ProfilePhoto> {
    // Get count of user's existing photos
    const existingPhotos = await db
      .select()
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, photo.userId));
      
    // Limit to 10 photos per user
    if (existingPhotos.length >= 10) {
      throw new Error("Maximum number of photos (10) reached");
    }
    
    const [result] = await db
      .insert(profilePhotos)
      .values(photo)
      .returning();
    return result;
  }
  
  async updateProfilePhoto(id: number, data: Partial<ProfilePhoto>): Promise<ProfilePhoto | undefined> {
    const [updated] = await db
      .update(profilePhotos)
      .set(data)
      .where(eq(profilePhotos.id, id))
      .returning();
    return updated;
  }
  
  async deleteProfilePhoto(id: number): Promise<void> {
    await db
      .delete(profilePhotos)
      .where(eq(profilePhotos.id, id));
  }
  
  async deleteUser(id: number): Promise<void> {
    // Delete related data first to maintain referential integrity
    
    // Delete user connections
    await db.delete(connections)
      .where(
        or(
          eq(connections.requesterId, id),
          eq(connections.recipientId, id)
        )
      );
    
    // Delete messages
    await db.delete(messages)
      .where(
        or(
          eq(messages.senderId, id),
          eq(messages.recipientId, id)
        )
      );
    
    // Delete events created by user
    const userEvents = await db.select().from(events).where(eq(events.creatorId, id));
    const userEventIds = userEvents.map(event => event.id);
    
    // Delete RSVPs for those events
    if (userEventIds.length > 0) {
      await db.delete(eventRsvps)
        .where(sql`event_id IN (${userEventIds.join(',')})`);
    }
    
    // Delete RSVPs by this user
    await db.delete(eventRsvps).where(eq(eventRsvps.userId, id));
    
    // Delete events by this user
    await db.delete(events).where(eq(events.creatorId, id));
    
    // Delete inventory items by this user
    await db.delete(inventoryItems).where(eq(inventoryItems.userId, id));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Using hardcoded admin list instead of database field
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async searchUsers(query: string, userType?: string, location?: string): Promise<User[]> {
    // Build conditions for SQL query
    const conditions = [];
    const params: any[] = [];
    let paramCount = 1;
    
    if (query) {
      conditions.push(`(LOWER(full_name) LIKE $${paramCount} OR LOWER(username) LIKE $${paramCount} OR LOWER(company) LIKE $${paramCount} OR LOWER(bio) LIKE $${paramCount})`);
      const searchPattern = `%${query.toLowerCase()}%`;
      params.push(searchPattern);
      paramCount++;
    }
    
    if (userType) {
      conditions.push(`user_type = $${paramCount}`);
      params.push(userType);
      paramCount++;
    }
    
    if (location) {
      conditions.push(`LOWER(location) LIKE $${paramCount}`);
      params.push(`%${location.toLowerCase()}%`);
      paramCount++;
    }
    
    // Build the final query
    let sqlQuery = 'SELECT * FROM users';
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Execute the query using the underlying pool
    const result = await pool.query(sqlQuery, params);
    return result.rows;
  }

  // Connection operations
  async getConnection(id: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection || undefined;
  }

  async getConnectionByUsers(requesterId: number, recipientId: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(
      or(
        and(
          eq(connections.requesterId, requesterId),
          eq(connections.recipientId, recipientId)
        ),
        and(
          eq(connections.requesterId, recipientId),
          eq(connections.recipientId, requesterId)
        )
      )
    );
    return connection || undefined;
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async updateConnection(id: number, status: string): Promise<Connection | undefined> {
    const [updatedConnection] = await db.update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    return updatedConnection || undefined;
  }

  async getUserConnections(userId: number, status?: string): Promise<Connection[]> {
    let query = db.select().from(connections);
    
    if (status) {
      return await query.where(
        and(
          or(
            eq(connections.requesterId, userId),
            eq(connections.recipientId, userId)
          ),
          eq(connections.status, status)
        )
      );
    } else {
      return await query.where(
        or(
          eq(connections.requesterId, userId),
          eq(connections.recipientId, userId)
        )
      );
    }
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(
      or(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      )
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db.select().from(messages).where(
      or(
        and(
          eq(messages.senderId, user1Id),
          eq(messages.recipientId, user2Id)
        ),
        and(
          eq(messages.senderId, user2Id),
          eq(messages.recipientId, user1Id)
        )
      )
    ).orderBy(asc(messages.createdAt));
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(asc(events.date));
  }

  async updateEvent(id: number, data: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.creatorId, userId));
  }

  // RSVP operations
  async createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db.insert(eventRsvps).values(rsvp).returning();
    return newRsvp;
  }

  async getRsvpsByEvent(eventId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
  }

  async getRsvpsByUser(userId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.userId, userId));
  }

  async getRsvp(eventId: number, userId: number): Promise<EventRsvp | undefined> {
    const [rsvp] = await db.select().from(eventRsvps).where(
      and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      )
    );
    return rsvp || undefined;
  }
  
  async updateRsvp(id: number, data: Partial<EventRsvp>): Promise<EventRsvp | undefined> {
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set(data)
      .where(eq(eventRsvps.id, id))
      .returning();
    return updatedRsvp || undefined;
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async getUserInventory(userId: number): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId));
  }

  async getAllInventory(featured?: boolean): Promise<InventoryItem[]> {
    if (featured) {
      return await db.select().from(inventoryItems).where(eq(inventoryItems.isFeatured, true));
    } else {
      return await db.select().from(inventoryItems);
    }
  }

  // Article operations
  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.importedAt));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Developer operations
  async getDeveloper(id: number): Promise<Developer | undefined> {
    const [developer] = await db.select().from(developers).where(eq(developers.id, id));
    return developer || undefined;
  }

  async getAllDevelopers(): Promise<Developer[]> {
    return await db.select().from(developers).orderBy(desc(developers.addedAt));
  }

  async getDevelopersByRole(role: string): Promise<Developer[]> {
    return await db.select().from(developers).where(eq(developers.role, role as any));
  }

  async getDeveloperByUserId(userId: number): Promise<Developer | undefined> {
    const [developer] = await db.select().from(developers).where(eq(developers.userId, userId));
    return developer || undefined;
  }

  async createDeveloper(developer: InsertDeveloper): Promise<Developer> {
    const [newDeveloper] = await db.insert(developers).values(developer).returning();
    return newDeveloper;
  }

  async updateDeveloper(id: number, data: Partial<Developer>): Promise<Developer | undefined> {
    const [updatedDeveloper] = await db.update(developers)
      .set(data)
      .where(eq(developers.id, id))
      .returning();
    return updatedDeveloper || undefined;
  }

  async deleteDeveloper(id: number): Promise<void> {
    await db.delete(developers).where(eq(developers.id, id));
  }

  // Project Assignment operations
  async getProjectAssignment(id: number): Promise<ProjectAssignment | undefined> {
    const [assignment] = await db.select().from(projectAssignments).where(eq(projectAssignments.id, id));
    return assignment || undefined;
  }

  async getAllProjectAssignments(): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).orderBy(desc(projectAssignments.createdAt));
  }

  async getDeveloperProjectAssignments(developerId: number): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments)
      .where(eq(projectAssignments.developerId, developerId))
      .orderBy(desc(projectAssignments.createdAt));
  }

  async createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const [newAssignment] = await db.insert(projectAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateProjectAssignment(id: number, data: Partial<ProjectAssignment>): Promise<ProjectAssignment | undefined> {
    const [updatedAssignment] = await db.update(projectAssignments)
      .set(data)
      .where(eq(projectAssignments.id, id))
      .returning();
    return updatedAssignment || undefined;
  }

  async deleteProjectAssignment(id: number): Promise<void> {
    await db.delete(projectAssignments).where(eq(projectAssignments.id, id));
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();

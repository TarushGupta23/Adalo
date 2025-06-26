const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq } = require('drizzle-orm');
const crypto = require('crypto');

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Import schema (dynamically require to handle ESM/CJS differences)
const schema = require('./shared/schema.cjs');
const { users } = schema;

async function hashPassword(password) {
  const salt = crypto.createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 16);
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return `${hash}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Create the admin user
    const [admin] = await db.insert(users).values({
      username: 'admin',
      password: await hashPassword('admin123'), // Default password: admin123
      email: 'admin@jewelrydirectory.com',
      fullName: 'System Administrator',
      userType: 'consulting',
      company: 'Jewelry Directory',
      location: 'System',
      bio: 'System administrator account',
      isPremium: true,
      profileImage: '',
      coverImage: '',
      logoImage: ''
    }).returning();
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createAdminUser();
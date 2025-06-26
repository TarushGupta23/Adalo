import { createServer } from 'http';
import express from 'express';
import { storage } from './server/storage.js';
import { createHash } from 'crypto';

async function hashPassword(password) {
  const salt = createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 16);
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${hash}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Create the admin user
    const admin = await storage.createUser({
      username: 'admin',
      password: await hashPassword('admin123'), // Default password: admin123
      email: 'admin@jewelrydirectory.com',
      fullName: 'System Administrator',
      userType: 'consulting',
      company: 'Jewelry Directory',
      location: 'System',
      bio: 'System administrator account',
    });
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser();
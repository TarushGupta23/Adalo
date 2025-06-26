const { Pool } = require('@neondatabase/serverless');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // First check if admin exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (existingUser.rows.length > 0) {
      // Update existing admin with new password
      const hashedPassword = await hashPassword('admin123');
      await pool.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, 'admin']
      );
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword('admin123');
      await pool.query(`
        INSERT INTO users (username, password, email, full_name, user_type)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', hashedPassword, 'admin@jewelconnect.com', 'Administrator', 'other']);
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('🔑 Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
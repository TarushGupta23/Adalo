import fetch from 'node-fetch';
import crypto from 'crypto';

// Function to hash the password (similar to the one in auth.ts)
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

// Create the Design company user
async function createDesignCompany() {
  try {
    const hashedPassword = await hashPassword("designsrlpassword");
    
    const designCompanyData = {
      username: "designsrl",
      password: hashedPassword,
      email: "info@designsrl.com",
      fullName: "Design S.r.l.",
      userType: "designer",
      company: "Design S.r.l.",
      location: "Headquarters Vicenza, Italy | Office Milan, Italy",
      bio: "Italian jewellery designer and manufacturer since 1989, specializing in gold and silver jewellery inspired by Italian style and made with cutting-edge techniques.",
      profileImage: "https://images.unsplash.com/photo-1571126770897-2d612d1f7b89?q=80&w=400&auto=format&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=800&auto=format&fit=crop",
      logoImage: "/images/design-logo.png",
      isPremium: true
    };
    
    // Register new user via admin route
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(designCompanyData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Design company: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Design company created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating Design company:', error);
    throw error;
  }
}

// Execute the function
createDesignCompany()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));
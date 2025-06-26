// A simplified script to create an admin user through the API
// This approach uses the existing API endpoint, so we don't need to handle DB connections directly

const fetchUrl = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

async function createAdmin() {
  try {
    // Create admin user
    const adminData = {
      username: 'admin',
      password: 'admin123',  // Simple password for testing
      email: 'admin@jewelrydirectory.com',
      fullName: 'System Administrator',
      userType: 'consulting',
      company: 'Jewelry Directory',
      location: 'System',
      bio: 'System administrator account'
    };

    console.log('Creating admin user...');
    const result = await fetchUrl('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    console.log('Admin user created successfully:');
    console.log('- Username: admin');
    console.log('- Password: admin123');
    console.log('You can now log in and create events!');
    
  } catch (error) {
    console.error('Failed to create admin user:', error);
    console.log('The admin user might already exist. Try logging in with:');
    console.log('- Username: admin');
    console.log('- Password: admin123');
  }
}

// Run the function
createAdmin();
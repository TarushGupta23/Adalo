// Register admin user via API
fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
    email: 'admin@jewelrydirectory.com',
    fullName: 'System Administrator',
    userType: 'consulting',
    company: 'Jewelry Directory',
    location: 'System',
    bio: 'System administrator account'
  })
})
.then(response => {
  if (response.ok) {
    return response.json();
  }
  throw new Error('Failed to create admin user');
})
.then(data => {
  console.log('Admin user created:', data);
  console.log('Username: admin');
  console.log('Password: admin123');
})
.catch(error => {
  console.error('Error:', error);
});

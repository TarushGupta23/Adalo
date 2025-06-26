// Script to update users directly in the in-memory storage
const { storage } = require('./server/storage');

// Update the categories for all users
async function updateUserCategories() {
  try {
    console.log("Updating user categories...");
    
    // Update To Be Packing (ID=1) to have packaging as primary and displays as secondary
    const toBePackingUser = await storage.updateUser(1, {
      userType: "packaging",
      secondaryType: "displays",
      isPremium: true,
    });
    console.log("Updated To Be Packing:", toBePackingUser);
    
    // Update designSrl (ID=3) to be in store_design category
    const designSrlUser = await storage.updateUser(3, {
      userType: "store_design",
      isPremium: true,
    });
    console.log("Updated design Srl:", designSrlUser);
    
    // Update Carmela (ID=2) to be in designer category
    const carmelaUser = await storage.updateUser(2, {
      userType: "designer",
      isPremium: true,
      profileImage: "https://images.unsplash.com/photo-1625708458528-802ec79b8182?q=80&w=400&auto=format&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=800&auto=format&fit=crop"
    });
    console.log("Updated Carmela:", carmelaUser);
    
    console.log("All user categories updated successfully!");
  } catch (error) {
    console.error("Error updating user categories:", error);
  }
}

// Run the update
updateUserCategories();

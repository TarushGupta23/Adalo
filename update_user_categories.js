// This script updates the user categories according to the new schema
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateUserCategories() {
  try {
    console.log("Updating user categories...");
    
    // Update To Be Packing to be in both packaging and displays categories
    await db.update(users)
      .set({ 
        userType: "packaging",
        secondaryType: "displays"
      })
      .where(eq(users.id, 1));
    
    console.log("Updated To Be Packing with packaging and displays categories");
    
    // Update Design Srl to be in store_design category
    // Assuming ID for Design Srl is 3 - update this if it's different
    await db.update(users)
      .set({ userType: "store_design" })
      .where(eq(users.id, 3));
    
    console.log("Updated Design Srl with store_design category");
    
    // Update Carmela to designer category
    await db.update(users)
      .set({ userType: "designer" })
      .where(eq(users.id, 2));
    
    console.log("Updated Carmela with designer category");
    
    console.log("All user categories have been updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating user categories:", error);
    process.exit(1);
  }
}

updateUserCategories();
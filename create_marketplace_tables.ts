// Script to create the gemstone marketplace tables in the database
import { db } from './server/db';
import { 
  suppliers, 
  gemstoneCategories, 
  gemstones,
  carts,
  cartItems,
  orders,
  orderItems
} from './shared/schema';
import { sql } from 'drizzle-orm';

async function createMarketplaceTables() {
  try {
    console.log('Creating gemstone marketplace tables...');
    
    // Create the suppliers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo" TEXT,
        "website" TEXT,
        "description" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Suppliers table created');
    
    // Create the gemstone_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "gemstone_categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "image_url" TEXT
      );
    `);
    console.log('Gemstone categories table created');
    
    // Create the gemstones table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "gemstones" (
        "id" SERIAL PRIMARY KEY,
        "supplier_id" INTEGER NOT NULL,
        "category_id" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" NUMERIC NOT NULL,
        "carat_weight" NUMERIC NOT NULL,
        "color" TEXT NOT NULL,
        "clarity" TEXT,
        "cut" TEXT,
        "shape" TEXT,
        "origin" TEXT,
        "certification" TEXT,
        "image_url" TEXT NOT NULL,
        "inventory" INTEGER NOT NULL DEFAULT 1,
        "is_available" BOOLEAN DEFAULT TRUE,
        "is_featured" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id"),
        FOREIGN KEY ("category_id") REFERENCES "gemstone_categories" ("id")
      );
    `);
    console.log('Gemstones table created');
    
    // Create the carts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "carts" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      );
    `);
    console.log('Carts table created');
    
    // Create the cart_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" SERIAL PRIMARY KEY,
        "cart_id" INTEGER NOT NULL,
        "gemstone_id" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("cart_id") REFERENCES "carts" ("id"),
        FOREIGN KEY ("gemstone_id") REFERENCES "gemstones" ("id")
      );
    `);
    console.log('Cart items table created');
    
    // Create the orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "total_amount" NUMERIC NOT NULL,
        "shipping_address" TEXT NOT NULL,
        "shipping_city" TEXT NOT NULL,
        "shipping_state" TEXT NOT NULL,
        "shipping_zip" TEXT NOT NULL,
        "shipping_country" TEXT NOT NULL,
        "payment_method" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      );
    `);
    console.log('Orders table created');
    
    // Create the order_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL,
        "gemstone_id" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" NUMERIC NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("order_id") REFERENCES "orders" ("id"),
        FOREIGN KEY ("gemstone_id") REFERENCES "gemstones" ("id")
      );
    `);
    console.log('Order items table created');
    
    console.log('All gemstone marketplace tables created successfully!');
    
    // Now create sample data
    
    // Add GemsBiz supplier
    await db.execute(sql`
      INSERT INTO suppliers (name, description, location, website)
      VALUES ('GemsBiz', 'Premium supplier of high-quality gemstones for the jewelry industry.', 'New York, NY', 'www.gemsbiz.com')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    // Get supplier ID
    const [supplier] = await db.select().from(suppliers).where(sql`name = 'GemsBiz'`);
    const supplierId = supplier?.id;
    
    if (supplierId) {
      console.log(`Using GemsBiz supplier with ID: ${supplierId}`);
      
      // Add gemstone categories
      const categories = [
        { name: 'Diamonds', description: 'The hardest natural material and the most popular gemstone.', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { name: 'Rubies', description: 'Red variety of corundum, known for their deep red color and durability.', imageUrl: 'https://images.unsplash.com/photo-1602491676584-c2440094a171?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { name: 'Sapphires', description: 'Blue variety of corundum, highly valued for their color and hardness.', imageUrl: 'https://images.unsplash.com/photo-1616404595522-4ad1788d2c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { name: 'Emeralds', description: 'Green variety of beryl, highly prized for their rich green color.', imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { name: 'Pearls', description: 'Organic gems formed inside mollusks, known for their luster and elegance.', imageUrl: 'https://images.unsplash.com/photo-1608736007209-7c9309ccaecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
      ];
      
      for (const category of categories) {
        await db.execute(sql`
          INSERT INTO gemstone_categories (name, description, image_url)
          VALUES (${category.name}, ${category.description}, ${category.imageUrl})
          ON CONFLICT (name) DO NOTHING;
        `);
      }
      
      console.log('Added gemstone categories');
      
      // Get category IDs
      const categoryRows = await db.select().from(gemstoneCategories);
      const categoryMap = new Map();
      categoryRows.forEach(cat => categoryMap.set(cat.name, cat.id));
      
      if (categoryMap.size > 0) {
        // Add sample gemstones
        const gemstoneData = [
          {
            name: 'Round Brilliant Diamond',
            description: 'Premium round brilliant cut diamond with exceptional clarity and brilliance.',
            categoryName: 'Diamonds',
            price: '5999.99',
            caratWeight: '1.50',
            color: 'D',
            clarity: 'VVS1',
            cut: 'Excellent',
            shape: 'Round',
            origin: 'South Africa',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1600267185393-e158a98703de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 5,
            isAvailable: true,
            isFeatured: true
          },
          {
            name: 'Burmese Ruby',
            description: "Exquisite Burmese ruby with a vibrant red color known as pigeon's blood.",
            categoryName: 'Rubies',
            price: '8500.00',
            caratWeight: '2.05',
            color: 'Vivid Red',
            clarity: 'VS',
            cut: 'Oval',
            shape: 'Oval',
            origin: 'Burma (Myanmar)',
            certification: 'GRS',
            imageUrl: 'https://images.unsplash.com/photo-1611425143678-08fc480cafde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 2,
            isAvailable: true,
            isFeatured: true
          },
          {
            name: 'Kashmir Sapphire',
            description: 'Rare Kashmir sapphire with the highly coveted cornflower blue color.',
            categoryName: 'Sapphires',
            price: '12500.00',
            caratWeight: '1.82',
            color: 'Cornflower Blue',
            clarity: 'VS',
            cut: 'Oval',
            shape: 'Oval',
            origin: 'Kashmir',
            certification: 'SSEF',
            imageUrl: 'https://images.unsplash.com/photo-1616404535726-01f7a5e055c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 1,
            isAvailable: true,
            isFeatured: true
          },
          {
            name: 'Colombian Emerald',
            description: 'Premium Colombian emerald with an intense green color and garden inclusions.',
            categoryName: 'Emeralds',
            price: '9200.00',
            caratWeight: '1.95',
            color: 'Vivid Green',
            clarity: 'VS',
            cut: 'Emerald',
            shape: 'Emerald',
            origin: 'Colombia',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1624954636362-c87756c7f30f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 2,
            isAvailable: true,
            isFeatured: true
          },
          {
            name: 'South Sea Pearl Strand',
            description: 'Luxurious strand of perfectly matched South Sea pearls with excellent luster.',
            categoryName: 'Pearls',
            price: '7500.00',
            caratWeight: '100.00',
            color: 'White',
            clarity: 'AAA',
            cut: 'N/A',
            shape: 'Round',
            origin: 'Australia',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1611759386164-424107027edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 2,
            isAvailable: true,
            isFeatured: true
          }
        ];
        
        for (const gemData of gemstoneData) {
          const categoryId = categoryMap.get(gemData.categoryName);
          if (categoryId) {
            // Check if gemstone already exists
            const existing = await db.select().from(gemstones).where(sql`name = ${gemData.name}`);
            if (existing.length === 0) {
              await db.execute(sql`
                INSERT INTO gemstones (
                  name, description, supplier_id, category_id, price, carat_weight, 
                  color, clarity, cut, shape, origin, certification, image_url, 
                  inventory, is_available, is_featured
                ) VALUES (
                  ${gemData.name}, ${gemData.description}, ${supplierId}, ${categoryId}, 
                  ${gemData.price}, ${gemData.caratWeight}, ${gemData.color}, ${gemData.clarity}, 
                  ${gemData.cut}, ${gemData.shape}, ${gemData.origin}, ${gemData.certification}, 
                  ${gemData.imageUrl}, ${gemData.inventory}, ${gemData.isAvailable}, ${gemData.isFeatured}
                );
              `);
            }
          }
        }
        
        console.log('Added sample gemstones');
      }
    }
    
    console.log('Gemstone marketplace initialization completed successfully!');
  } catch (error) {
    console.error('Error creating gemstone marketplace tables:', error);
  }
}

// Execute the function
createMarketplaceTables();
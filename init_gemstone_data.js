// Script to initialize gemstone marketplace data
import { db } from './server/db.js';
import { 
  suppliers, 
  gemstoneCategories, 
  gemstones 
} from './shared/schema.js';

async function initializeGemstoneData() {
  try {
    console.log('Starting gemstone marketplace data initialization...');

    // Check if GemsBiz supplier already exists
    const existingSuppliers = await db.select().from(suppliers);
    let supplierId;
    
    if (existingSuppliers.length === 0) {
      console.log('Creating GemsBiz supplier...');
      // Create GemsBiz supplier
      const [gemsBiz] = await db.insert(suppliers).values({
        name: 'GemsBiz',
        description: 'Premium supplier of high-quality gemstones for the jewelry industry.',
        location: 'New York, NY',
        website: 'www.gemsbiz.com',
        logo: null,
      }).returning();
      
      supplierId = gemsBiz.id;
      console.log(`GemsBiz supplier created with ID: ${supplierId}`);
    } else {
      supplierId = existingSuppliers[0].id;
      console.log(`Using existing supplier with ID: ${supplierId}`);
    }

    // Check if gemstone categories exist
    const existingCategories = await db.select().from(gemstoneCategories);
    
    if (existingCategories.length === 0) {
      console.log('Creating gemstone categories...');
      // Create gemstone categories
      const categories = [
        {
          name: 'Diamonds',
          description: 'The hardest natural material and the most popular gemstone.',
          imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Rubies',
          description: 'Red variety of corundum, known for their deep red color and durability.',
          imageUrl: 'https://images.unsplash.com/photo-1602491676584-c2440094a171?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Sapphires',
          description: 'Blue variety of corundum, highly valued for their color and hardness.',
          imageUrl: 'https://images.unsplash.com/photo-1616404595522-4ad1788d2c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Emeralds',
          description: 'Green variety of beryl, highly prized for their rich green color.',
          imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Pearls',
          description: 'Organic gems formed inside mollusks, known for their luster and elegance.',
          imageUrl: 'https://images.unsplash.com/photo-1608736007209-7c9309ccaecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
      ];
      
      const insertedCategories = await db.insert(gemstoneCategories).values(categories).returning();
      console.log(`Created ${insertedCategories.length} gemstone categories`);
      
      // Check if gemstones exist
      const existingGemstones = await db.select().from(gemstones);
      
      if (existingGemstones.length === 0) {
        console.log('Creating sample gemstones...');
        // Create sample gemstones
        const gemstoneData = [
          // Diamonds
          {
            name: 'Round Brilliant Diamond',
            description: 'Premium round brilliant cut diamond with exceptional clarity and brilliance.',
            supplierId,
            categoryId: insertedCategories[0].id,
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
            isFeatured: true,
          },
          {
            name: 'Princess Cut Diamond',
            description: 'Elegant princess cut diamond with exceptional fire and brilliance.',
            supplierId,
            categoryId: insertedCategories[0].id,
            price: '4299.99',
            caratWeight: '1.25',
            color: 'E',
            clarity: 'VS1',
            cut: 'Excellent',
            shape: 'Princess',
            origin: 'Botswana',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1608474150110-d94b63a1e7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 3,
            isAvailable: true,
            isFeatured: false,
          },
          
          // Rubies
          {
            name: 'Burmese Ruby',
            description: "Exquisite Burmese ruby with a vibrant red color known as 'pigeon\'s blood'.",
            supplierId,
            categoryId: insertedCategories[1].id,
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
            isFeatured: true,
          },
          {
            name: 'Thai Ruby',
            description: 'Beautiful Thai ruby with a deep red color and excellent transparency.',
            supplierId,
            categoryId: insertedCategories[1].id,
            price: '3200.00',
            caratWeight: '1.75',
            color: 'Red',
            clarity: 'SI',
            cut: 'Cushion',
            shape: 'Cushion',
            origin: 'Thailand',
            certification: 'AGL',
            imageUrl: 'https://images.unsplash.com/photo-1599643477234-7547f72e2d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 4,
            isAvailable: true,
            isFeatured: false,
          },
          
          // Sapphires
          {
            name: 'Kashmir Sapphire',
            description: 'Rare Kashmir sapphire with the highly coveted cornflower blue color.',
            supplierId,
            categoryId: insertedCategories[2].id,
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
            isFeatured: true,
          },
          {
            name: 'Ceylon Sapphire',
            description: 'Stunning Ceylon sapphire with a vibrant blue color and excellent transparency.',
            supplierId,
            categoryId: insertedCategories[2].id,
            price: '5800.00',
            caratWeight: '2.15',
            color: 'Royal Blue',
            clarity: 'VS',
            cut: 'Cushion',
            shape: 'Cushion',
            origin: 'Sri Lanka',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1616404596599-2f7a3bad45f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 3,
            isAvailable: true,
            isFeatured: false,
          },
          
          // Emeralds
          {
            name: 'Colombian Emerald',
            description: 'Premium Colombian emerald with an intense green color and garden inclusions.',
            supplierId,
            categoryId: insertedCategories[3].id,
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
            isFeatured: true,
          },
          {
            name: 'Zambian Emerald',
            description: 'Beautiful Zambian emerald with a deep green color and excellent clarity.',
            supplierId,
            categoryId: insertedCategories[3].id,
            price: '4800.00',
            caratWeight: '1.65',
            color: 'Deep Green',
            clarity: 'VS',
            cut: 'Oval',
            shape: 'Oval',
            origin: 'Zambia',
            certification: 'AGL',
            imageUrl: 'https://images.unsplash.com/photo-1616404575232-ad869e1e2e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 4,
            isAvailable: true,
            isFeatured: false,
          },
          
          // Pearls
          {
            name: 'South Sea Pearl Strand',
            description: 'Luxurious strand of perfectly matched South Sea pearls with excellent luster.',
            supplierId,
            categoryId: insertedCategories[4].id,
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
            isFeatured: true,
          },
          {
            name: 'Tahitian Pearl Strand',
            description: 'Exquisite strand of iridescent black Tahitian pearls with green and purple overtones.',
            supplierId,
            categoryId: insertedCategories[4].id,
            price: '6800.00',
            caratWeight: '90.00',
            color: 'Black',
            clarity: 'AAA',
            cut: 'N/A',
            shape: 'Round',
            origin: 'French Polynesia',
            certification: 'GIA',
            imageUrl: 'https://images.unsplash.com/photo-1616404542755-e7c14c409af8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            inventory: 3,
            isAvailable: true,
            isFeatured: false,
          },
        ];
        
        const insertedGemstones = await db.insert(gemstones).values(gemstoneData).returning();
        console.log(`Created ${insertedGemstones.length} sample gemstones`);
      } else {
        console.log(`Found ${existingGemstones.length} existing gemstones, skipping gemstone creation`);
      }
    } else {
      console.log(`Found ${existingCategories.length} existing categories, skipping category creation`);
    }

    console.log('Gemstone marketplace data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing gemstone marketplace data:', error);
  }
}

// Run the initialization function
initializeGemstoneData();
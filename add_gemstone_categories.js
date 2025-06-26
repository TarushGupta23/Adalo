import { db } from './server/db.js';
import { gemstoneCategories } from './shared/schema.js';

async function addGemstoneCategories() {
  const categoriesToAdd = [
    {
      name: 'Alexandrite',
      description: 'A rare color-changing gemstone that shifts between green and red depending on the light source.'
    },
    {
      name: 'Paraiba',
      description: 'A highly valuable variety of tourmaline with a vivid blue-green color caused by copper content.'
    },
    {
      name: 'Spinel',
      description: 'A gem with brilliant clarity and rich colors, historically mistaken for ruby or sapphire.'
    },
    {
      name: 'Tanzanite',
      description: 'A blue-violet variety of zoisite found only near Mount Kilimanjaro in Tanzania.'
    },
    {
      name: 'Aquamarine',
      description: 'A blue to blue-green variety of beryl valued for its clear color and durability.'
    },
    {
      name: 'Garnet',
      description: 'A diverse family of gemstones available in virtually every color with rich, saturated hues.'
    },
    {
      name: 'Opal',
      description: 'A gemstone known for its play of color, where flashes of rainbow colors appear when viewed from different angles.'
    },
    {
      name: 'Peridot',
      description: 'A vibrant lime-green gemstone formed deep in the earth and sometimes found in meteorites.'
    },
    {
      name: 'Topaz',
      description: 'A gemstone occurring in a wide range of colors, with blue and imperial topaz being the most valued.'
    },
    {
      name: 'Tourmaline',
      description: 'A versatile gemstone with the widest color range of any gem, often showing multiple colors in a single stone.'
    },
    {
      name: 'Moonstone',
      description: 'Known for its adularescence, creating a floating light effect that resembles moonlight.'
    }
  ];

  console.log('Starting to add new gemstone categories...');

  try {
    for (const category of categoriesToAdd) {
      // Check if the category already exists
      const existing = await db.select().from(gemstoneCategories).where(gemstoneCategories.name.eq(category.name));
      
      if (existing.length === 0) {
        // Insert the new category
        const inserted = await db.insert(gemstoneCategories).values({
          name: category.name,
          description: category.description,
          imageUrl: null // No images for now
        }).returning();
        
        console.log(`Added category: ${category.name}`);
      } else {
        console.log(`Category ${category.name} already exists, skipping`);
      }
    }
    
    console.log('All categories added successfully');
  } catch (error) {
    console.error('Error adding gemstone categories:', error);
  } finally {
    process.exit(0);
  }
}

addGemstoneCategories();
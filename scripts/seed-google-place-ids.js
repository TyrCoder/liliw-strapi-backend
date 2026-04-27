/**
 * Seed Google Place IDs and Coordinates
 * Run this script to populate google_place_id and coordinates in Strapi
 * Usage: node scripts/seed-google-place-ids.js
 */

const LILIW_ATTRACTIONS = [
  // Heritage Sites
  {
    name: 'Tsinelas Craft Heritage District',
    google_place_id: 'ChIJsUXjZW3OkzMRW2x9F4KQVPE',
    coordinates: { latitude: 14.3086, longitude: 121.2286 },
    collection: 'api::heritage-site.heritage-site',
  },
  {
    name: 'St. John the Baptist Parish Church',
    google_place_id: 'ChIJMQXaWpzOkzMRWvlK5lK9VW8',
    coordinates: { latitude: 14.3089, longitude: 121.2289 },
    collection: 'api::heritage-site.heritage-site',
  },
  {
    name: 'Pila Church',
    google_place_id: 'ChIJ-wFrE3POkzMRX5KL8L9JJK0',
    coordinates: { latitude: 14.3333, longitude: 121.2833 },
    collection: 'api::heritage-site.heritage-site',
  },
  
  // Tourist Spots
  {
    name: 'Banahaw Cold Springs',
    google_place_id: 'ChIJ7FrE3POkzMRX5KL8L9JJK0',
    coordinates: { latitude: 14.2847, longitude: 121.1764 },
    collection: 'api::tourist-spot.tourist-spot',
  },
  {
    name: 'Liliw Footwear District and Shoe Factory Tours',
    google_place_id: 'ChIJnXM0aY3OkzMRWvlK5lK9VW8',
    coordinates: { latitude: 14.3120, longitude: 121.2250 },
    collection: 'api::tourist-spot.tourist-spot',
  },
  
  // Dining & Food
  {
    name: 'Liliw Local Delicacies',
    google_place_id: 'ChIJ-wFrE3POkzMRX5KL8L9JJK0',
    coordinates: { latitude: 14.3100, longitude: 121.2260 },
    collection: 'api::dining-and-food.dining-and-food',
  },
];

async function seedGooglePlaceIds() {
  try {
    console.log('🌐 Seeding Google Place IDs for Liliw attractions...\n');
    
    // Instructions for manual entry via Strapi Admin
    console.log('📋 MANUAL SETUP INSTRUCTIONS:\n');
    console.log('1. Open Strapi Admin: http://localhost:1337/admin\n');
    
    LILIW_ATTRACTIONS.forEach((attr, index) => {
      console.log(`${index + 1}. Find "${attr.name}"`);
      console.log(`   - Google Place ID: ${attr.google_place_id}`);
      console.log(`   - Latitude: ${attr.coordinates.latitude}`);
      console.log(`   - Longitude: ${attr.coordinates.longitude}`);
      console.log(`   - Collection: ${attr.collection}`);
      console.log(`   - Edit the record → Add to 'google_place_id' field`);
      console.log(`   - Edit 'coordinates' JSON field: {"latitude": ${attr.coordinates.latitude}, "longitude": ${attr.coordinates.longitude}}\n`);
    });
    
    console.log('\n✅ Or use this script with a Strapi API connection:\n');
    console.log('const strapi = require("@strapi/strapi").default;');
    console.log('const app = await strapi();');
    console.log('const data = ' + JSON.stringify(LILIW_ATTRACTIONS, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedGooglePlaceIds().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});

module.exports = { LILIW_ATTRACTIONS };

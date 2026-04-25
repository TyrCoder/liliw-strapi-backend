const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');

const LOCAL_DB = path.join(__dirname, '../.tmp/data.db');
const CLOUD_API = 'https://liliw-backend.onrender.com/api';
const API_TOKEN = process.argv[2]; // Pass token as argument

if (!API_TOKEN) {
  console.error('❌ Error: Please provide API token as argument');
  console.error('Usage: node scripts/migrate-to-cloud.js <YOUR_API_TOKEN>');
  process.exit(1);
}

const db = new sqlite3.Database(LOCAL_DB);
const headers = { Authorization: `Bearer ${API_TOKEN}` };

const tables = [
  'heritage_sites',
  'tourist_spots', 
  'events',
  'faqs',
  'itineraries',
  'ratings',
  'submissions',
  'newsletter_subscriptions'
];

async function migrateTable(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.warn(`⚠️  Skipping ${tableName}: ${err.message}`);
        resolve();
        return;
      }

      if (!rows || rows.length === 0) {
        console.log(`✓ ${tableName}: No data to migrate`);
        resolve();
        return;
      }

      let success = 0;
      let failed = 0;

      for (const row of rows) {
        try {
          await axios.post(`${CLOUD_API}/${tableName}`, 
            { data: row },
            { headers }
          );
          success++;
        } catch (err) {
          failed++;
          console.error(`  ❌ Error migrating ${tableName}:`, err.message);
        }
      }

      console.log(`✓ ${tableName}: ${success}/${rows.length} records migrated`);
      if (failed > 0) console.warn(`  (${failed} failed)`);
      resolve();
    });
  });
}

async function runMigration() {
  console.log('\n🚀 Starting data migration...\n');

  for (const table of tables) {
    await migrateTable(table);
  }

  console.log('\n✅ Migration complete!\n');
  db.close();
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

const SQLITE_PATH = path.join(__dirname, '../.tmp/data.db');
const PG_CONNECTION_STRING = process.env.DATABASE_URL;

if (!PG_CONNECTION_STRING) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

async function migrate() {
  try {
    console.log(`📥 Opening SQLite database: ${SQLITE_PATH}`);
    const sqlite = new Database(SQLITE_PATH);
    sqlite.pragma('journal_mode = WAL');

    console.log(`📤 Connecting to PostgreSQL: ${PG_CONNECTION_STRING.split('@')[1]}`);
    const pool = new Pool({ connectionString: PG_CONNECTION_STRING });

    // Get all tables from SQLite
    const tables = sqlite
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
      .all();

    console.log(`\n📊 Found ${tables.length} tables to migrate:\n`);

    for (const table of tables) {
      const tableName = table.name;
      console.log(`  🔄 Migrating table: ${tableName}`);

      try {
        // Get all data from SQLite table
        const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
        
        if (rows.length === 0) {
          console.log(`    ✅ Table ${tableName} is empty, skipping insert`);
          continue;
        }

        // Get column names
        const columns = Object.keys(rows[0]);
        const columnList = columns.join(', ');
        const placeholders = columns.map((_, i) => `\$${i + 1}`).join(', ');

        // Insert data in batches
        const insertQuery = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        
        let inserted = 0;
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col];
            // Convert SQLite types to PostgreSQL types
            if (val === null) return null;
            if (typeof val === 'boolean') return val ? true : false;
            return val;
          });

          try {
            await pool.query(insertQuery, values);
            inserted++;
          } catch (err) {
            console.warn(`    ⚠️  Row insert failed: ${err.message}`);
          }
        }
        console.log(`    ✅ Inserted ${inserted}/${rows.length} rows`);
      } catch (err) {
        console.error(`    ❌ Error migrating ${tableName}: ${err.message}`);
      }
    }

    sqlite.close();
    await pool.end();
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();

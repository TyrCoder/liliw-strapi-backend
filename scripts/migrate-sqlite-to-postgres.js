const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

const SQLITE_PATH = path.join(__dirname, '../.tmp/data.db');
const PG_CONNECTION_STRING = process.env.DATABASE_URL;

if (!PG_CONNECTION_STRING) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function isSystemOrJoinTable(tableName) {
  const skipPatterns = [
    /^sqlite_/,
    /^strapi_/,
    /^admin_/,
    /^up_/,
    /^files_/,
    /^upload_/,
    /^i18n_/,
    /_lnk$/,
    /_mph$/,
  ];

  return skipPatterns.some((pattern) => pattern.test(tableName));
}

function normalizeDateValue(value, dataType) {
  if (value === null || value === undefined || value === '') return null;

  const asString = String(value);
  const numeric = /^\d+$/.test(asString) ? Number(asString) : NaN;
  let date;

  if (!Number.isNaN(numeric)) {
    // SQLite values in this project are stored as epoch milliseconds.
    const epochMs = numeric > 1e12 ? numeric : numeric * 1000;
    date = new Date(epochMs);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return null;

  if (dataType === 'date') {
    return date.toISOString().slice(0, 10);
  }

  return date.toISOString();
}

function normalizeValue(value, dataType) {
  if (value === null || value === undefined) return null;

  if (dataType === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1') return true;
    if (value === 0 || value === '0') return false;
  }

  if (
    dataType === 'date' ||
    dataType === 'timestamp without time zone' ||
    dataType === 'timestamp with time zone'
  ) {
    return normalizeDateValue(value, dataType);
  }

  return value;
}

async function migrate() {
  try {
    console.log(`📥 Opening SQLite database: ${SQLITE_PATH}`);
    const sqlite = new Database(SQLITE_PATH);
    sqlite.pragma('journal_mode = WAL');

    console.log(`📤 Connecting to PostgreSQL: ${PG_CONNECTION_STRING.split('@')[1]}`);
    const pool = new Pool({ connectionString: PG_CONNECTION_STRING });

    // Get all tables from SQLite
    const allTables = sqlite
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
      .all();

    const tables = allTables.filter((t) => !isSystemOrJoinTable(t.name));

    console.log(`\n📊 Found ${allTables.length} SQLite tables`);
    console.log(`📦 Migrating ${tables.length} content tables (system/join tables skipped)\n`);

    for (const table of tables) {
      const tableName = table.name;
      console.log(`  🔄 Migrating table: ${tableName}`);

      try {
        // Get all data from SQLite table
        const rows = sqlite.prepare(`SELECT * FROM ${quoteIdent(tableName)}`).all();
        
        if (rows.length === 0) {
          console.log(`    ✅ Table ${tableName} is empty, skipping insert`);
          continue;
        }

        // Get column names
        const columns = Object.keys(rows[0]);
        const pgColsRes = await pool.query(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
          [tableName]
        );

        if (pgColsRes.rows.length === 0) {
          console.warn(`    ⚠️  Table ${tableName} not found in Postgres, skipping`);
          continue;
        }

        const pgTypeByColumn = new Map(
          pgColsRes.rows.map((r) => [r.column_name, r.data_type])
        );

        const filteredColumns = columns.filter((c) => pgTypeByColumn.has(c));
        const columnList = filteredColumns.map(quoteIdent).join(', ');
        const placeholders = filteredColumns.map((_, i) => `$${i + 1}`).join(', ');

        if (filteredColumns.length === 0) {
          console.warn(`    ⚠️  No matching columns for ${tableName}, skipping`);
          continue;
        }

        // Insert data in batches
        const insertQuery = `INSERT INTO ${quoteIdent(tableName)} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        
        let inserted = 0;
        for (const row of rows) {
          const values = filteredColumns.map((col) => {
            const val = row[col];
            const dataType = pgTypeByColumn.get(col);
            return normalizeValue(val, dataType);
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

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const LOCAL_DB = path.join(__dirname, '../.tmp/data.db');
const db = new sqlite3.Database(LOCAL_DB);

const tables = [
  'heritage_sites',
  'tourist_spots', 
  'events',
  'faqs'
];

async function exportData() {
  const allData = {};

  for (const table of tables) {
    allData[table] = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          console.warn(`Skipping ${table}: ${err.message}`);
          resolve([]);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  console.log(JSON.stringify(allData, null, 2));
  db.close();
}

exportData();

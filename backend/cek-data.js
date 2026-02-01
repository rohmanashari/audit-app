const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 🔒 HARUS SAMA PERSIS
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM records', (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(rows);
  }
  db.close();
});
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT DEFAULT (date('now'))
    )
  `);

  console.log('Tabel records siap');
});

db.close();
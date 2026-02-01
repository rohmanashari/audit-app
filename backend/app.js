require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './database.db';

app.use(cors());
app.use(express.json());

// =====================
// DATABASE
// =====================
const dbPathResolved = path.resolve(DB_PATH);

const db = new sqlite3.Database(dbPathResolved, (err) => {
  if (err) {
    console.error('❌ Gagal koneksi DB:', err.message);
  } else {
    console.log('✅ Database terhubung:', dbPathResolved);
  }
});

// =====================
// ROUTES
// =====================
app.get('/records', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || '';

  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  const dataQuery = `
    SELECT * FROM records
    WHERE description LIKE ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM records
    WHERE description LIKE ?
  `;

  db.all(dataQuery, [searchQuery, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(countQuery, [searchQuery], (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalPages = Math.ceil(countRow.total / limit);

      res.json({
        data: rows,
        page,
        totalPages
      });
    });
  });
});

// =====================
// SERVER
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
// ===============================
// ENV CONFIG
// ===============================
require('dotenv').config()

// ===============================
// IMPORT
// ===============================
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// ===============================
// DB PATH (DARI ENV)
// ===============================
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'database.db')

// ===============================
// DB INIT
// ===============================
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err.message)
  } else {
    console.log('✅ Database terhubung:', dbPath)
  }
})

module.exports = db
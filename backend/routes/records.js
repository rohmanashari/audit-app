const express = require('express');
const router = express.Router();
const db = require('../database');

// ===============================
// GET /records (pagination + search)
// ===============================
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const search = req.query.search ? req.query.search.trim() : '';

  let whereClause = '';
  let params = [];

  if (search) {
    whereClause = 'WHERE description LIKE ?';
    params.push(`%${search}%`);
  }

  // ---------- COUNT ----------
  const countQuery = `
    SELECT COUNT(*) as total
    FROM records
    ${whereClause}
  `;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to count records' });
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit) || 1;

    // ---------- DATA ----------
    const dataQuery = `
      SELECT *
      FROM records
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    db.all(
      dataQuery,
      [...params, limit, offset],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch records' });
        }

        res.json({
          data: rows,
          page,
          totalPages
        });
      }
    );
  });
});

// ===============================
// POST /records (create)
// ===============================
router.post('/', (req, res) => {
  const { description, amount } = req.body;

  if (!description || description.trim().length < 3) {
    return res.status(400).json({ error: 'Description must be at least 3 characters' });
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const query = `
    INSERT INTO records (description, amount)
    VALUES (?, ?)
  `;

  db.run(query, [description.trim(), parsedAmount], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create record' });
    }

    res.json({
      id: this.lastID,
      description: description.trim(),
      amount: parsedAmount
    });
  });
});

// ===============================
// PUT /records/:id (update)
// ===============================
router.put('/:id', (req, res) => {
  const { description, amount } = req.body;
  const id = parseInt(req.params.id, 10);

  if (!description || description.trim().length < 3) {
    return res.status(400).json({ error: 'Description must be at least 3 characters' });
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const query = `
    UPDATE records
    SET description = ?, amount = ?
    WHERE id = ?
  `;

  db.run(query, [description.trim(), parsedAmount, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update record' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true });
  });
});

// ===============================
// DELETE /records/:id
// ===============================
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const query = `DELETE FROM records WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete record' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true });
  });
});

module.exports = router;
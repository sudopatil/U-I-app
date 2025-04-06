var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET all users */
router.get('/users', async function (req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

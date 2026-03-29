const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.use(express.static(path.join(__dirname, '../dist/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/browser/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Node API running on port ${port}`);
});

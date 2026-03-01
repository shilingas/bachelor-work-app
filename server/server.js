const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/browser')));

// Example API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'test' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/browser/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Node API running on port ${port}`);
});

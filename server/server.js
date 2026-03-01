const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Example API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node API!' });
});

app.listen(port, () => {
  console.log(`Node API running on http://localhost:${port}`);
});

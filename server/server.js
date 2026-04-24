const express = require("express");
const client = require("prom-client");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "postgres-service",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "mydb",
  port: 5432,
});

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestCounter);

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("DB initialized");
}

initDb().catch((err) => {
  console.error("DB init failed:", err);
});

app.get("/", (req, res) => {
  res.send("Hello from bachelor app");
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get("/cpu", (req, res) => {
  let total = 0;
  for (let i = 0; i < 10_000_000; i++) {
    total += Math.sqrt(i);
  }
  res.json({ result: total });
});

app.get("/slow", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.json({ message: "slow response done" });
});

app.post("/items", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const result = await pool.query(
    "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *",
    [name, description || null]
  );

  res.status(201).json(result.rows[0]);
});

app.get("/items", async (req, res) => {
  const result = await pool.query("SELECT * FROM items ORDER BY id DESC LIMIT 100");
  res.json(result.rows);
});

app.get("/items/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM items WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "item not found" });
  }

  res.json(result.rows[0]);
});

app.put("/items/:id", async (req, res) => {
  const { name, description } = req.body;

  const result = await pool.query(
    "UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *",
    [name, description, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "item not found" });
  }

  res.json(result.rows[0]);
});

app.delete("/items/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [
    req.params.id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "item not found" });
  }

  res.json({ deleted: result.rows[0] });
});

app.listen(3000, () => {
  console.log("Main app running on 3000");
});

const metricsApp = express();

metricsApp.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

metricsApp.listen(3001, () => {
  console.log("Metrics server running on 3001");
});

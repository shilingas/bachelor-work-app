const express = require("express");
const client = require("prom-client");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from bachelor app");
});

app.listen(3000, () => {
  console.log("Main app running on 3000");
});


const metricsApp = express();
const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
});
register.registerMetric(httpRequestCounter);

metricsApp.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

metricsApp.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

metricsApp.listen(3001, () => {
  console.log("Metrics server running on 3001");
});

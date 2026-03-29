const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mydb',
  port: 5432,
});

module.exports = pool;

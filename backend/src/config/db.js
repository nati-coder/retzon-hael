const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
});
const query = (text, params) => pool.query(text, params).then(r => r.rows);
const migrate = () => pool.query(fs.readFileSync(path.join(__dirname, "../../db/schema.sql"), "utf8"));

module.exports = { query, migrate };

require("dotenv").config(); // Load environment variables
const { Pool } = require("pg");

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Optional: log unexpected errors on idle clients
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
  process.exit(1);
});

// Optional: test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

module.exports = pool;
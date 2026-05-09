const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      birth_date,
      email,
      password,
      role
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!first_name || !last_name || !birth_date || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // -----------------------------
    // Check existing user
    // -----------------------------
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // -----------------------------
    // Hash password
    // -----------------------------
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // -----------------------------
    // Insert user
    // -----------------------------
    const result = await pool.query(
      `
      INSERT INTO users (
        first_name,
        middle_name,
        last_name,
        birth_date,
        email,
        password_hash,
        user_role
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, first_name, last_name, email, birth_date, user_role
      `,
      [
        first_name,
        middle_name || null,
        last_name,
        birth_date,
        email,
        hashedPassword,
        role
      ]
    );

    return res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
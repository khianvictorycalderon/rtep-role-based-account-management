const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { SESSION_DURATION_HOURS } = require("../constants");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // -----------------------------
    // Find user
    // -----------------------------
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // -----------------------------
    // Check password
    // -----------------------------
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // -----------------------------
    // Expiry
    // -----------------------------
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000
    );

    // -----------------------------
    // Metadata
    // -----------------------------
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      null;

    const userAgent = req.headers["user-agent"] || "";

    // -----------------------------
    // Store session & get DB-generated ID
    // -----------------------------
    const result = await pool.query(
      `
      INSERT INTO sessions (
        user_id,
        ip,
        user_agent,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [user.id, ip, userAgent, expiresAt]
    );

    const sessionId = result.rows[0].id;

    // -----------------------------
    // Set cookie
    // -----------------------------
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: true,          // ✅ REQUIRED on Vercel (HTTPS)
      sameSite: "none",      // ✅ REQUIRED for cross-origin (frontend/backend)
      expires: expiresAt,
      path: "/",
    });

    // -----------------------------
    // Response
    // -----------------------------
    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
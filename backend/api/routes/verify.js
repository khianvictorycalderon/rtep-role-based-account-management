const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.json({
        authenticated: false,
      });
    }

    const result = await pool.query(
      `
      SELECT 
        users.id,
        users.email,
        users.user_role
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.id = $1
      AND sessions.expires_at > NOW()
      `,
      [sessionId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.json({
        authenticated: false,
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_role,
      },
    });

  } catch (err) {
    console.error("Verify check error:", err);

    return res.status(500).json({
      authenticated: false,
    });
  }
});

module.exports = router;
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/login-sessions — list all active sessions for the current user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const currentSessionId = req.cookies?.session_id;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND expires_at > NOW()`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated sessions
    const result = await pool.query(
      `
      SELECT
        id,
        ip,
        user_agent,
        browser,
        os,
        device,
        created_at,
        last_seen,
        expires_at
      FROM sessions
      WHERE user_id = $1
        AND expires_at > NOW()
      ORDER BY
        (id = $4) DESC,
        last_seen DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset, currentSessionId]
    );

    const sessions = result.rows.map((s) => ({
      ...s,
      is_current: s.id === currentSessionId,
    }));

    return res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Login sessions GET error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/login-sessions/:id — revoke a specific session
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const currentSessionId = req.cookies?.session_id;

    if (sessionId === currentSessionId) {
      return res.status(400).json({ message: "Cannot revoke your current session. Use logout instead." });
    }

    const result = await pool.query(
      `DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id`,
      [sessionId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.json({ message: "Session revoked successfully" });
  } catch (err) {
    console.error("Login sessions DELETE error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/login-sessions — revoke ALL other sessions (keep current)
router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.cookies?.session_id;

    await pool.query(
      `DELETE FROM sessions WHERE user_id = $1 AND id != $2 AND expires_at > NOW()`,
      [userId, currentSessionId]
    );

    return res.json({ message: "All other sessions revoked" });
  } catch (err) {
    console.error("Login sessions DELETE ALL error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
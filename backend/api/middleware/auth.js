const pool = require("../db");

module.exports = async function auth(req, res, next) {
  try {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({
        message: "Unauthorized",
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
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
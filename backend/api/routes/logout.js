const express = require("express");
const pool = require("../db");

const router = express.Router();

router.delete("/", async (req, res) => {
    try {
        const sessionId = req.cookies?.session_id;

        // Always clear cookie first (safe even if missing)
        res.clearCookie("session_id", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        // If no session cookie, still return success
        if (!sessionId) {
            return res.json({ success: true });
        }

        // Delete session from DB
        await pool.query(
            "DELETE FROM sessions WHERE id = $1",
            [sessionId]
        );

        return res.json({ success: true });

    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false });
    }
});

module.exports = router;
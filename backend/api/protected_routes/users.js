const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

/**
 * GET /api/users/me
 */
router.get("/me", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, first_name, middle_name, last_name, birth_date, email
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching user" });
  }
});

/**
 * PATCH /api/users/password
 */
router.patch("/password", async (req, res) => {
  try {
    const {
      current_password,
      new_password,
      confirm_password,
    } = req.body;

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [req.user.id]
    );

    const valid = await bcrypt.compare(
      current_password,
      result.rows[0].password_hash
    );

    if (!valid) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query(
      `
      UPDATE users
      SET password_hash=$1,
          updated_at=NOW()
      WHERE id=$2
      `,
      [hashed, req.user.id]
    );

    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating password" });
  }
});

/**
 * PATCH /api/users/:id
 */
router.patch("/:id", async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      first_name,
      middle_name,
      last_name,
      birth_date
    } = req.body;

    await pool.query(
      `
      UPDATE users
      SET first_name = $1,
          middle_name = $2,
          last_name = $3,
          birth_date = $4,
          updated_at = NOW()
      WHERE id = $5
      `,
      [
        first_name,
        middle_name,
        last_name,
        birth_date,
        req.user.id,
      ]
    );

    return res.json({ message: "User updated" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Update failed" });
  }
});

/**
 * DELETE /api/users/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [req.user.id]
    );

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await pool.query("DELETE FROM users WHERE id=$1", [req.user.id]);

    res.clearCookie("session_id");

    return res.json({ message: "Account deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
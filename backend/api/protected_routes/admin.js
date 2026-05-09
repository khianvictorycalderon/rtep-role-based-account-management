const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/test", async (req, res) => {
  return res.status(200).json({
    message: "You are an authorized for admin!"
  });
});

module.exports = router;
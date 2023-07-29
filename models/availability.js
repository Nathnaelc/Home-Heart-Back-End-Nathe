const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM availability");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/availability/:professionlId", async (req, res) => {
  try {
    const { professoinalId } = req.params;
    const { rows } = await db.query(
      `SELECT * FROM availability WHERE professional_id = $1`,
      [professoinalId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

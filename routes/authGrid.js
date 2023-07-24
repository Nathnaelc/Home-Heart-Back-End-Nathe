const express = require("express");
const router = express.Router();
const { pool } = require("../db/db");
const axios = require("axios");
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM medical_professionals");
  res.json(result.rows);
});

// router.get("/:id", async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await pool.query(
//       "SELECT * FROM medical_professionals WHERE professional_id = $1",
//       [id]
//     );
//     if (result.rows.length > 0) {
//       res.json(result.rows[0]); // return the first row if a match is found
//     } else {
//       res.status(404).json({ message: "Professional not found" });
//     }
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching professional",
//       error: err.message,
//     });
//   }
// });

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Get the recommended professionals from flask
    const response = await axios.get(
      `http://127.0.0.1:5000/recommendations?user_id=${id}`
    );
    const recommended_ids = response.data;
    let recommendedProfessionals = [];

    // Query Postgres for each recommended professional's details
    for (let i = 0; i < recommended_ids.length; i++) {
      const result = await pool.query(
        `SELECT * FROM medical_professionals WHERE professional_id = ${recommended_ids[i]}`
      );
      if (result.rows.length > 0) {
        recommendedProfessionals.push(result.rows[0]);
      }
    }
    // return the recommended professionals
    res.json(recommendedProfessionals);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching recommendations",
      error: err.message,
    });
  }
});

router.get("/recommendations/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // get the recommended professionals from flask
    const response = await axios.get(
      `http://127.0.0.1:5000/recommendations?user_id=${id}`
    );
    const recommended_ids = response.data;
    let recommendedProfessionals = [];

    // Query Postgres for each recommended professional's details
    for (let i = 0; i < recommended_ids.length; i++) {
      const result = await pool.query(
        `SELECT * FROM medical_professionals WHERE professional_id = ${recommended_ids[i]}`
      );
      if (result.rows.length > 0) {
        recommendedProfessionals.push(result.rows[0]);
        console.log(result.rows[0]);
      }
    }
    // return the recommended professionals
    res.json(recommendedProfessionals);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({
      message: "Error fetching recommendations",
      error: err.message,
    });
  }
});

module.exports = router;

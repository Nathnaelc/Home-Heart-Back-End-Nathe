const express = require("express");
const router = express.Router();
const { pool } = require("../db/db");
const axios = require("axios");
const MedicalProfessional = require("../models/medicalProfessional");
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM medical_professionals");
  res.json(result.rows);
});

// code for fetching a single professionals details
router.get("/professional_details/:id", async (req, res) => {
  const id = req.params.id;
  console.log("router called");
  try {
    const result = await MedicalProfessional.fetchMedicalProfessionalById(
      req.params.professional_id
    );
    if (result == null) {
      return res.status(200).json({
        message: "No professional found",
        result: [],
      });
    } else {
      console.log("result: ", result);
      return res.status(200).json({
        message: "Professional successfully got",
        result: result,
      });
    }
  } catch (err) {
    console.log("HERE");
    return;
  }
});

// code for recommeding professionals
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

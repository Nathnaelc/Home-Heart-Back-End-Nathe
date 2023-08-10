const express = require("express");
const router = express.Router();
const { pool } = require("../db/db");
const axios = require("axios");
const MedicalProfessional = require("../models/medicalProfessional");
const dotenv = require("dotenv");
dotenv.config();
const FLASK_URL = process.env.NODE_FLASK_URL || "http://127.0.0.1:5000";
console.log("FLASK_URL: ", FLASK_URL);

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM medical_professionals");
  res.json(result.rows);
});

// Code for fetching recommended professionals for a user
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Get the recommended professionals from Flask
    const response = await axios.get(
      `${FLASK_URL}/recommendations?user_id=${id}`
    );

    // Check if the response data is an array
    if (!Array.isArray(response.data)) {
      return res.status(500).json({
        message: "Invalid response from recommendation service",
      });
    }
    // Log the entire response object to inspect its structure
    // console.log("Entire response from Flask API:", response);
    // console.log("response.data: ", response.data);

    // Filter out NaN values since some ids are not numbers
    const recommended_ids = response.data
      .map((id) => Number(String(id).trim())) // Convert to Number after trimming
      .filter((id) => !isNaN(id));

    console.log("recommended_ids: ", recommended_ids);

    let recommendedProfessionals = [];

    // Query Postgres for each recommended professional's details
    for (let i = 0; i < recommended_ids.length; i++) {
      const result = await pool.query(
        "SELECT * FROM medical_professionals WHERE professional_id = $1",
        [recommended_ids[i]]
      );
      if (result.rows.length > 0) {
        recommendedProfessionals.push(result.rows[0]);
        // console.log(result.rows[0]);
      }
    }

    // Return the recommended professionals
    res.json(recommendedProfessionals);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({
      message: "Error fetching recommendations",
      error: err.message,
    });
  }
});

// code for fetching a single professionals details
router.get("/professional_details/:id", async (req, res) => {
  const id = req.params.id;
  // console.log("router called");
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
        message: "Professional successfully gotten",
        result: result,
      });
    }
  } catch (err) {
    // console.log("HERE");
    return;
  }
});

module.exports = router;

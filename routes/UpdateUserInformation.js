const express = require("express");
const router = express.Router();
const User = require("../models/user");
const db = require("../db/db.js");

router.put("/first_form/:id", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { countryOfOrigin, languagePreference, birthdate, gender, user_id } =
      req.body;

    await db.pool.query(
      "UPDATE users SET country_of_origin = $1, language_preference = $2, birth_date = $3, gender = $4 WHERE user_id = $5",
      [countryOfOrigin, languagePreference, birthdate, gender, user_id]
    );

    // Respond with success message or updated user data (optional)
    res.json({ message: "User information updated successfully" });
  } catch (error) {
    console.error("Error updating user information:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating user information" });
  }
});

router.put("/second_form/:id", async (req, res) => {
  try {
    const {
      country,
      city,
      state,
      streetAddress,
      timezone,
      postalCode,
      user_id,
    } = req.body;

    await db.pool.query(
      `
            UPDATE users SET country = $1, city = $2, state_province = $3, street_address = $4, time_zone = $5, postal_code = $6 WHERE user_id = $7 
        `,
      [country, city, state, streetAddress, timezone, postalCode, user_id]
    );

    return res.status(200).json({
      message: "User information updated successfully",
    });
  } catch (error) {
    console.log("error: ", error);
  }
});

router.put("/third_form/:id", async (req, res) => {
  try {
    const { profile_photo, user_id } = req.body;

    await db.pool.query(
      `
            UPDATE users SET profile_photo = $1 WHERE user_id = $2 
        `,
      [profile_photo, user_id]
    );

    return res.status(200).json({
      message: "User information updated successfully",
    });
  } catch (error) {
    console.log("error: ", error);
  }
});

module.exports = router;

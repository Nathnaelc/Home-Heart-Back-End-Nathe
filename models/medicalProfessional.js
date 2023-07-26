const db = require("../db/db.js");
const { BadRequestError, UnauthorizedError } = require("../utils/errors.js");

class MedicalProfessional {
  static async fetchMedicalProfessionalById(professional_id) {
    if (!professional_id) {
      throw new BadRequestError("No professional id provided");
    }

    try {
      const { rows } = await db.pool.query(
        "SELECT * FROM medical_professionals WHERE professional_id = $1",
        [professional_id]
      );
      return rows[0];
    } catch (error) {
      console.log("error: ", error);
    }
  }
  static async fetchMedicalProfessionalComments(professional_id) {
    if (!professional_id) {
      throw new BadRequestError("No professional id provided");
    }

    try {
      // Get all of the comments for this medical professional along with user_id
      const { rows } = await db.pool.query(
        "SELECT user_id, review_text, date_posted, rating FROM user_reviews WHERE professional_id = $1",
        [professional_id]
      );

      // Create an array to store the promises for fetching user details
      const promises = rows.map(async (row) => {
        // Fetch user's first and last name from the users table based on user_id
        const userData = await db.pool.query(
          "SELECT first_name, last_name FROM users WHERE user_id = $1",
          [row.user_id]
        );
        // Assign the user's first name and last name to the row object
        row.first_name = userData.rows[0].first_name;
        row.last_name = userData.rows[0].last_name;
        return row; // Return the updated row object
      });

      // Wait for all the promises to resolve
      const updatedRows = await Promise.all(promises);

      return updatedRows;
    } catch (err) {
      console.log("error:", err);
      throw new Error("Failed to fetch medical professional comments");
    }
  }
}

module.exports = MedicalProfessional;

const db = require("../db/db.js");
const { BadRequestError } = require("../utils/errors.js");

class User {
  static async saveMedicalProfessional(professionalJSONDATA) {
    if (!professionalJSONDATA) {
      throw new BadRequestError("No professional data provided");
    }

    try {
      const { user_id, professional_id, saved_status } = professionalJSONDATA;
      console.log("user_id: ", user_id);
      console.log("professional_id: ", professional_id);
      console.log("saved_status: ", saved_status);
      // We need to first make sure that the professional is not already saved by the user
      const existingRelationship = await db.pool.query(
        `
        SELECT * FROM relationships WHERE user_id = $1 AND professional_id = $2`,
        [user_id, professional_id]
      );
      // If the professional is already saved, return false
      if (existingRelationship.rows.length > 0) {
        return false;
      }

      // otherwise, insert the new relationship into the relationships table
      const { rows } = await db.pool.query(
        `
        INSERT INTO relationships (user_id, professional_id, status, date_created) 
        VALUES ($1, $2, $3, NOW())
        RETURNING *`,
        [user_id, professional_id, saved_status]
      );

      return rows[0];
    } catch (error) {
      console.log("error:", error);
    }
  }

  static async getSavedMedicalProfessionals(user_id) {
    if (!user_id) {
      throw new BadRequestError("No user id provided");
    }

    try {
      // this query returns the professional_id, status, and date_created for all saved professionals for a given user
      const { rows } = await db.pool.query(
        `
        SELECT professional_id, status, date_created 
        FROM relationships 
        WHERE user_id = $1 AND status = 'saved'`,
        [user_id]
      );

      // now we need to get the information about the medical professional
      // create an array to store the promises for fetching medical professional details
      const promises = rows.map(async (row) => {
        // Fetch medical professional's details from the medical_professionals table based on professional_id
        console.log("row:", row.professional_id);
        const professionalData = await db.pool.query(
          "SELECT * FROM medical_professionals WHERE professional_id = $1",
          [row.professional_id]
        );
        // console.log("professionalDataRow: ", professionalData.rows);
        // Assign the medical professional's details to the row object

        return professionalData.rows[0]; // Return the updated row object
      });

      // Wait for all the promises to resolve
      const updatedRows = await Promise.all(promises);
      return updatedRows;
    } catch (error) {
      console.log("error:", error);
    }
  }

  static async createNewMedicalProfessionalComment(commentData) {
    if (!commentData) {
      throw new BadRequestError("No comment data provided");
    }

    try {
      const { rows } = await db.pool.query(
        "INSERT INTO user_reviews (user_id, professional_id, review_text, rating, review_heading, date_posted) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
        [
          commentData.user_id,
          commentData.professional_id,
          commentData.comment,
          commentData.rating,
          commentData.heading,
        ]
      );
      return rows[0];
    } catch (err) {
      console.log("error:", err);
    }
  }

  static async deleteSavedMedicalProfessional(user_id, professional_id) {
    if (!user_id || !professional_id) {
      throw new BadRequestError("No user id or professional id provided");
    }

    try {
      // this query deletes the relationship between the user and the professional
      const { rows } = await db.pool.query(
        `
        DELETE FROM relationships 
        WHERE user_id = $1 AND professional_id = $2`,
        [user_id, professional_id]
      );
      // now we need to get the information about the medical professional
      // create an array to store the promises for fetching medical professional details
      const promises = rows.map(async (row) => {
        // Fetch medical professional's details from the medical_professionals table based on professional_id
        // console.log("row:", row.professional_id);
        const professionalData = await db.pool.query(
          "SELECT * FROM medical_professionals WHERE professional_id = $1",
          [row.professional_id]
        );
        // console.log("professionalDataRow: ", professionalData.rows);
        // Assign the medical professional's details to the row object
        return professionalData.rows[0]; // Return the updated row object
      });
      // Wait for all the promises to resolve
      const updatedRows = await Promise.all(promises);
      return updatedRows;
    } catch (error) {
      console.log("error:", error);
    }
  }
}

module.exports = User;

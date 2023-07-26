const db = require("../db/db.js");
const { BadRequestError } = require("../utils/errors.js");

class User {
  static async saveMedicalProfessional(professionalJSONDATA) {
    if (!professionalJSONDATA) {
      throw new BadRequestError("No professional data provided");
    }

    const { professional, user_id } = professionalJSONDATA;

    if (!professional) {
      throw new BadRequestError("No professional data provided");
    }
    // Check if the professional object contains all the required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "country",
      "language_proficiency",
      "rating",
      "specialization",
      "years_of_experience",
    ];

    requiredFields.forEach((field) => {
      if (!professional.hasOwnProperty(field)) {
        throw new BadRequestError(
          `Missing required field - ${field} - in request body.`
        );
      }
    });

    try {
      // Retrieve the current array of JSON objects from the database
      const { rows } = await db.pool.query(
        "SELECT saved_professionals FROM relationships WHERE user_id = $1",
        [user_id]
      );

      const savedProfessionalsArray = rows[0]?.saved_professionals || [];

      // Check if the object already exists in the array (based on a unique identifier, e.g., professional_id)
      const isDuplicate = savedProfessionalsArray.some(
        (item) =>
          JSON.parse(item).professional_id === professional.professional_id
      );

      if (isDuplicate) {
        return false;
      }

      // Add the new JSON object string to the updatedProfessionalsArray
      const jsonString = JSON.stringify(professional);
      const updatedProfessionalsArray = [
        ...savedProfessionalsArray,
        jsonString,
      ];

      // Execute the SQL query to update the column with the updated JSON data array
      await db.pool.query(
        "UPDATE relationships SET saved_professionals = $1 WHERE user_id = $2",
        [updatedProfessionalsArray, user_id]
      );

      // Return some success message or result if needed
      return { success: true, message: "Professional data saved successfully" };
    } catch (error) {
      // Handle any database or other errors that may occur during the query
      console.error("Error saving professional data:", error);
      throw new Error("Failed to save professional data");
    }
  }

  static async getSavedMedicalProfessionals(user_id) {
    const query = `
        SELECT saved_professionals
        FROM relationships
        WHERE user_id = $1;
        `;

    try {
      // Execute the SQL query with the parameters using pool.query
      const result = await db.pool.query(query, [user_id]);

      // If the result contains rows of data, parse the JSON strings back into an array of objects
      if (result.rows.length > 0) {
        const savedProfessionalsArray =
          result.rows[0].saved_professionals || [];
        const savedProfessionalsObjects = savedProfessionalsArray.map((item) =>
          JSON.parse(item)
        );
        return savedProfessionalsObjects;
      }

      // Return an empty array if no rows were returned from the query
      return [];
    } catch (error) {
      // Handle any database or other errors that may occur during the query
      console.error("Error retrieving saved professionals:", error);
      throw new Error("Failed to retrieve saved professionals");
    }
  }

  static async deleteSavedMedicalProfessional(user_id, professional_id) {
    try {
      // Retrieve the current array of JSON objects from the database
      const { rows } = await db.pool.query(
        "SELECT saved_professionals FROM relationships WHERE user_id = $1",
        [user_id]
      );

      const savedProfessionalsArray = rows[0]?.saved_professionals || [];

      // Find the index of the professional to delete based on the unique identifier (e.g., professional_id)
      const indexToDelete = savedProfessionalsArray.findIndex(
        (item) => JSON.parse(item).professional_id === professional_id
      );

      if (indexToDelete === -1) {
        throw new Error("Professional not found in the saved list.");
      }

      // Remove the professional object from the array
      savedProfessionalsArray.splice(indexToDelete, 1);

      // Execute the SQL query to update the column with the updated JSON data array
      await db.pool.query(
        "UPDATE relationships SET saved_professionals = $1 WHERE user_id = $2",
        [savedProfessionalsArray, user_id]
      );

      // Return some success message or result if needed
      return {
        success: true,
        message: "Professional data deleted successfully",
      };
    } catch (error) {
      // Handle any database or other errors that may occur during the query
      console.error("Error deleting professional data:", error);
      throw new Error("Failed to delete professional data");
    }
  }

  static async createNewMedicalProfessionalComment(commentData) {
    console.log("commentData: ", commentData);
    console.log("date", commentData.date_posted);
    if (!commentData) {
      throw new BadRequestError("No comment data provided");
    }

    try {
      const { rows } = await db.pool.query(
        "INSERT INTO user_reviews (user_id, professional_id, review_text, rating, date_posted) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
        [
          commentData.user_id,
          commentData.professional_id,
          commentData.comment,
          commentData.rating,
        ]
      );
      return rows[0];
    } catch (err) {
      console.log("error:", err);
    }
  }
}

module.exports = User;

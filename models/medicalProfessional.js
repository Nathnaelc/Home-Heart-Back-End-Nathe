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
}

module.exports = MedicalProfessional;

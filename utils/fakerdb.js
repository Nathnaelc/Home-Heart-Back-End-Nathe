// needed for inserting/updating record of the medical professionals from the json file("medical_professionals_with_bios.json")
const fs = require("fs");
const pgp = require("pg-promise")();

console.log("Script is running...");

const db = pgp(
  "postgres://postgres:postgres@localhost:5432/homeheart_database"
);

const professionals = JSON.parse(
  fs.readFileSync("./medical_professionals_with_bios.json", "utf-8")
);

professionals.forEach((professional) => {
  db.oneOrNone(
    "SELECT * FROM medical_professionals WHERE email = $1",
    professional.email
  )
    .then((existingProfessional) => {
      if (existingProfessional) {
        // Professional already exists, update the record instead of inserting
        return db.none(
          "UPDATE medical_professionals SET first_name = $1, last_name = $2, contact_number = $3, years_of_experience = $4, country_of_operation = $5, language_proficiency = $6, specialization = $7, qualification = $8, rating = $9, date_joined = $10, street_address = $11, city = $12, state_province = $13, country = $14, postal_code = $15, latitude = $16, longitude = $17, verification_document = $18, price = $19, availability_start_time = $20, availability_end_time = $21, time_zone = $22, bio = $23 WHERE email = $24",
          [
            professional.first_name,
            professional.last_name,
            professional.contact_number,
            professional.years_of_experience,
            professional.country_of_operation,
            professional.language_proficiency,
            professional.specialization,
            professional.qualification,
            professional.rating,
            professional.date_joined,
            professional.street_address,
            professional.city,
            professional.state_province,
            professional.country,
            professional.postal_code,
            professional.latitude,
            professional.longitude,
            professional.verification_document,
            professional.price,
            professional.availability_start_time,
            professional.availability_end_time,
            professional.time_zone,
            professional.bio,
            professional.email,
          ]
        );
      } else {
        // Professional doesn't exist, insert a new record
        return db.none(
          "INSERT INTO medical_professionals (professional_id, first_name, last_name, email, contact_number, years_of_experience, country_of_operation, language_proficiency, specialization, qualification, rating, date_joined, street_address, city, state_province, country, postal_code, latitude, longitude, verification_document, price, availability_start_time, availability_end_time, time_zone, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)",
          [
            professional.professional_id,
            professional.first_name,
            professional.last_name,
            professional.email,
            professional.contact_number,
            professional.years_of_experience,
            professional.country_of_operation,
            professional.language_proficiency,
            professional.specialization,
            professional.qualification,
            professional.rating,
            professional.date_joined,
            professional.street_address,
            professional.city,
            professional.state_province,
            professional.country,
            professional.postal_code,
            professional.latitude,
            professional.longitude,
            professional.verification_document,
            professional.price,
            professional.availability_start_time,
            professional.availability_end_time,
            professional.time_zone,
            professional.bio,
          ]
        );
      }
    })
    .catch((err) => {
      console.log(
        `Error inserting/updating professional with id ${professional.professional_id}: `,
        err
      );
    });
});

console.log("Script finished running");

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "homeheart_database",
  password: "postgres",
  port: 5432,
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};

// code for manually creating tables in postgres pgadmin
// const usersSqlScript = `
// CREATE TABLE IF NOT EXISTS users (
//     user_id SERIAL PRIMARY KEY,
//     google_id VARCHAR(255) UNIQUE NOT NULL,
//     username VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     phone_number VARCHAR(255),
//     first_name VARCHAR(255),
//     last_name VARCHAR(255),
//     birth_date DATE,
//     profile_photo VARCHAR(255),
//     gender VARCHAR(50),
//     country_of_origin VARCHAR(255),
//     language_preference VARCHAR(255),
//     date_joined DATE NOT NULL,
//     last_login DATE,
//     street_address VARCHAR(255),
//     city VARCHAR(255),
//     state_province VARCHAR(255),
//     country VARCHAR(255),
//     postal_code VARCHAR(255),
//     latitude FLOAT,
//     longitude FLOAT,
//     time_zone VARCHAR(255)
// )`;

// const medicalProSqlScript = `
// CREATE TABLE IF NOT EXISTS medical_professionals (
//     professional_id INTEGER PRIMARY KEY,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     contact_number VARCHAR(255),
//     years_of_experience INTEGER,
//     country_of_operation VARCHAR(255),
//     language_proficiency VARCHAR(255),
//     specialization VARCHAR(255),
//     qualification VARCHAR(255),
//     rating FLOAT,
//     date_joined DATE NOT NULL,
//     street_address VARCHAR(255),
//     city VARCHAR(255),
//     state_province VARCHAR(255),
//     country VARCHAR(255),
//     postal_code VARCHAR(255),
//     latitude FLOAT,
//     longitude FLOAT,
//     verification_document VARCHAR(255),
//     price INTEGER,
//     availability_start_time TIME,
//     availability_end_time TIME,
//     time_zone VARCHAR(255)
// )`;

// const serReviewSqlScript = `
// CREATE TABLE IF NOT EXISTS user_reviews (
//     review_id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(user_id),
//     professional_id INTEGER REFERENCES medical_professionals(professional_id),
//     rating FLOAT,
//     review_text VARCHAR(255),
//     date_posted DATE
// )`;

// const conversationSqlScript = `
// CREATE TABLE IF NOT EXISTS messages (
//     message_id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(user_id),
//     professional_id INTEGER REFERENCES medical_professionals(professional_id),
//     message_text VARCHAR(255),
//     chat_time DATE
// )
// `;
// const relationshipsSqlScript = `
// CREATE TABLE IF NOT EXISTS relationships (
//     relationship_id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(user_id),
//     professional_id INTEGER REFERENCES medical_professionals(professional_id),
//     status VARCHAR(255),
//     date_created DATE NOT NULL
// )`;

// const executeSql = async (sql) => {
//   try {
//     const result = await pool.query(sql);
//     console.log(`SQL script executed successfully.`);
//   } catch (err) {
//     console.log(`Error executing SQL script: ${err.message}`);
//   }
// };

// Now you can use this function to execute your SQL scripts:

// executeSql(usersSqlScript);
// executeSql(medicalProSqlScript);
// executeSql(serReviewSqlScript);
// executeSql(conversationSqlScript);
// executeSql(relationshipsSqlScript);

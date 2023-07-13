const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../db/db");
const BYCRYPT_SALT_ROUNDS = require("../config");

router.post("/register", async (req, res) => {
  const { username, email, password, phone_number, first_name, last_name } =
    req.body;
  try {
    // using bcrypt to hash the password before storing
    const salt = await bcrypt.genSalt(BYCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    const email = email.toLowerCase();
    // query for adding the user to the database
    const createUserQuery = `INSERT INTO users (
        username,
        email,
        password,
        first_name,
        last_name,
      )
      VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const values = [username, email, hashedPassword, first_name, last_name];
    const result = await pool.query(createUserQuery, values);
    const user = result.rows[0];

    // JWT (JSON Web Token) is used for authentication. The token includes the user details
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      "secret-key-unique",
      {
        expiresIn: "24h",
      }
    );
    // Returning a successful registration response along with the user data and token
    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
      token: token,
    });
    // Catch any errors during the registration process
  } catch (err) {
    console.log("Error registering user: " + err);
    res.status(500).json({
      message: "Error registering user",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const getUserQuery = `SELECT * FROM users WHERE email = $1 OR username = $2`;
    const result = await pool.query(getUserQuery, [email, username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
    // JWT (JSON Web Token) is used for authentication. The token includes the user details
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      "secret-key-unique",
      {
        expiresIn: "24h",
      }
    );
    // Returning a successful login response along with the user data and token
    res.status(200).json({
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.log("Error logging in user: " + err);
    res.status(500).json({
      message: "Error logging in user",
      error: err.message,
    });
  }
});

module.exports = router;

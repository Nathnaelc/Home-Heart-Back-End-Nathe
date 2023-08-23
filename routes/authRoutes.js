// Router endpoints for handling [login, registration, google login, logout]
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pool } = require("../db/db");
const { BYCRYPT_SALT_ROUNDS } = require("../db/db");
const User = require("../models/user");

router.post("/googleauth", async (req, res) => {
  const { firstName, email } = req.body;

  try {
    // Query the database for a user with the provided email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      // If the user exists, authenticate them and send a response
      const user = result.rows[0];
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        "secret-key-unique",
        {
          expiresIn: "24h",
        }
      );

      res.json({
        message: "User authenticated successfully",
        token: token,
        userId: user.user_id,
      });
    } else {
      // If the user does not exist, send a response indicating that they need to register
      res.json({ message: "User not found, please register" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register endpoint for handling user registration
router.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  try {
    // using bcrypt to hash the password before storing
    const salt = await bcrypt.genSalt(BYCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    // query for adding the user to the database
    const createUserQuery = `INSERT INTO users (
        user_id,
        username,
        email,
        password,
        first_name,
        last_name
      )
      VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *;`;
    const values = [
      username,
      email.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
    ];
    const result = await pool.query(createUserQuery, values);
    const user = result.rows[0];

    // JWT (JSON Web Token) is used for authentication. The token includes the user details
    const token = jwt.sign(
      {
        userId: user.user_id,
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
    console.log(err.stack);
    res.status(500).json({
      message: "Error registering user",
      error: err.stack,
    });
  }
});

// Login endpoint for handling user login using username/email and password
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const getUserQuery = `SELECT * FROM users WHERE username = $1`;
    const result = await pool.query(getUserQuery, [username]);
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
        userId: user.user_id,
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
        userId: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.log("Error logging in user: ", err);
    res.status(500).json({
      message: "Error logging in user",
      error: err.stack,
    });
  }
});

router.post("/createUserComment", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    const result = await User.createNewMedicalProfessionalComment(req.body);
    console.log("result: ", result);
    return res.status(200).json({
      message: "Comment successfully created",
      result: result,
    });
  } catch (err) {
    console.log("error:", err);
  }
});

module.exports = router;

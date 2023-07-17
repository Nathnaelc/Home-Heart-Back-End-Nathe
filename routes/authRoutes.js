const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pool } = require("../db/db");
const { BYCRYPT_SALT_ROUNDS } = require("../config");
const passport = require("passport");
require("./authGoogle.js");

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  function (req, res) {
    console.log("Google callback route called");

    if (req.user) {
      const token = jwt.sign(
        {
          userId: req.user.id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
        },
        "secret-key-unique",
        {
          expiresIn: "24h",
        }
      );

      // Store the token in a cookie so it can be accessed by the client-side JavaScript
      res.cookie("token", token, { httpOnly: true });

      // Redirect to a page that is only accessible by authenticated users
      res.redirect("/authenticated-page");
    } else {
      // Redirect to an error page
      res.redirect("/account-not-registered");
    }
  }
);

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
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
      first_name,
      last_name,
    ];
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
    console.log(err.stack);
    res.status(500).json({
      message: "Error registering user",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const getUserQuery = `SELECT * FROM users WHERE email = $1 OR username = $1`;
    const result = await pool.query(getUserQuery, [identifier]);
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
        userId: user.id,
        username: user.username,
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

// Google authnetication strategy function
require("dotenv").config();

const passport = require("passport");
const { pool } = require("../db/db");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
//to be changed to env later
// google strategy function
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/api/auth/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log("GoogleStrategy callback function called");
      const googleEmail = profile.emails[0].value;
      try {
        // Look up the user in your database using the Google ID in `profile.id`
        let result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
          googleEmail,
        ]);
        console.log("User query result:", result.rows[0]);

        if (result.rows.length === 0) {
          // If the user doesn't exist, create a new user with the information from `profile`
          return done(null, false, {
            message: "No user with that email in our records.",
          });
        }
        let user = result.rows[0];
        // check if the user was found and log them in
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  if (user) {
    cb(null, user.user_id);
  } else {
    cb(new Error("User not found"), null);
  }
});

passport.deserializeUser(async function (id, cb) {
  let result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  if (result.rows.length > 0) {
    let user = result.rows[0];
    done(null, user.user_id);
  } else {
    done(new Error(`User with id ${user_id} not found`), null);
  }
});

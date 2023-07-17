const passport = require("passport");
const pool = require("../db/db");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
//to be changed to env later
const GOOGLE_CLIENT_ID =
  "1009712286202-8u48bqqmub8um46dpcjk1hgvlhkmt1aa.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/google/callback",
      passReqToCallback: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Look up the user in your database using the Google ID in `profile.id`
        let user = await pool.query(
          `SELECT * FROM users WHERE google_id = $1`,
          [profile.id]
        );

        if (user.rows.length === 0) {
          // If the user doesn't exist, create a new user with the information from `profile`
          const createUserQuery = `INSERT INTO users (google_id, username, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
          const values = [
            profile.id,
            profile.username,
            profile.emails[0].value,
            profile.name.givenName,
            profile.name.familyName,
          ];
          const result = await pool.query(createUserQuery, values);
          user = result.rows[0];
        }
        // Call `cb` with the user object to continue the authentication process
        cb(null, user);
      } catch (err) {
        console.log(err);
      }
    }
  )
);
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  pool.query(`SELECT * FROM users WHERE id = $1`, [id], function (err, result) {
    cb(err, result.rows[0]);
  });
});

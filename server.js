//Imporing required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug");
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");

// Creating an express application
const app = express();
const authRoutes = require("./routes/authRoutes");

// Enabling Cross-Origin Resource Sharing (CORS) with default configuration
app.use(cors());

// Setting up morgan to log HTTP requests in the 'dev' format
app.use(morgan("dev"));

// Enabling express to parse JSON bodies from HTTP requests
app.use(express.json());

// Adding routes for authentication, exercises, and nutrition endpoints

app.use("/api/auth", authRoutes); // route for the authentication pages (authRoutes.js)

// Set up session middleware
app.use(
  session({
    secret: "your-session-secret", // replace with your own session secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if you're using https
  })
);

// Initialize Passport and its session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

app.get("/auth/google/callback", function (req, res, next) {
  passport.authenticate("google", function (err, user, info) {
    if (err) {
      console.error("Authentication error:", err);
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

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

// Enabling Cross-Origin Resource Sharing (CORS) with default configuration
app.use(cors());

// Setting up morgan to log HTTP requests in the 'dev' format
app.use(morgan("dev"));

// Enabling express to parse JSON bodies from HTTP requests
app.use(express.json());

// Set up session middleware
app.use(
  session({
    secret: "your-session-secret", // I will replace with a secret later
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // false since we use http only
  })
);
// Initialize Passport and its session middleware
app.use(passport.initialize());
app.use(passport.session());

// middleware for parsing cookies
const cookieParser = require("cookie-parser");

app.use(cookieParser());

// Adding routes for authentication
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes); // route for the authentication pages (authRoutes.js)

app.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

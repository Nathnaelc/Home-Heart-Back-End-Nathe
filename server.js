//Imporing required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug");
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const postCommentRouter = require("./routes/PostComment");
const medicalProfessionalRouter = require("./routes/authMedProf");

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

// Adding routes for recommended professionals
const gridRouter = require("./routes/authGrid");
app.use("/api/recommended_professionals", gridRouter);
app.use("/api/recommendations", gridRouter);
app.use("/api/professional_details/:id", gridRouter);

// Route for saved professionals
const savedProfessionalsRouter = require("./routes/authSavedProfessionals");
app.use("/api/saved_professionals", savedProfessionalsRouter);

app.use("/api/post_comment", postCommentRouter);

// not clear why this is here? 
// const medicalProfessionalRouter = require("./routes/authMedProf");
app.use("/api/medical_professional", medicalProfessionalRouter);

// erorr detail printing
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.toString() });
});

app.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

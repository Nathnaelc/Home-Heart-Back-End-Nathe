//Imporing required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug");
const PORT = process.env.PORT || 3001;

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

// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

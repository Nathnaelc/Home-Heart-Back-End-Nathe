//Imporing required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug");
const dotenv = require("dotenv");
dotenv.config();
const db = require("./db/db.js");
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const postCommentRouter = require("./routes/PostComment");
const medicalProfessionalRouter = require("./routes/authMedProf");
const savedProfessionalsRouter = require("./routes/SavedProfessionals");
const appointmentsRouter = require("./routes/appointmentsApi");
const UpdateUserInformationRouter = require("./routes/UpdateUserInformation");

// Creating an express application
const app = express();

// Enabling Cross-Origin Resource Sharing (CORS) with default configuration
const corsOptions = {
  origin: ["https://homeheartui-wi1z.onrender.com", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Setting up morgan to log HTTP requests in the 'dev' format
app.use(morgan("dev"));

// Enabling express to parse JSON bodies from HTTP requests
app.use(express.json());

// Enabling express to parse URL-encoded bodies from HTTP requests
// interpret the body data sent through requests (e.g. req.body) as JSON object
app.use(bodyParser.urlencoded({ extended: true }));

// Adding routes for authentication
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes); // route for the authentication pages (authRoutes.js)

// Adding routes for recommended professionals
const gridRouter = require("./routes/authGrid");

app.use("/api/recommended_professionals", gridRouter);
app.use("/api/recommendations", gridRouter);
app.use("/api/professional_details/:id", gridRouter);

// Adding routes for appointments
app.use("/api/appointments", appointmentsRouter);

// Route for saved professionals
app.use("/api/saved_professionals", savedProfessionalsRouter);

app.use("/api/post_comment", postCommentRouter);

app.use("/api/medical_professional", medicalProfessionalRouter);

app.use("/api/update_user_information", UpdateUserInformationRouter);

// erorr detail printing
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.toString() });
});

// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

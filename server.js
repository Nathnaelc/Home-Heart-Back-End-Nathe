//Imporing required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const debug = require("debug");
const cron = require('node-cron');
const db = require("./db/db.js");
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const postCommentRouter = require("./routes/PostComment");
const medicalProfessionalRouter = require("./routes/authMedProf");
const savedProfessionalsRouter = require("./routes/SavedProfessionals");
const appointmentsRouter = require("./routes/appointmentsApi");
const UpdateUserInformationRouter = require("./routes/UpdateUserInformation")
// Vonage is for sneding SMS messages to users
const { Vonage } = require('@vonage/server-sdk')
const moment = require("moment-timezone");
// Creating an express application
const app = express();

// Enabling Cross-Origin Resource Sharing (CORS) with default configuration
app.use(cors());

// Setting up morgan to log HTTP requests in the 'dev' format
app.use(morgan("dev"));

// Enabling express to parse JSON bodies from HTTP requests
app.use(express.json());

// Enabling express to parse URL-encoded bodies from HTTP requests
// interpret the body data sent through requests (e.g. req.body) as JSON object
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});



// create a new instance of the Vonage SMS API
const vonage = new Vonage({
  apiKey: "b9331935",
  apiSecret: "fRzHumnQUKaPN4By"
})

// this senders phone number
const from = "17607097308" // Replace with your Vonage virtual number

// this sets it so that the cron jobs run every 30 minutes (you can adjust this for testing purposes) 
const cronTimeOffsetInMinutes = 30;
const cronTime = `*/${cronTimeOffsetInMinutes} * * * *`;

// this function sends an SMS message to the specified phone number
async function sendSMS(to, text) {
  await vonage.sms.send({to, from, text})
      .then(resp => { console.log('Message sent successfully'); console.log(resp); })
      .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

// this cron job runs every 30 minutes and sends SMS reminders to users who have appointments scheduled within the next 24 hours
cron.schedule(cronTime, async () => {
  console.log('Running cron job...');

  // Get the current date and the date 24 hours from now
  const currentDate = new Date();
  // get the date 24 hours from now
  const twentyFourHoursFromNow = new Date(currentDate);
  // add 24 hours to the date
  twentyFourHoursFromNow.setDate(twentyFourHoursFromNow.getDate() + 1);

  // Get appointments that are scheduled within the next 24 hours
  try {
    // Get appointments that are scheduled within the next 24 hours
    const result = await db.query("SELECT * FROM appointments WHERE status = 'Scheduled' AND appointment_start >= $1 AND appointment_start < $2", [currentDate, twentyFourHoursFromNow]); 
    const appointments = result.rows;

    // Send SMS reminders for each appointment
    for (const appointment of appointments) {
      const message = `[HOMEHEART] Hi, this is a reminder that you have an appointment on ${appointment.appointment_start.toLocaleString()}.`;
      console.log(message);
      await sendSMS("17737321234", message);
    }
  } catch (error) {
    console.error('Error retrieving or sending SMS reminders:', error);
  }
});








// Start listening on the defined port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});

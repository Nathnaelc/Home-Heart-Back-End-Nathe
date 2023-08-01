/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure the email transport using the default SMTP transport and a GMail account.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendEmailConfirmation = functions.https.onRequest((req, res) => {
  const email = req.query.email;
  const mailOptions = {
    from: '"Your Project Name" <noreply@yourproject.firebaseapp.com>',
    to: email,
  };

  // Building Email message.
  mailOptions.subject = "Thanks for booking with us!";
  mailOptions.text =
    "Your appointment has been successfully booked. See you soon!";

  try {
    mailTransport.sendMail(mailOptions);
    console.log(`New confirmation email sent to:`, email);
    res.status(200).send("Email sent!");
  } catch (error) {
    console.error("There was an error while sending the email:", error);
    res.status(500).send("Error sending email");
  }
});

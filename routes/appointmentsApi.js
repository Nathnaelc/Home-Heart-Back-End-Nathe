const express = require("express");
const router = express.Router();
const db = require("../db/db.js");
const moment = require("moment-timezone");
const mailgun = require("mailgun-js");
const APIKEY = "d4a659af5d8d56d051645578a9f6742f-4e034d9e-6599eb47";
const DOMAIN = "sandbox1c54a3a4aae944a296adc38786b38997.mailgun.org";
const mg = mailgun({
  apiKey: APIKEY,
  domain: DOMAIN,
});

// GET all appointments
// the endpoint is /api/appointments with GET method
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM appointments");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET all appointments of a professional for a specific user
// the endpoint is /api/appointments/availability/:professionalId with GET method
router.get("/availability/:professionalId", async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { rows } = await db.query(
      "SELECT * FROM availability WHERE professional_id = $1",
      [professionalId]
    );
    // Convert start_time and end_time to local timezone before sending them to the front end
    const availabilities = rows.map((row) => ({
      ...row,
      start_time: moment(row.start_time, "HH:mm:ss")
        .tz("America/Los_Angeles")
        .format("HH:mm:ss"),
      end_time: moment(row.end_time, "HH:mm:ss")
        .tz("America/Los_Angeles")
        .format("HH:mm:ss"),
    }));

    res.json(availabilities);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all appointments of a user
// the endpoint is /api/appointments/user/:userId with GET method
router.get("/upcoming_appointments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await db.query(
      "SELECT * FROM appointments WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// booking functionality based on availability
// the endpoint is /api/appointments/booking with POST method
router.post("/booking", async (req, res) => {
  try {
    const {
      user_id,
      professional_id,
      appointment_start,
      appointment_end,
      status,
    } = req.body;

    const formatAppointmentStart = moment(
      appointment_start,
      "YYYY-MM-DD HH:mm:ss"
    ).format("YYYY-MM-DD HH:mm:ss");
    const formatAppointmentEnd = moment(
      appointment_end,
      "YYYY-MM-DD HH:mm:ss"
    ).format("YYYY-MM-DD HH:mm:ss");

    // console.log(`formatAppointmentStart: ${formatAppointmentStart}`);
    // console.log(`formatAppointmentEnd: ${formatAppointmentEnd}`);

    // Convert the date to a day of the week so I can match it with the professional's availability table
    const date = new Date(formatAppointmentStart.split(" ")[0]);
    const dayOfWeek = date.getDay();

    // Fetch the professional's availability for the selected day of the week
    const { rows: availabilities } = await db.query(
      "SELECT * FROM availability WHERE professional_id = $1 AND day_of_week = $2",
      [professional_id, dayOfWeek]
    );

    // console.log(`availabilities: ${JSON.stringify(availabilities)}`);

    // Check if selected time slot is within professional's availability
    const selectedStartTime = moment(
      formatAppointmentStart,
      "YYYY-MM-DD HH:mm:ss"
    );
    const selectedEndTime = moment(formatAppointmentEnd, "YYYY-MM-DD HH:mm:ss");
    const isWithinAvailability = availabilities.some((avail) => {
      const availStartTime = moment(
        formatAppointmentStart.split(" ")[0] + " " + avail.start_time,
        "YYYY-MM-DD hh:mm:ss A"
      );
      const availEndTime = moment(
        formatAppointmentStart.split(" ")[0] + " " + avail.end_time,
        "YYYY-MM-DD hh:mm:ss A"
      );
      console.log(`avail.start_time: ${avail.start_time}`);
      console.log(`avail.end_time: ${avail.end_time}`);
      console.log(`selectedStartTime: ${selectedStartTime.format("HH:mm:ss")}`);
      console.log(`selectedEndTime: ${selectedEndTime.format("HH:mm:ss")}`);
      return (
        selectedStartTime.isBetween(availStartTime, availEndTime, null, "[]") &&
        selectedEndTime.isBetween(availStartTime, availEndTime, null, "[]")
      );
    });

    // console.log(`isWithinAvailability: ${isWithinAvailability}`);

    // If not, return error
    if (!isWithinAvailability) {
      return res.status(400).json({
        message: "Selected time slot is not within professional's availability",
      });
    }

    // Check if selected time slot overlaps with other appointments
    const { rows: existingAppointments } = await db.query(
      "SELECT * FROM appointments WHERE professional_id = $1",
      [professional_id]
    );

    // check if the appointment is overlapping with any existing appointments
    const isOverlapping = existingAppointments.some((app) => {
      const appStart = moment(app.appointment_start, "YYYY-MM-DD HH:mm:ss");
      const appEnd = moment(app.appointment_end, "YYYY-MM-DD HH:mm:ss");
      return (
        selectedStartTime.isBetween(appStart, appEnd, null, "()") ||
        selectedEndTime.isBetween(appStart, appEnd, null, "()") ||
        (selectedStartTime.isSameOrBefore(appStart) &&
          selectedEndTime.isSameOrAfter(appEnd))
      );
    });

    if (isOverlapping) {
      return res.status(400).json({
        message: "Selected time slot overlaps with an existing appointment",
      });
    }

    // If everything is fine, create the appointment
    const { rows } = await db.query(
      "INSERT INTO appointments (user_id, professional_id, appointment_start, appointment_end, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        user_id,
        professional_id,
        formatAppointmentStart,
        formatAppointmentEnd,
        status,
      ]
    );
    console.log("Appointment booked successfully:", rows[0]);

    // Fetch the user's email based on their ID to send them email
    const { rows: userRows } = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    // getting the user's email
    let userEmail;
    // Check if we got a user and an email
    if (userRows.length > 0 && userRows[0].email) {
      userEmail = userRows[0].email;
    } else {
      // console.error("Could not find email for user with ID:", user_id);
      // return or throw an error if you want to stop here
    }
    // console.log("the user rows are:", userRows);

    // getitng the user's name
    let userName;
    if (
      userRows.length > 0 &&
      userRows[0].first_name &&
      userRows[0].last_name
    ) {
      userName = `${userRows[0].first_name} ${userRows[0].last_name}`;
    } else {
      // console.error("Could not find name for user with ID:", user_id);
    }

    // getting the professional's info
    // Fetch the professional's name based on their ID
    const { rows: professionalRows } = await db.query(
      "SELECT last_name FROM medical_professionals WHERE professional_id = $1",
      [professional_id]
    );

    // console.log("The professional rows", professionalRows);

    let professionalName;
    if (professionalRows.length > 0 && professionalRows[0].last_name) {
      professionalName = professionalRows[0].last_name;
    } else {
      console.error(
        "Could not find name for professional with ID:",
        professional_id
      );
      // return or throw an error if you want to stop here
    }

    const appointmentDate = formatAppointmentStart.split(" ")[0];
    const startTime = formatAppointmentStart.split(" ")[1];
    const endTime = formatAppointmentEnd.split(" ")[1];

    // Send confirmation email
    const data = {
      from: "Home Heart <homeheartftl@gmail.com>",
      to: userEmail,
      subject: `Appointment Booking Confirmation - ${new Date().toLocaleString()}`,
      html: `
      <div style="max-width: 600px; padding: 20px; margin: 0 auto; background-color: #ffffff; font-family: Arial, sans-serif; color: #333; border-radius: 10px; border: 1px solid #C5D9EA;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #C5D9EA;">
        <h1 style="color: #C5D9EA; font-size: 32px; margin-bottom: 10px;">HomeHeart</h1>
    </div>
    <p style="font-size: 16px; padding-top: 20px;">Dear <strong>${userName}</strong>,</p>
    <p style="font-size: 16px;">We are thrilled to confirm your appointment with <strong>${professionalName}</strong> at Home Heart.</p>
    <h2 style="font-size: 18px; color: #C5D9EA; border-bottom: 1px solid #C5D9EA; padding-top: 20px;">Appointment Details:</h2>
    <ul style="list-style-type: none; padding-left: 0;">
        <li style="font-size: 16px; padding-top: 10px;"><strong>Date:</strong> ${appointmentDate}</li>
        <li style="font-size: 16px; padding-top: 10px;"><strong>Time:</strong> ${moment(
          startTime,
          "HH:mm:ss"
        ).format("hh:mm A")} - ${moment(endTime, "HH:mm:ss").format(
        "hh:mm A"
      )}</li>
        <li style="font-size: 16px; padding-top: 10px;"><strong>Location:</strong> <a href="https://meet.google.com/dyv-hgbu-xes" style="color: #333;">Join the therapy session</a></li>
    </ul>
    <p style="font-size: 16px; padding-top: 20px;">Our team of professionals is dedicated to providing you with the best care possible. If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
    <p style="font-size: 16px; padding-top: 10px;">Thank you for choosing Home Heart. We look forward to seeing you soon!</p>
    <p style="font-size: 16px; padding-top: 20px; border-top: 1px solid #C5D9EA;">Sincerely,</p>
    <p style="font-size: 16px;"><strong>The Home Heart Team</strong></p>
</div>
  `,
    };

    mg.messages().send(data, function (error, body) {
      if (error) {
        console.log(error);
      } else {
        console.log(body);
      }
    });

    res.json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// update appointment status
// the endpoint is /api/appointments/:appointmentId with PUT method
// update appointment status
router.put("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointment_start, appointment_end, status } = req.body;

    const selectedAppointmentStartMoment = moment(appointment_start);
    const selectedAppointmentEndMoment = moment(appointment_end);

    const selectedAppointmentStart = selectedAppointmentStartMoment.format(
      "YYYY-MM-DD hh:mm:ss"
    );
    const selectedAppointmentEnd = selectedAppointmentEndMoment.format(
      "YYYY-MM-DD hh:mm:ss"
    );

    // Fetch the existing appointments for overlapping check
    const { rows: existingAppointments } = await db.query(
      "SELECT * FROM appointments WHERE appointment_id != $1",
      [appointmentId]
    );

    // Check if the appointment is overlapping with any existing appointments
    const isOverlapping = existingAppointments.some((app) => {
      const appStart = moment(app.appointment_start);
      const appEnd = moment(app.appointment_end);
      return (
        selectedAppointmentStartMoment.isBetween(
          appStart,
          appEnd,
          null,
          "()"
        ) ||
        selectedAppointmentEndMoment.isBetween(appStart, appEnd, null, "()") ||
        (selectedAppointmentStartMoment.isSameOrBefore(appStart) &&
          selectedAppointmentEndMoment.isSameOrAfter(appEnd))
      );
    });

    // If there is an overlap, return an error
    if (isOverlapping) {
      return res.status(400).json({
        message: "Updated time slot overlaps with an existing appointment",
      });
    }

    // If everything is fine, update the appointment
    const { rows } = await db.query(
      `
      UPDATE appointments
      SET appointment_start = $1, appointment_end = $2, status = $3
      WHERE appointment_id = $4
      RETURNING *`,
      [selectedAppointmentStart, selectedAppointmentEnd, status, appointmentId]
    );

    res.json({
      message: "Appointment updated successfully",
      appointment: rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// delete appointment
// the endpoint is /api/appointments/:appointmentId with DELETE method
router.delete("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await db.query(
      `
      DELETE FROM appointments
      WHERE appointment_id = $1`,
      [appointmentId]
    );
    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

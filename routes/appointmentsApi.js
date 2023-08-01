const express = require("express");
const router = express.Router();
const db = require("../db/db.js");
const moment = require("moment-timezone");

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

    console.log(`formatAppointmentStart: ${formatAppointmentStart}`);
    console.log(`formatAppointmentEnd: ${formatAppointmentEnd}`);

    // Convert the date to a day of the week so I can match it with the professional's availability table
    const date = new Date(formatAppointmentStart.split(" ")[0]);
    const dayOfWeek = date.getDay();

    // Fetch the professional's availability for the selected day of the week
    const { rows: availabilities } = await db.query(
      "SELECT * FROM availability WHERE professional_id = $1 AND day_of_week = $2",
      [professional_id, dayOfWeek]
    );

    console.log(`availabilities: ${JSON.stringify(availabilities)}`);

    // Check if selected time slot is within professional's availability
    const selectedStartTime = moment(
      formatAppointmentStart,
      "YYYY-MM-DD HH:mm:ss"
    );
    const selectedEndTime = moment(formatAppointmentEnd, "YYYY-MM-DD HH:mm:ss");
    const isWithinAvailability = availabilities.some((avail) => {
      const availStartTime = moment(
        formatAppointmentStart.split(" ")[0] + " " + avail.start_time,
        "YYYY-MM-DD HH:mm:ss"
      );
      const availEndTime = moment(
        formatAppointmentStart.split(" ")[0] + " " + avail.end_time,
        "YYYY-MM-DD HH:mm:ss"
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

    console.log(`isWithinAvailability: ${isWithinAvailability}`);

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
      "YYYY-MM-DD HH:mm:ss"
    );
    const selectedAppointmentEnd = selectedAppointmentEndMoment.format(
      "YYYY-MM-DD HH:mm:ss"
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

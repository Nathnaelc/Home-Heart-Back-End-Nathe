const express = require("express");
const router = express.Router();
const db = require("../db/db.js");
const moment = require("moment-timezone");
const { Vonage } = require('@vonage/server-sdk')

const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "b9331935",
  apiSecret: "fRzHumnQUKaPN4By"
})

async function sendSMS(message) {
    const from = "17607097308"
    const to = "17737321234"
    await vonage.sms.send({to, from, message})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err.messages); });
}


cron.schedule('30 8 * * *', () => {
    console.log('Running cron job...');

    db.query("SELECT * FROM appointments WHERE status = 'Scheduled'")
        .then((result) => {
            const appointments = result.rows;
            appointments.forEach((appointment) => {
                const appointmentDate = moment(appointment.appointment_date, "YYYY-MM-DD");
                const today = moment();
                const daysUntilAppointment = appointmentDate.diff(today, "days");
                if (daysUntilAppointment <= 1) {
                    const appointmentDate = moment(appointment.appointment_date, "YYYY-MM-DD");
                    const appointmentTime = moment(appointment.appointment_time, "HH:mm:ss");
                    const message = `Hi, this is a reminder that you have an appointment with Dr. ${appointment.professional_last_name} tomorrow at ${appointmentTime.format("h:mm a")} on ${appointmentDate.format("dddd, MMMM Do YYYY")}.`;
                    sendSMS(message); 
                }
            });
        })
  });
  

module.exports = router;
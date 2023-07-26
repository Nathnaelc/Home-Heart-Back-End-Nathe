const express = require("express");
const router = express.Router();
const MedicalProfessional = require("../models/medicalProfessional");

router.get("/getMedicalProfessionalById/:professional_id", async (req, res) => {
  console.log("req.params.professional_id: ", req.params.professional_id);
  try {
    const result = await MedicalProfessional.fetchMedicalProfessionalById(
      req.params.professional_id
    );
    if (result == null) {
      return res.status(200).json({
        message: "No professional found",
        result: [],
      });
    } else {
      console.log("result: ", result);
      return res.status(200).json({
        message: "Professional successfully got",
        result: result,
      });
    }
  } catch (err) {
    console.log("HERE");
    return;
  }
});

router.get("/comments/:professional_id", async (req, res) => {
  console.log("req.params.professional_id: ", req.params.professional_id);
  try {
    const result = await MedicalProfessional.fetchMedicalProfessionalComments(
      req.params.professional_id
    );
    if (result == null) {
      return res.status(200).json({
        message: "No professional found",
        result: [],
      });
    } else {
      console.log("result: ", result);
      return res.status(200).json({
        message: "Professional successfully got",
        result: result,
      });
    }
  } catch (err) {
    console.log("HERE");
    return;
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/createUserComment", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    const result = await User.createNewMedicalProfessionalComment(req.body);
    console.log("result: ", result);
    return res.status(200).json({
      message: "Comment successfully created",
      result: result,
    });
  } catch (err) {
    console.log("error:", err);
  }
});

module.exports = router;

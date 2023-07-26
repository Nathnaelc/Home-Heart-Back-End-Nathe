const express = require("express");
const router = express.Router();
const User = require("../models/user"); 

router.get("/getAllSaved/:userID", async (req, res) => {
    try {
        const result = await User.getSavedMedicalProfessionals(req.params.userID);
        if (result == null) {
            return res.status(200).json({
            message: "No professionals saved",
            result: []
        });
    }
    else {
        return res.status(200).json({
        message: "Professionals successfully got",
        result: result
    })};
    } catch (err) {
        console.log("HERE")
        return; 
    };
})
  
router.post("/addSavedProfessional", async (req, res) => {
  
    try {
        const savedProf = await User.saveMedicalProfessional(req.body);
        if (savedProf == false) {
            return res.status(200).json({
            message: "Professional already saved",
            result: await User.getSavedMedicalProfessionals(req.body.user_id)
        })
        }
        return res.status(200).json({
            message: "Professional saved successfully",
            result: req.body
    })} 
    catch (err) {
        console.log("here"); 
    };
 
}); 

router.delete("/deleteSavedProfessional", async (req, res) => {
    console.log("req.body: ", req.body); 
    try {
        const deletedProf = await User.deleteSavedMedicalProfessional(req.body.user_id, req.body.professional.professional_id);
        if (deletedProf == false) {
            return res.status(200).json({
            message: "Professional not saved",
            result: await User.getSavedMedicalProfessionals(req.body.user_id)
        })
        }
        return res.status(200).json({
            message: "Professional deleted successfully",
            result: req.body
    })} 
    catch (err) {
        console.log("HERE")
    };
}); 



module.exports = router;
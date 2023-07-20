const fs = require("fs");
const bios = require("./biogenerator.json");
const medicalProfessionals = require("../medical_professionals_without_bios.json");

// console.log(bios);

// Add each bio to the corresponding medical professional
for (let i = 0; i < medicalProfessionals.length; i++) {
  if (bios[i]) {
    // Make sure a bio exists for this index
    medicalProfessionals[i]["bio"] = bios[i].bio;
  }
}

// convert medical professionals to JSON
const medicalProfessionalsJSON = JSON.stringify(medicalProfessionals, null, 2);
fs.writeFileSync(
  "../medical_professionals_with_bios.json",
  medicalProfessionalsJSON
);

console.log(medicalProfessionals);

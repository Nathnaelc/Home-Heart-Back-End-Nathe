// uses for generating fake data
const faker = require("faker");
const fs = require("fs");
const bios = JSON.parse(fs.readFileSync("./utils/biogenerator.json", "utf-8"));
const pgp = require("pg-promise")();

const countries = [
  "India",
  "China",
  "Mexico",
  "Brazil",
  "Philippines",
  "Germany",
  "Russia",
  "Afghanistan",
  "Japan",
  "Ethiopia",
  "Columbia",
  "Portugal",
  "Kenya",
  "Nigeria",
  "South Africa",
  "Germany",
];
const languages = [
  "English",
  "Spanish",
  "Chinese",
  "Hindi",
  "Portuguese",
  "French",
  "German",
  "Arabic",
  "Japanese",
  "Russian",
  "Italian",
  "Vietnamese",
  "Amharic",
  "Swahili",
  "Kenya",
  "Xhosa",
  "Yoruba",
];
const specializations = [
  "Therapist",
  "Psychologist",
  "Psychiatrist",
  "Clinical Psychologist",
];
const ratingRange = [3.7, 5];
const priceRange = [20, 80];
const availabilityStartHour = 6;
const availabilityEndHour = 17;
const availabilityInterval = 15;

let bioMap = new Map(
  bios.map((bioObj) => [bioObj.professional_id, bioObj.bio])
);

// Function to generate random string
const generateRandomString = (length) => {
  return faker.random.alphaNumeric(length);
};

// Function to generate medical professional
const generateMedicalProfessional = () => {
  const professional_id = Math.floor(Math.random() * 100000);
  const country = countries[Math.floor(Math.random() * countries.length)];
  const language = languages[Math.floor(Math.random() * languages.length)];
  const first_name = `${generateRandomString(6)}`;
  const last_name = `${generateRandomString(6)}`;
  const specialization =
    specializations[Math.floor(Math.random() * specializations.length)];
  const rating = Math.floor(
    Math.random() * (ratingRange[1] - ratingRange[0]) + ratingRange[0]
  );
  const price = Math.floor(
    Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0]
  );
  const availabilityStart = `${availabilityStartHour}:${availabilityInterval}`;
  const availabilityEnd = `${availabilityEndHour}:${availabilityInterval}`;
  const timeZone = `America/${country.toLowerCase()}`;

  return {
    professional_id: professional_id,
    first_name: `${first_name}`,
    last_name: `${last_name}`,
    email: `${first_name}.${last_name}@homeheart.net`,
    contact_number: `${Math.floor(Math.random() * 100000000)}`,
    years_of_experience: Math.floor(Math.random() * 20),
    country_of_operation: country,
    language_proficiency: language,
    specialization: specialization,
    qualification: `${generateRandomString(10)}`,
    rating: rating,
    date_joined: new Date(),
    street_address: `${generateRandomString(10)} ${generateRandomString(10)}`,
    city: `${generateRandomString(10)}`,
    state_province: `${generateRandomString(10)}`,
    country: country,
    postal_code: `${Math.floor(Math.random() * 10000)}`,
    latitude: Math.random(),
    longitude: Math.random(),
    verification_document: `${generateRandomString(10)}.pdf`,
    price: price,
    availability_start_time: availabilityStart,
    availability_end_time: availabilityEnd,
    time_zone: timeZone,
    bio: bioMap.get(professional_id),
  };
};

// generate medical professionals
const medicalProfessionals = [];
for (let i = 0; i <= 75; i++) {
  medicalProfessionals.push(generateMedicalProfessional());
}

// Write to a JSON file
fs.writeFileSync(
  "medical_professionals_with_bios.json",
  JSON.stringify(medicalProfessionals, null, 2)
);
// console.log(medicalProfessionals);

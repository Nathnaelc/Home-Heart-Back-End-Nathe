Visit the website: [HomeHeart deployed website](https://homeheartui-wi1z.onrender.com/#/)
**HomeHeart Medical Matching App - Backend**
Welcome to the backend repository of the HomeHeart Medical Matching App! This backend is designed to handle user registration, login, and medical professional matching functionalities.

**Description**
HomeHeart is a revolutionary medical matching platform that connects medical professionals with patients seeking medical assistance. Our backend is built using Node.js, Express, and PostgreSQL to provide a seamless experience for both users and medical professionals.

**Getting Started**
  Clone this repository: git clone https://github.com/your-username/homeheart-backend.git
  Install dependencies: npm install
  Set up your PostgreSQL database and update the connection details in the .env file.
  Run the server: npm start
**Features**
  User Registration: Users can create accounts and specify their location and preferred language.
  User Login: Registered users can log in using their credentials.
  Medical Professional Matching: The backend utilizes advanced algorithms to match users with appropriate medical professionals based on location and language preferences.
  JSON Web Tokens (JWT): Secure user authentication and authorization using JWT.
  PostgreSQL Database: Data is stored in a PostgreSQL database to ensure data integrity and reliability.
**Constraints**
  Limited Medical Professionals: Our mock database contains 215 medical professionals, which might result in limited matches for certain regions and languages.
  Language Preferences: For optimal matching, we suggest users create profiles as speakers of languages such as **Portuguese, German, Russian, French, Spanish, and Arabic**.
  Deployment Environemt: We also used free tiers for deployment which is limited at lower treshold in every aspect. So some interactions are either slow or crashes the server or refuse to request because of limited connection capabilities. 
  Notifications for booked appointments are not being sent since Mailgun only sends emails to listed 5 users with its free tier.
  
**Minor Bugs**
  Posting comment and rating the professionals is currently not working
  


**Contact**
  If you have any questions, feel free to contact our development team at devteam@homeheart.com.

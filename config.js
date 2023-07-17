// for conditionally determining the env variables and local ones
require("dotenv").config();
require("colors");

function getDatabaseUrl() {
  const dbUser = process.env.DATABASE_USER || "postgres";
  const dbPassword = process.env.DATABASE_PASS
    ? encodeURI(process.env.DATABASE_PASS)
    : "postgres";
  const dbHost = process.env.DATABASE_HOST || "localhost";
  const dbPort = process.env.DATABASE_PORT
    ? Number(process.env.DATABASE_PORT)
    : 5432;
  const dbName = process.env.DATABASE_NAME || "homeheart_database";
  return (
    process.env.DATABASE_HOSTED_URL ||
    `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
  );
}

const BYCRYPT_WORK_FACTOR = 10;

console.log("life tracker Config:".green, getDatabaseUrl());
console.log("DatabaseURL:", getDatabaseUrl());

module.exports = {
  BYCRYPT_WORK_FACTOR,
  getDatabaseUrl,
};

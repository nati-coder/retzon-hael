require("dotenv").config();
const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || (isProd && jwtSecret === "change-me")) {
  console.error("Set a strong JWT_SECRET in your environment.");
  process.exit(1);
}
module.exports = {
  isProd,
  jwtSecret,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5000").split(",").map(s => s.trim()).filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};

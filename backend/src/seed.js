const bcrypt = require("bcryptjs");
const env = require("./config/env");
const Admin = require("./models/Admin");

module.exports = async function seedAdmin() {
  if ((await Admin.count()) > 0) return;
  if (env.adminEmail && env.adminPassword && env.adminPassword.length >= 10) {
    await Admin.create(env.adminEmail.toLowerCase(), await bcrypt.hash(env.adminPassword, 12));
    console.log("Created first admin:", env.adminEmail);
  } else console.warn("No admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ chars) and restart.");
};

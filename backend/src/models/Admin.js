const { query } = require("../config/db");

module.exports = {
  count: async () => (await query("SELECT count(*)::int AS n FROM admins"))[0].n,
  findByEmail: async email => (await query("SELECT * FROM admins WHERE email=$1", [email]))[0],
  findById: async id => (await query("SELECT * FROM admins WHERE id=$1", [id]))[0],
  create: (email, hash) => query("INSERT INTO admins(email,password_hash) VALUES($1,$2)", [email, hash]),
  setPassword: (id, hash) => query("UPDATE admins SET password_hash=$1 WHERE id=$2", [hash, id]),
};

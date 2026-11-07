const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const Admin = require("../models/Admin");
const ah = require("../utils/asyncHandler");
const { HttpError, str } = require("../utils/validate");

const DUMMY = bcrypt.hashSync("not-a-real-password", 12); // equalises timing for unknown emails

exports.login = ah(async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase(), password = str(req.body.password, 200);
  const user = await Admin.findByEmail(email);
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password.");
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "8h" });
  res.json({ token, email: user.email });
});

exports.me = (req, res) => res.json({ email: req.admin.email });

exports.changePassword = ah(async (req, res) => {
  const current = str(req.body.current, 200), next = str(req.body.next, 200);
  if (next.length < 10) throw new HttpError(400, "New password must be at least 10 characters.");
  const user = await Admin.findById(req.admin.id);
  if (!user || !(await bcrypt.compare(current, user.password_hash))) throw new HttpError(403, "Current password is incorrect.");
  await Admin.setPassword(user.id, await bcrypt.hash(next, 12));
  res.json({ ok: true });
});

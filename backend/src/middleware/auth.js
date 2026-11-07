const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { HttpError } = require("../utils/validate");

module.exports = (req, res, next) => {
  const h = req.headers.authorization || "";
  try {
    req.admin = jwt.verify(h.startsWith("Bearer ") ? h.slice(7) : "", jwtSecret);
    next();
  } catch {
    next(new HttpError(401, "Please sign in."));
  }
};

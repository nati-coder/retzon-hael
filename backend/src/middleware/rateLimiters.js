const rateLimit = require("express-rate-limit");
const make = (windowMs, limit, error) => rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { error } });

exports.formLimit = make(60 * 60 * 1000, 10, "Too many submissions. Please try again later.");
exports.loginLimit = make(15 * 60 * 1000, 10, "Too many attempts. Try again in 15 minutes.");

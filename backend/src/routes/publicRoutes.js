const { Router } = require("express");
const c = require("../controllers/publicController");
const { formLimit } = require("../middleware/rateLimiters");

const r = Router();
r.get("/public", c.site);
r.get("/gallery", c.gallery);
r.get("/media/:id", c.image);
r.post("/volunteer", formLimit, c.volunteer);
r.post("/contact", formLimit, c.contact);
module.exports = r;

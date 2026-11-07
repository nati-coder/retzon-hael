const { Router } = require("express");
const requireAuth = require("../middleware/auth");
const { loginLimit } = require("../middleware/rateLimiters");
const auth = require("../controllers/authController");
const settings = require("../controllers/settingsController");
const inbox = require("../controllers/inboxController");
const crudController = require("../controllers/crudController");
const crudRoutes = require("./crudRoutes");
const Sermon = require("../models/Sermon");
const Event = require("../models/Event");

const r = Router();
r.post("/login", loginLimit, auth.login);

r.use(requireAuth); // everything below needs a valid token
r.get("/me", auth.me);
r.post("/password", auth.changePassword);
r.use("/sermons", crudRoutes(crudController(Sermon)));
r.use("/events", crudRoutes(crudController(Event)));
r.get("/settings", settings.get);
r.put("/settings", settings.update);
r.get("/inbox", inbox.list);
r.delete("/inbox/:id", inbox.remove);
module.exports = r;

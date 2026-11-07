const { Router } = require("express");

const r = Router();
r.use("/admin", require("./adminRoutes"));
r.use("/", require("./publicRoutes"));
module.exports = r;

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const requireAuth = require("./middleware/auth");

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Normal requests are capped at 50 KB. Only signed-in admins may send the larger photo-upload bodies.
const smallJson = express.json({ limit: "50kb" }), photoJson = express.json({ limit: "4mb" });
app.use((req, res, next) => /^\/api\/admin\/gallery\/\d+\/photos$/.test(req.path) && req.method === "POST"
  ? requireAuth(req, res, err => err ? next(err) : photoJson(req, res, next))
  : smallJson(req, res, next));
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);
app.use("/api", notFound);
app.use(errorHandler);

module.exports = app;

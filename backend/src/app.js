const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "50kb" }));
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);
app.use("/api", notFound);
app.use(errorHandler);

module.exports = app;

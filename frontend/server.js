// Tiny static server: site at "/", admin app at "/admin". Any static host works too (see README).
const path = require("path");
const express = require("express");
const app = express();
app.get("/config.js", (req, res) => res.sendFile(path.join(__dirname, "config.js")));
app.use("/admin", express.static(path.join(__dirname, "admin"), { setHeaders: r => r.setHeader("X-Robots-Tag", "noindex, nofollow") }));
app.use(express.static(path.join(__dirname, "site")));
app.listen(process.env.PORT || 5000, () => console.log("Frontend on port " + (process.env.PORT || 5000)));

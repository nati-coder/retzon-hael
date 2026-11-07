const env = require("./config/env");
const { migrate } = require("./config/db");
const seedAdmin = require("./seed");
const app = require("./app");

(async () => {
  await migrate();
  await seedAdmin();
  app.listen(env.port, () => console.log(`API running on port ${env.port}`));
})().catch(e => { console.error("Startup failed:", e.message); process.exit(1); });

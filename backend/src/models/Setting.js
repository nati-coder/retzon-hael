const { query } = require("../config/db");
const { HttpError, str, okUrl } = require("../utils/validate");

const DEFAULTS = {
  meals: 0, families: 0, vols: 0, drives: 0, regions: 0, countries: 0, believers: 0, helped: 0,
  live: "", services: "Sunday Service: 10:00 AM", address: "", email: "", fb: "", yt: "", ig: "",
};
const NUM = ["meals", "families", "vols", "drives", "regions", "countries", "believers", "helped"];
const URLS = ["live", "fb", "yt", "ig"];

module.exports = {
  async get() {
    const [row] = await query("SELECT data FROM settings WHERE id=1");
    return { ...DEFAULTS, ...(row ? row.data : {}) };
  },
  async save(body) {
    const out = {};
    for (const k of Object.keys(DEFAULTS)) {
      if (NUM.includes(k)) out[k] = Math.max(0, Math.min(1e9, Math.floor(Number(body[k]) || 0)));
      else {
        out[k] = str(body[k], 2000);
        if (URLS.includes(k) && !okUrl(out[k])) throw new HttpError(400, `${k} must start with http:// or https://`);
      }
    }
    await query("UPDATE settings SET data=$1 WHERE id=1", [out]);
    return out;
  },
};

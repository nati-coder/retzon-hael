const crudModel = require("./crudModel");
const { HttpError, str, okUrl } = require("../utils/validate");

const cols = ["title", "category", "sermon_date", "length", "video_url", "audio_url", "pdf_url"];
const urls = ["video_url", "audio_url", "pdf_url"];

module.exports = crudModel({
  table: "sermons",
  cols,
  sel: "id,title,category,to_char(sermon_date,'YYYY-MM-DD') AS sermon_date,length,video_url,audio_url,pdf_url",
  order: "sermon_date DESC NULLS LAST, id DESC",
  publicSql: "SELECT id,title t,category c,to_char(sermon_date,'YYYY-MM-DD') d,length l,video_url v,audio_url a,pdf_url p FROM sermons ORDER BY sermon_date DESC NULLS LAST, id DESC LIMIT 100",
  validate(body) {
    const d = {};
    for (const k of cols) {
      const v = str(body[k]);
      if (k === "sermon_date") d[k] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
      else if (urls.includes(k) && !okUrl(v)) throw new HttpError(400, `${k} must start with http:// or https://`);
      else d[k] = v;
    }
    if (!d.title) throw new HttpError(400, "Title is required");
    return d;
  },
});

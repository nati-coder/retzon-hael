const crudModel = require("./crudModel");
const { HttpError, str, isoDate } = require("../utils/validate");

const cols = ["title", "activity_date", "description"];
const count = k => `(SELECT count(*) FROM media m WHERE m.activity_id=activities.id AND m.kind='${k}')::int`;

module.exports = crudModel({
  table: "activities",
  cols,
  sel: `id,title,to_char(activity_date,'YYYY-MM-DD') AS activity_date,description,${count("photo")} AS photos,${count("video")} AS videos`,
  order: "activity_date DESC, id DESC",
  publicSql: "SELECT id,title t,to_char(activity_date,'YYYY-MM-DD') d,description n FROM activities ORDER BY activity_date DESC, id DESC LIMIT 200",
  validate(body) {
    const d = { title: str(body.title, 200), activity_date: str(body.activity_date), description: str(body.description, 2000) };
    if (!d.title) throw new HttpError(400, "Title is required");
    if (!isoDate(d.activity_date)) throw new HttpError(400, "Please choose a valid date");
    return d;
  },
});

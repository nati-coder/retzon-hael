const crudModel = require("./crudModel");
const { HttpError, str } = require("../utils/validate");

const cols = ["title", "when_text", "note"];

module.exports = crudModel({
  table: "events",
  cols,
  sel: "id,title,when_text,note",
  order: "id",
  publicSql: "SELECT id,title t,when_text d,note n FROM events ORDER BY id",
  validate(body) {
    const d = {};
    for (const k of cols) d[k] = str(body[k]);
    if (!d.title) throw new HttpError(400, "Title is required");
    return d;
  },
});

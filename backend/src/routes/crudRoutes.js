const { Router } = require("express");

module.exports = c => {
  const r = Router();
  r.get("/", c.list);
  r.post("/", c.create);
  r.put("/:id", c.update);
  r.delete("/:id", c.remove);
  return r;
};

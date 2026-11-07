const ah = require("../utils/asyncHandler");
const { toId } = require("../utils/validate");

// Controller for any model built with crudModel
module.exports = Model => ({
  list: ah(async (req, res) => res.json(await Model.all())),
  create: ah(async (req, res) => res.status(201).json(await Model.create(Model.validate(req.body)))),
  update: ah(async (req, res) => { await Model.update(toId(req.params.id), Model.validate(req.body)); res.json({ ok: true }); }),
  remove: ah(async (req, res) => { await Model.remove(toId(req.params.id)); res.json({ ok: true }); }),
});

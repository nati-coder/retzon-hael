const Submission = require("../models/Submission");
const ah = require("../utils/asyncHandler");
const { toId } = require("../utils/validate");

exports.list = ah(async (req, res) => res.json(await Submission.all()));
exports.remove = ah(async (req, res) => { await Submission.remove(toId(req.params.id)); res.json({ ok: true }); });

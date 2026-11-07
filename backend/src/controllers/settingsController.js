const Setting = require("../models/Setting");
const ah = require("../utils/asyncHandler");

exports.get = ah(async (req, res) => res.json(await Setting.get()));
exports.update = ah(async (req, res) => res.json(await Setting.save(req.body)));

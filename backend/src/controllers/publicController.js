const Sermon = require("../models/Sermon");
const Event = require("../models/Event");
const Setting = require("../models/Setting");
const Submission = require("../models/Submission");
const ah = require("../utils/asyncHandler");
const { HttpError, str, emailOk } = require("../utils/validate");

exports.site = ah(async (req, res) => {
  const [settings, sermons, events] = await Promise.all([Setting.get(), Sermon.publicList(), Event.publicList()]);
  res.json({
    settings,
    sermons: sermons.map(s => ({ ...s, id: "s" + s.id })),
    events: events.map(e => ({ ...e, id: "e" + e.id })),
  });
});

exports.volunteer = ah(async (req, res) => {
  const name = str(req.body.name, 120), email = str(req.body.email, 200);
  if (!name || !emailOk(email)) throw new HttpError(400, "Name and a valid email are required.");
  await Submission.createVolunteer({ name, email, phone: str(req.body.phone, 40), event: str(req.body.event, 200) });
  res.status(201).json({ ok: true });
});

exports.contact = ah(async (req, res) => {
  const name = str(req.body.name, 120), email = str(req.body.email, 200), message = str(req.body.message, 3000);
  if (!name || !emailOk(email) || !message) throw new HttpError(400, "Name, a valid email and a message are required.");
  await Submission.createMessage({ name, email, message });
  res.status(201).json({ ok: true });
});

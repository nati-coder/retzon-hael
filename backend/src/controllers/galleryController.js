const Media = require("../models/Media");
const ah = require("../utils/asyncHandler");
const { HttpError, str, toId, ytId } = require("../utils/validate");

const MAX_PHOTOS = 80;               // per activity
const MAX_FULL = 2 * 1024 * 1024;    // bytes, display size (the admin app sends ~1600px JPEGs, usually 300-800 KB)
const MAX_THUMB = 250 * 1024;        // bytes, thumbnail
const jpeg = b => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const dim = v => { const n = Number(v); return Number.isInteger(n) && n >= 16 && n <= 6000 ? n : 0; };
const b64 = (v, max, what) => {
  if (typeof v !== "string") throw new HttpError(400, `Missing ${what}`);
  const b = Buffer.from(v, "base64");
  if (!jpeg(b)) throw new HttpError(400, `The ${what} must be a JPEG image`);
  if (b.length > max) throw new HttpError(413, `The ${what} is too large`);
  return b;
};

exports.list = ah(async (req, res) => res.json(await Media.forActivity(toId(req.params.id))));

exports.addPhoto = ah(async (req, res) => {
  const activity = toId(req.params.id);
  if (!(await Media.activityExists(activity))) throw new HttpError(404, "Activity not found");
  if ((await Media.countPhotos(activity)) >= MAX_PHOTOS) throw new HttpError(400, `Each activity can hold up to ${MAX_PHOTOS} photos.`);
  const w = dim(req.body.w), h = dim(req.body.h);
  if (!w || !h) throw new HttpError(400, "Bad image size");
  const img = b64(req.body.full, MAX_FULL, "photo"), thumb = b64(req.body.thumb, MAX_THUMB, "thumbnail");
  res.status(201).json(await Media.addPhoto({ activity, caption: str(req.body.caption, 200), w, h, img, thumb }));
});

exports.addVideo = ah(async (req, res) => {
  const activity = toId(req.params.id);
  if (!(await Media.activityExists(activity))) throw new HttpError(404, "Activity not found");
  const yt = ytId(req.body.url);
  if (!yt) throw new HttpError(400, "That does not look like a YouTube link.");
  res.status(201).json(await Media.addVideo({ activity, caption: str(req.body.caption, 200), yt }));
});

exports.caption = ah(async (req, res) => { await Media.setCaption(toId(req.params.id), str(req.body.caption, 200)); res.json({ ok: true }); });
exports.remove = ah(async (req, res) => { await Media.remove(toId(req.params.id)); res.json({ ok: true }); });

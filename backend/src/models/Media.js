const { query } = require("../config/db");

// Photos are stored as two resized JPEGs (display + thumbnail) so they survive redeploys on hosts with temporary disks.
module.exports = {
  forActivity: id => query("SELECT id,kind,caption,w,h,yt FROM media WHERE activity_id=$1 ORDER BY id", [id]),
  forActivities: ids => query("SELECT id,activity_id,kind,caption,w,h,yt FROM media WHERE activity_id = ANY($1::int[]) ORDER BY id", [ids]),
  countPhotos: id => query("SELECT count(*)::int AS n FROM media WHERE activity_id=$1 AND kind='photo'", [id]).then(r => r[0].n),
  activityExists: id => query("SELECT 1 FROM activities WHERE id=$1", [id]).then(r => r.length > 0),
  addPhoto: ({ activity, caption, w, h, img, thumb }) => query(
    "INSERT INTO media(activity_id,kind,caption,w,h,img,thumb) VALUES($1,'photo',$2,$3,$4,$5,$6) RETURNING id", [activity, caption, w, h, img, thumb]).then(r => r[0]),
  addVideo: ({ activity, caption, yt }) => query(
    "INSERT INTO media(activity_id,kind,caption,yt) VALUES($1,'video',$2,$3) RETURNING id", [activity, caption, yt]).then(r => r[0]),
  setCaption: (id, caption) => query("UPDATE media SET caption=$1 WHERE id=$2", [caption, id]),
  remove: id => query("DELETE FROM media WHERE id=$1", [id]),
  image: id => query("SELECT img,thumb FROM media WHERE id=$1 AND kind='photo'", [id]).then(r => r[0]),
};

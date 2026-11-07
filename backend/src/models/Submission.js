const { query } = require("../config/db");

module.exports = {
  createVolunteer: ({ name, email, phone, event }) =>
    query("INSERT INTO submissions(kind,name,email,phone,event_title) VALUES('volunteer',$1,$2,$3,$4)", [name, email, phone, event]),
  createMessage: ({ name, email, message }) =>
    query("INSERT INTO submissions(kind,name,email,message) VALUES('message',$1,$2,$3)", [name, email, message]),
  all: () => query("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500"),
  remove: id => query("DELETE FROM submissions WHERE id=$1", [id]),
};

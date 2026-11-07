const { query } = require("../config/db");

// Builds a model for a simple table. Table/column names come from fixed config, never from requests.
module.exports = ({ table, cols, sel, order, publicSql, validate }) => ({
  validate,
  all: () => query(`SELECT ${sel} FROM ${table} ORDER BY ${order}`),
  publicList: () => query(publicSql),
  create: async d => (await query(
    `INSERT INTO ${table}(${cols.join(",")}) VALUES(${cols.map((_, i) => "$" + (i + 1)).join(",")}) RETURNING id`,
    cols.map(k => d[k])))[0],
  update: (id, d) => query(
    `UPDATE ${table} SET ${cols.map((k, i) => `${k}=$${i + 1}`).join(",")} WHERE id=$${cols.length + 1}`,
    [...cols.map(k => d[k]), id]),
  remove: id => query(`DELETE FROM ${table} WHERE id=$1`, [id]),
});

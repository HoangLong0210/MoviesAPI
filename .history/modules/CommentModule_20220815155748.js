const conn = require("../Connection");

const constants = require("../configs/Constants");

const comment = {};

db.get = (id, page) => {
  return new Promise((resolve, reject) => {
    let query = `select id, v.avatar, v.name, v.email, v.viewer_id, movie_id, id_root, content, files, to_char(time, 'DD-MM-YYYY hh:mm:ss') as time from "Comment" c, "Viewers" v where (id = $1 or id_root = $1) and c.viewer_id = v.viewer_id order by id desc`;
    query +=
      " limit " +
      constants.limit_element +
      " offset " +
      constants.limit_element * (page - 1);
    let params = [id];
    conn.query(query, params, (err, res) => {
      if (err) return reject(err);
      else return resolve(res.rows);
    });
  });
};

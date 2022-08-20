const constants = require("../configs/Constants");
const conn = require("../Connection");

const service = {};

service.get = (service_type) => {
  return new Promise((resolve, reject) => {
    let params = [service_type];
    let query = `select * from "Service" where service_type = $1 limit 1`;

    conn.query(query, params, (err, res) => {
      if (err) return reject(err);
      else return resolve(res.rows[0]);
    });
  });
};

service.get_all = () => {
  return new Promise((resolve, reject) => {
    let query = `select * from "Service"`;

    conn.query(query, (err, res) => {
      if (err) return reject(err);
      else return resolve(res.rows);
    });
  });
};

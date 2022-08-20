const GenreModule = require("../modules/GenreModule");
const utils = require("../utils/utils");
const message = require("../configs/Message");

const genre = {};

class Err extends Error {
  constructor(message, code, constraint) {
    super(message);
    this.message = message;
    this.code = code;
    this.constraint = constraint;
  }
}

function onCatchError(err, res) {
  if (err.constraint) {
    switch (err.constraint) {
      case "genre_pk": {
        utils.onResponse(res, "fail", 400, message.genre.genre_pk, nul, null);
        break;
      }
      default: {
        utils.onResponse(res, "fail", 500, err.message, null, null);
        break;
      }
    }
  } else utils.onResponse(res, "fail", err.code, err.message, null, null);
}

genre.onGetResult = (data, req, res, next) => {
  if (data instanceof Error) {
    onCatchError(data, res);
  } else {
    utils.onResponse(res, "success", 200, data.message, data.page, data.data);
  }
};

genre.getAllGenre = async (req, res, next) => {
  try {
    next({ data: await GenreModule.get_all() });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};
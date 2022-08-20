const CommentModule = require("../modules/CommentModule");
const MovieModule = require("../modules/MovieModule");
const FileModule = require("../modules/FileModule");
const EpisodeModule = require("../modules/EpisodeModule");

const message = require("../configs/Message");
const utils = require("../utils/utils");

const comment = {};

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
      case "comment_pk": {
        utils.onResponse(
          res,
          "fail",
          400,
          message.comment.comment_pk,
          null,
          null
        );
        break;
      }
      case "viewer_comment_fk": {
        utils.onResponse(
          res,
          "fail",
          404,
          message.comment.viewer_comment_fk,
          null,
          null
        );
        break;
      }
      case "movieid_comment_fk": {
        utils.onResponse(
          res,
          "fail",
          404,
          message.comment.movieid_comment_fk,
          null,
          null
        );
        break;
      }
      case "reply_constraint": {
        utils.onResponse(
          res,
          "fail",
          404,
          message.comment.reply_constraint,
          null,
          null
        );
        break;
      }
      default: {
        utils.onResponse(res, "fail", 500, err.message, null, null);
        break;
      }
    }
  } else utils.onResponse(res, "fail", err.code, err.message, null, null);
}

comment.onGetResult = (data, req, res, next) => {
  if (data instanceof Error) {
    onCatchError(data, res);
  } else {
    utils.onResponse(res, "success", 200, data.message, data.page, data.data);
  }
};

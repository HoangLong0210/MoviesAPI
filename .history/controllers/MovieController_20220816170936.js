const MovieModule = require("../modules/MovieModule");
const GenreModule = require("../modules/GenreModule");
const FileModule = require("../modules/FileModule");
const utils = require("../utils/utils");
const message = require("../configs/Message");
const constants = require("../configs/Constants");

const movie = {};

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
      case "movie_pk": {
        utils.onResponse(res, "fail", 400, message.movie.movie_pk, null, null);
        break;
      }
      case "genre_fk": {
        utils.onResponse(res, "fail", 404, message.genre.not_found, null, null);
        break;
      }
      case "movie_fk": {
        utils.onResponse(res, "fail", 404, message.movie.not_found, null, null);
        break;
      }
      default: {
        utils.onResponse(res, "fail", 500, err.message, null, null);
        break;
      }
    }
  } else utils.onResponse(res, "fail", err.code, err.message, null, null);
}

movie.onGetResult = (data, req, res, next) => {
  if (data instanceof Error) {
    onCatchError(data, res);
  } else {
    utils.onResponse(res, "success", 200, data.message, data.page, data.data);
  }
};

movie.getAllMovie = async (req, res, next) => {
  let page = req.query.page;
  if (!page) page = 1;
  let filter = utils.parseQueryParamObjToJson(req.query.filter);
  try {
    if (filter.genres && filter.genres.length > 0) {
      next({
        data: await MovieModule.filter_with_genres(filter, page),
        page: page,
      });
    } else {
      next({
        data: await MovieModule.filter_without_genres(filter, page),
        page: page,
      });
    }
  } catch (e) {
    next(Err(e.message, 500, e.constraint));
  }
};

movie.getSuggestMovie = async (req, res, next) => {
  let viewer = req.viewer;
  try {
    next({
      data: await MovieModule.get_suggest_movie(viewer.viewer_id),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getTopSearch = async (req, res, next) => {
  try {
    next({
      data: await MovieModule.get_top_search(),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getTopView = async (req, res, next) => {
  try {
    next({
      data: await MovieModule.get_top_view(),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getTopRating = async (req, res, next) => {
  try {
    next({
      data: await MovieModule.get_top_rating(),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getTopFollow = async (req, res, next) => {
  try {
    next({
      data: await MovieModule.get_top_follow(),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getRelateMovie = async (req, res, next) => {
  try {
    if (!(await MovieModule.get(req.params.movie_id)))
      return next(new Err(message.movie.not_found, 404));
    next({
      data: await MovieModule.get_relate_movie(req.params.movie_id),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getMovieFollower = async (req, res, next) => {
  try {
    if (!(await MovieModule.get(req.params.movie_id)))
      return next(new Err(message.movie.not_found, 404));
    next({
      data: await MovieModule.get_viewer_follow(req.params.movie_id),
    });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.getDetailMovie = async (req, res, next) => {
  try {
    let movie = await MovieModule.get_detail(req.params.movie_id);
    if (!movie) return next(new Err(message.movie.not_found, 404));
    await MovieModule.update_info(
      {
        movie_id: req.params.movie_id,
        search_number: Math.min(movie.search_number + 1, constants.max_int),
      },
      req.params.movie_id
    );
    next({ data: [movie] });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.addMovie = async (req, res, next) => {
  let movie = req.body;
  try {
    if (!movie.title) return next(new Err(message.movie.missing_title, 400));
    else if (!movie.slug) return next(new Err(message.movie.missing_slug, 400));
    else if (!movie.releasemovie)
      return next(new Err(message.movie.missing_releaseMovie, 400));
    else if (!movie.url_trailer)
      return next(new Err(message.movie.missing_urlTrailer, 400));
    else if (!movie.typemovie)
      return next(new Err(message.movie.missing_typeMovie, 400));
    else if (!req.files["poster"])
      return next(new Err(message.movie.missing_poster, 400));
    else if (!req.files["poster"][0]["mimetype"].includes("image"))
      return next(new Err(message.movie.poster_invalid, 400));

    movie = await MovieModule.add(movie);
    movie.view = 0;
    movie.follow = 0;
    movie.genres = [];

    let genres = Array.isArray(req.body.genres)
      ? req.body.genres
      : req.body.genres
      ? [req.body.genres]
      : null;
    if (genres) {
      let moviegenre = await MovieModule.add_movie_genres(
        movie.movie_id,
        genres
      );
      for (mg of moviegenre) {
        movie.genres.push(await GenreModule.get(mg.genre_id));
      }
    }

    next({ data: [movie], message: message.movie.add_success });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.updateBook = async (req, res, next) => {
  var movie = req.body;
  movie.movie_id = req.params.movie_id;
  try {
    if (!(await MovieModule.get(req.params.movie_id)))
      return next(new Err(message.movie.not_found, 404));

    if (req.files["poster"]) {
      if (!req.files["poster"][0]["mimetype"].includes("image"))
        return next(new Err(message.movie.poster_invalid, 400));
      else
        movie.poster = await FileModule.upload_single(
          req.files["poster"][0],
          "movie/" + movie.movie_id + "/",
          "poster"
        );
    }

    movie = await MovieModule.update_info(movie, req.params.movie_id);
    movie.view = (await MovieModule.get_view_all(req.params.movie_id)).length;
    movie.follow = (
      await MovieModule.get_viewer_follow(req.params.movie_id)
    ).length;
    movie.genres = [];

    let genres = Array.isArray(req.body.genres)
      ? req.body.genres
      : req.body.genres
      ? [req.body.genres]
      : null;
    if (genres) {
      await MovieModule.delete_all_genres(req.params.movie_id);
      let moviegenre = await MovieModule.add_movie_genres(
        movie.movie_id,
        genres
      );
      for (mg of moviegenre) {
        movie.genres.push(await GenreModule.get(mg.genre_id));
      }
    }
    next({ data: [movie], message: message.movie.update_success });
  } catch (e) {
    next(new Err(e.message, 500, e.constraint));
  }
};

movie.finishMovie = async (req, res, next) => {
  let movie;
  var isSendData = false;
  try {
    let movie = await MovieModule.update_info(
      {
        status: 1,
      },
      req.params.movie_id
    );
    if (movie) {
      movie = await MovieModule.get_detail(req.params.movie_id);

      let followers = await BookModule.get_user_follow(book.endpoint);
      followers.forEach((user) => {
        let notify = {
          endpoint: `+book+${book.endpoint}`,
          username: user.username,
          content: message.notify.book_finish_notification,
        };
        NotifyModule.add(notify);
      });
      isSendData = true;
      next({ data: [book], message: message.book.update_success });
    } else next(new Err(message.book.not_found, 404));
  } catch (e) {
    if (e.constraint == "notify_pk" && !isSendData)
      return next({ data: [book], message: message.book.update_success });
    next(new Err(e.message, 500, e.constraint));
  }
};

module.exports = movie;
const jwt = require("jsonwebtoken");

const ViewerModule = require("../modules/ViewerModule");
const message = require("../configs/Message");
const utils = require("../utils/utils");

const auth = {};

auth.verifyUser = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const access_token = authHeader && authHeader.split(" ")[1];
    if (!access_token) throw new Unauthorized();

    jwt.verify(access_token, process.env.ACCESSTOKEN, async (err, data) => {
      try {
        if (err) throw new InvalidToken();

        var { user_id, account_id } = data.user;

        if (
          !(await UserModule.isValidAccessToken({ account_id, access_token }))
        )
          throw new InvalidToken();
        if (
          (await UserModule.getUserInfo({ user_id })).role_id !== role.customer
        )
          throw new Forbidden();
        if (
          !(await accountModule.findAccountByAccountID({ account_id })).active
        )
          throw new Forbidden(messages.user.account_locked);

        req.user = { user_id, account_id, access_token };
        next();
      } catch (e) {
        next(e);
      }
    });
  } catch (e) {
    next(e);
  }
};

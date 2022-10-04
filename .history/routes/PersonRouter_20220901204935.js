const express = require("express");
const multer = require("multer");

const PersonController = require("../controllers/PersonController");

const router = express.Router();

router.get(
  "/detail/:movie_id",
  PersonController.getListPerson,
  PersonController.onGetResult
);

module.exports = router;
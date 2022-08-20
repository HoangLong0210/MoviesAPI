const express = require("express");
const multer = require("multer");

const ViewerController = require("../controllers/ViewerController");
const auth = require("../middleware/Auth");
const encrypt = require("../middleware/Encrypt");
const { memoryStorage } = require("multer");
const { viewer } = require("../configs/Message");

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.get(
  '/info/":viewer_id',
  ViewerController.get,
  ViewerController.onGetResult
);

// router.get('/movie-following', auth.v)

module.exports = viewer;

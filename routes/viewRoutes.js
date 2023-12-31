const express = require('express');
const moment = require('moment-timezone');

const {
  getHome,
  getLoginForm,
  getAddLocation,
  getUpdateLocation,
  getDeleteLocation,
  getUpdateResult,
  getChartSettings,
} = require('./../controllers/viewsController');
const { isLoggedIn } = require('./../controllers/authController');
const router = express.Router();

// router.use("/", (req, res, next) => {
//   console.log("Default Time: ", moment().format("LLL"))
//   console.log("India Time: ", moment().tz("Asia/Kolkata").format("LLL"))

//   next();
// })

router.use(isLoggedIn);
router.get('/', getHome);

router.get('/admin/add-location', getAddLocation);
router.get('/admin/update-location', getUpdateLocation);
router.get('/admin/delete-location', getDeleteLocation);
router.get('/admin/update-result', getUpdateResult);
router.get('/admin/chart-settings', getChartSettings);

router.get('/login', getLoginForm);

module.exports = router;

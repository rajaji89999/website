const express = require('express');
const {
  getHome,
  getLoginForm,
  getAddLocation,
  getUpdateLocation,
  getDeleteLocation,
  getUpdateResult,
} = require('./../controllers/viewsController');
const { isLoggedIn } = require('./../controllers/authController');
const router = express.Router();

router.use(isLoggedIn);

router.get('/', getHome);

router.get('/admin/add-location', getAddLocation);
router.get('/admin/update-location', getUpdateLocation);
router.get('/admin/delete-location', getDeleteLocation);
router.get('/admin/update-result', getUpdateResult);

router.get('/login', getLoginForm);

module.exports = router;

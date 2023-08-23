const express = require('express');
const {
  addResult,
  updateResult,
  getRecentResult,
  getTodayResult,
  getCurrentMonthResult,
  getPreviousMonthResult,
  addBlankEntries,
} = require('./../controllers/resultController');
const {
  isLoggedIn,
  restrictTo,
  protect,
} = require('./../controllers/authController');
const router = express.Router();

router.get('/recent', getRecentResult);
router.get('/today', getTodayResult);
router.get('/current-month', getCurrentMonthResult);
router.get('/previous-month', getPreviousMonthResult);

router.use(protect, isLoggedIn, restrictTo('admin'));

router.post('/add', addResult);
router.patch('/update', updateResult);
router.get('/add-blank-entries', addBlankEntries);

module.exports = router;

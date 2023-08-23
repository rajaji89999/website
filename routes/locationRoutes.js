const express = require('express');
const {
  addLocation,
  updateLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
} = require('./../controllers/locationController');
const {
  isLoggedIn,
  restrictTo,
  protect,
} = require('./../controllers/authController');
const router = express.Router();

router.use(protect, isLoggedIn, restrictTo('admin'));

router.get('/:locationId', getLocationById);
router.get('/getAll', getAllLocations);
router.post('/add', addLocation);
router.patch('/update/:locationId', updateLocation);
router.delete('/delete/:locationId', deleteLocation);

module.exports = router;

const catchAsync = require('../utils/catchAsync');
const Location = require('../models/locationModel');
const mongoose = require('mongoose');
const Result = require('../models/resultModel');
const AppError = require('../utils/appError');

exports.getLocationById = catchAsync(async (req, res, next) => {
  const location = await Location.findOne({
    _id: mongoose.Types.ObjectId(req.params.locationId),
  });

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

exports.getAllLocations = catchAsync(async (req, res, next) => {
  const locations = await Location.find({}).sort({ sequenceNumber: 1 });

  res.status(200).json({
    status: 'success',
    data: locations,
  });
});

exports.addLocation = catchAsync(async (req, res, next) => {
  const location = req.body;

  const isLocationExist = !!(await Location.findOne({ name: location.name }));

  if (isLocationExist) {
    return next(new AppError('Duplicate location not allowed!', 400));
  }

  const newLocation = await Location.create(location);

  res.status(200).json({
    status: 'success',
    message: 'Location added successfully!',
    data: newLocation,
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const locationId = req.params.locationId;
  const location = req.body;

  await Location.updateOne(
    {
      _id: mongoose.Types.ObjectId(locationId),
    },
    { $set: location }
  );

  res.status(200).json({
    status: 'success',
    message: 'Location updated successfully!',
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const locationId = req.params.locationId;

  await Result.deleteMany({
    locationId: mongoose.Types.ObjectId(locationId),
  });

  const deletedLocation = await Location.deleteOne({
    _id: mongoose.Types.ObjectId(locationId),
  });

  if (!!deletedLocation) {
    res.status(200).json({
      status: 'success',
      message: 'Location deleted successfully!',
    });
  }
});

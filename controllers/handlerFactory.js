const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No document find with ID : ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { content: doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To Allow for nested get reviews on tour(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // Send Response
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { content: docs },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newData = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { content: newData },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(`No document find with ID : ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        content: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No document find with ID : ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

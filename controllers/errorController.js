const AppError = require('../utils/appError');

const handleDuplicateDocumentDB = (err) => {
  const message = `Can't add duplcicate result!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const value = err.keyValue[key];

  let message = `Duplicate entry now allowed!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  let message = `Invalid Input Data : ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token is expired. Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  console.log('ERROR ☹️: ', err);

  // API Error Handling
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered Website Error Handling
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // 1. Log Error
  console.log('ERROR ☹️: ', err);

  if (req.originalUrl.startsWith('/api')) {
    // API Error Handling
    // isOperational, Trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Send generic message : Programming or other unknown error: don't leak error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on server.',
    });
  }

  // Rendered Website Error Handling
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.isOperational ? err.message : 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // For invalid MongoDB Id
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);

    // For duplicate field in Mongo DB where unique is required.
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // For validation error in MongoDB like valid email.
    const validationKeywords = ['Validation', 'validation'];
    if (validationKeywords.some((keyword) => error.message?.includes(keyword)))
      error = handleValidationErrorDB(error);

    // For JWT token invalid signature when someone changed the token.
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

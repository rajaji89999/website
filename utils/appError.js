class AppError extends Error {
  constructor(message, statusCode) {
    // This super function is calling the constructor of inherited class(Error class).
    // In this case, Error class excepts a parameter *message*. That's why we are sending message parameter.
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //We are taking this property because we will send only operational error the the client.
    this.isOperational = true;

    //  Error.captureStackTrace is a function which tells us where the error happened. It gives the path of file with line number.
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

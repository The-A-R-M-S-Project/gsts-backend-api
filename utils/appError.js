class AppError extends Error {
  // extends Error class
  constructor(message, statusCode) {
    super(message); // this will set the message to our incoming message

    this.statusCode = statusCode;
    // 400 code errors are fails, 500 code errors are server errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // these errors are operational errors. We shall test for this to only send operational errors to client
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // stack trace will show us where the error happened
  }
}

module.exports = AppError;

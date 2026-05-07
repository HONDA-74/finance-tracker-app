export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Resource already exists";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
  }

  // Handle Joi validation errors
  if (Array.isArray(message)) {
    statusCode = 400;
    message = message.join(", ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

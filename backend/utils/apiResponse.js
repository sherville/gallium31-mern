function successResponse(res, message = "Request successful.", data = null, statusCode = 200) {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
}

function errorResponse(res, message = "Request failed.", error = null, statusCode = 500) {
  return res.status(statusCode).json({
    status: false,
    message,
    error,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
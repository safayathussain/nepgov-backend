const sendResponse = (res, { statusCode = 200, message = "", data = null, success = true }) => {
    res.status(statusCode).json({
      success,
      message,
      data: data ?? null,  // Ensuring explicit `null` if data is undefined
    });
  };
  
  module.exports = { sendResponse };
  
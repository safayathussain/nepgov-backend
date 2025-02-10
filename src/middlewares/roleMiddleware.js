const { sendResponse } = require("../utils/response");

module.exports = (roles) => (req, res, next) => {
  const userRole = req.role; 
  if (!roles.includes(userRole) && !roles.includes("user", "admin")) {
    return sendResponse(res, {message: "You dont have permissions for this action", statusCode: 500})
  }
  next();
};

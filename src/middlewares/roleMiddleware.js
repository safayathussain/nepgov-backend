const { sendResponse } = require("../utils/response");

module.exports = (roles) => (req, res, next) => {
  const userRole = req.adminRole|| req.role; 
  if (!roles.includes(userRole) && !roles.includes("user", "admin")) {
    return sendResponse(res, {message: "You don't have permissions for this action", statusCode: 403})
  }
  next();
};

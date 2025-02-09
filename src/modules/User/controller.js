const { validationResult } = require("express-validator");
const { sendResponse } = require("../../utils/response");
const userService = require("./service");

const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    sendResponse(res, {
      message: "Users retrived successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getAllUsers };

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
const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    sendResponse(res, {
      message: "Users deleted successfully",
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
const getUserById = async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);
    sendResponse(res, {
      message: "User retrived successfully",
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

module.exports = { getAllUsers, getUserById , deleteUser};

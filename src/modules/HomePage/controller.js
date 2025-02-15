// controller.js
const { validationResult } = require("express-validator");
const homePageService = require("./service");
const { sendResponse } = require("../../utils/response");

const getHomePage = async (req, res) => {
  try {
    const homePage = await homePageService.getHomePage();
    sendResponse(res, {
      message: "Homepage configuration retrieved successfully",
      data: homePage,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateHomePage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await homePageService.updateHomePage(req.body);
    sendResponse(res, {
      message: "Homepage configuration updated successfully",
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

module.exports = {
  getHomePage,
  updateHomePage
};
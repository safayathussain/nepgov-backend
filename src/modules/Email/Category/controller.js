const { validationResult } = require("express-validator");
const emailCategoryService = require("./service");
const { sendResponse } = require("../../../utils/response");

const createEmailCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailCategoryService.createEmailCategory(req.body);
    sendResponse(res, {
      message: "Email category created successfully",
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

const getAllEmailCategories = async (req, res) => {
  try {
    const categories = await emailCategoryService.getAllEmailCategories();
    sendResponse(res, {
      message: "Email categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getEmailCategoryById = async (req, res) => {
  try {
    const category = await emailCategoryService.getEmailCategoryById(req.params.id);
    sendResponse(res, {
      message: "Email category retrieved successfully",
      data: category,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateEmailCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailCategoryService.updateEmailCategory(req.params.id, req.body);
    sendResponse(res, {
      message: "Email category updated successfully",
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

const deleteEmailCategory = async (req, res) => {
  try {
    await emailCategoryService.deleteEmailCategory(req.params.id);
    sendResponse(res, {
      message: "Email category deleted successfully",
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
  createEmailCategory,
  getAllEmailCategories,
  getEmailCategoryById,
  updateEmailCategory,
  deleteEmailCategory,
};
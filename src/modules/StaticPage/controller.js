const { validationResult } = require("express-validator");
const staticPageService = require("./service");
const { sendResponse } = require("../../utils/response");

const createStaticPage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await staticPageService.createStaticPage(req.body);
    sendResponse(res, {
      message: "Static page created successfully",
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

const getAllStaticPages = async (req, res) => {
  try {
    const pages = await staticPageService.getAllStaticPages();
    sendResponse(res, {
      message: "Static pages retrieved successfully",
      data: pages,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getStaticPageById = async (req, res) => {
  try {
    const page = await staticPageService.getStaticPageById(req.params.id);
    sendResponse(res, {
      message: "Static page retrieved successfully",
      data: page,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getStaticPageByType = async (req, res) => {
  try {
    const page = await staticPageService.getStaticPageByType(req.params.page);
    sendResponse(res, {
      message: "Static page retrieved successfully",
      data: page,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateStaticPage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await staticPageService.updateStaticPage(req.params.id, req.body);
    sendResponse(res, {
      message: "Static page updated successfully",
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

const deleteStaticPage = async (req, res) => {
  try {
    await staticPageService.deleteStaticPage(req.params.id);
    sendResponse(res, {
      message: "Static page deleted successfully",
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
  createStaticPage,
  getAllStaticPages,
  getStaticPageById,
  getStaticPageByType,
  updateStaticPage,
  deleteStaticPage,
};
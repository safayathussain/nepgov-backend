const { validationResult } = require("express-validator");
const emailTemplateService = require("./service");
const { sendResponse } = require("../../../utils/response");

const createEmailTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailTemplateService.createEmailTemplate(req.body);
    sendResponse(res, {
      message: "Email template created successfully",
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

const getAllEmailTemplates = async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllEmailTemplates();
    sendResponse(res, {
      message: "Email templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getEmailTemplateById = async (req, res) => {
  try {
    const template = await emailTemplateService.getEmailTemplateById(req.params.id);
    sendResponse(res, {
      message: "Email template retrieved successfully",
      data: template,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateEmailTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailTemplateService.updateEmailTemplate(req.params.id, req.body);
    sendResponse(res, {
      message: "Email template updated successfully",
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

const deleteEmailTemplate = async (req, res) => {
  try {
    await emailTemplateService.deleteEmailTemplate(req.params.id);
    sendResponse(res, {
      message: "Email template deleted successfully",
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
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};
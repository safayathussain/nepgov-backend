const { validationResult } = require("express-validator");
const emailLogService = require("./service");
const { sendResponse } = require("../../../utils/response");

const sendEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailLogService.sendEmail(req, res);
    // sendResponse(res, {
    //   message: "Email queued successfully",
    //   data: result,
    // });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getEmailLog = async (req, res) => {
  try {
    const emailLog = await emailLogService.getEmailLog(req.params.id);
    sendResponse(res, {
      message: "Email log retrieved successfully",
      data: emailLog,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getAllEmailLogs = async (req, res) => {
  try {
    const emailLogs = await emailLogService.getAllEmailLogs();
    sendResponse(res, {
      message: "Email logs retrieved successfully",
      data: emailLogs,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateEmailStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const result = await emailLogService.updateEmailStatus(req.params.id, req.body.status);
    sendResponse(res, {
      message: "Email status updated successfully",
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
  sendEmail,
  getEmailLog,
  getAllEmailLogs,
  updateEmailStatus,
};
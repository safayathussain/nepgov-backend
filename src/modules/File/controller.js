const express = require("express");
const router = express.Router();
const { sendResponse } = require("../../utils/response");
const { uploadForFilesOnly } = require("./middleware");

const uploadFileHandler = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "No files uploaded",
      });
    }
    
    return sendResponse(res,{
      
      data: { files: req.files },
      message: "Files uploaded successfully",
      statusCode: 200,
      success: true,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

router.post("/upload-files", uploadForFilesOnly, uploadFileHandler);

module.exports = router; // Export the router directly

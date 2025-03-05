const { validationResult } = require("express-validator");
const trackerService = require("./service");
const { sendResponse } = require("../../utils/response");

const createTracker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await trackerService.createTracker({
      ...req.body,
      user: req.adminUser
    });
    
    sendResponse(res, {
      message: "Tracker created successfully",
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

const getAllTrackers = async (req, res) => {
  try {
    const trackers = await trackerService.getAllTrackers(req.query);
    sendResponse(res, {
      message: "Trackers retrieved successfully",
      data: trackers,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getTrackerById = async (req, res) => {
  try {
    const tracker = await trackerService.getTrackerById(req.params.id, req.user);
    sendResponse(res, {
      message: "Tracker retrieved successfully",
      data: tracker,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const checkVote = async (req, res) => {
  try {
    const tracker = await trackerService.checkVote(req.params.id, req.user);
    sendResponse(res, {
      message: "Tracker retrieved successfully",
      data: tracker,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const trackerResult = async (req, res) => {
  try {
    const tracker = await trackerService.trackerResult(req.params.id, req.query, req.user);
    sendResponse(res, {
      message: "Tracker retrieved successfully",
      data: tracker,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const deleteTracker = async (req, res) => {
  try {
    const tracker = await trackerService.deleteTracker(req.params.id);
    sendResponse(res, {
      message: "Tracker deleted successfully",
      data: tracker,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateTracker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await trackerService.updateTracker(req.params.id, req.body, req.user);
    sendResponse(res, {
      message: "Tracker updated successfully",
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

const voteTracker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result =  await trackerService.voteTracker(req.params.id, req.body.optionId, req.user);
    sendResponse(res, {
      data: result,
      message: "Vote recorded successfully",
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const addOption = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

  const result =  await trackerService.addOption(req.params.id, req.body, req.adminUser);
    sendResponse(res, {
      message: "Option added successfully",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const editOption = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

  const result =  await trackerService.editOption(req.params.optionId, req.body,  );
    sendResponse(res, {
      message: "Option edited successfully",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports = {createTracker, getAllTrackers, getTrackerById, updateTracker, voteTracker, addOption, editOption, deleteTracker, checkVote, trackerResult}
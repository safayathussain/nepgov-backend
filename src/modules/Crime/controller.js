const { validationResult } = require("express-validator");
const crimeService = require("./service");
const { sendResponse } = require("../../utils/response");

const createCrime = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });

    const crimeData = {
      ...req.body,
      user: req.user 
    };
    console.log(crimeData)
    const result = await crimeService.createCrime(crimeData);
    sendResponse(res, {
      message: "Crime report created successfully",
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

const getAllCrimes = async (req, res) => {
  try {
    const crimes = await crimeService.getAllCrimes();
    sendResponse(res, {
      message: "Crime reports retrieved successfully",
      data: crimes,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getCrimeById = async (req, res) => {
  try {
    const crime = await crimeService.getCrimeById(req.params.id);
    sendResponse(res, {
      message: "Crime report retrieved successfully",
      data: crime,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const deleteCrime = async (req, res) => {
  try {
    await crimeService.deleteCrime(req.params.id);
    sendResponse(res, {
      message: "Crime report deleted successfully",
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const markCrimeAsSeen = async (req, res) => {
  try {
    const crime = await crimeService.markCrimeAsSeen(req.params.id);
    sendResponse(res, {
      message: "Crime report marked as seen",
      data: crime,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const markAllAsSeen = async (req, res) => {
  try {
    await crimeService.markAllAsSeen();
    sendResponse(res, {
      message: "All crime reports marked as seen",
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
  createCrime,
  getAllCrimes,
  getCrimeById,
  deleteCrime,
  markCrimeAsSeen,
  markAllAsSeen,
};

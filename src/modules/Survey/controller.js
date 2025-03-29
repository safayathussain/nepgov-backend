const { validationResult } = require("express-validator");
const surveyService = require("./service");
const { sendResponse } = require("../../utils/response");
const fs = require("fs").promises;

const createSurvey = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }
    const result = await surveyService.createSurvey({
      ...req.body,
      questions: req.body?.questions,
      thumbnail: req.file ? `${req.file.filename}` : null,
      user: req.adminUser,
    });

    sendResponse(res, {
      message: "Survey created successfully",
      data: result,
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getAllSurveys = async (req, res) => {
  try {
    const surveys = await surveyService.getAllSurveys(req.query);
    sendResponse(res, {
      message: "Surveys retrieved successfully",
      data: surveys,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getSurveyById = async (req, res) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id);
    sendResponse(res, {
      message: "Survey retrieved successfully",
      data: survey,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateSurvey = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }
    const result = await surveyService.updateSurvey(
      req.params.id,
      {
        ...req.body,
        ...(req.file && { thumbnail: `${req.file.filename}` }),
      },
      req.adminUser
    );

    sendResponse(res, {
      message: "Survey updated successfully",
      data: result,
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    await surveyService.deleteSurvey(req.params.id, req.adminUser);
    sendResponse(res, {
      message: "Survey deleted successfully",
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const voteSurvey = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    await surveyService.voteSurvey(req.params.id, req.body.votes, req.user);

    sendResponse(res, {
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

const getSurveyResults = async (req, res) => {
  try {
    const results = await surveyService.getSurveyResults(req.params.id);
    sendResponse(res, {
      message: "Survey results retrieved successfully",
      data: results,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const getQuestionResults = async (req, res) => {
  try {
    const results = await surveyService.getQuestionResults(req.params.id, req.params.questionId, req.query);
    sendResponse(res, {
      message: "Survey question results retrieved successfully",
      data: results,
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
    const results = await surveyService.checkVote(req.params.id, req.user);
    sendResponse(res, {
      message: "Survey option selected by user retrieved successfully",
      data: results,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const addQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await surveyService.addQuestion(
      req.params.surveyId,
      req.body
    );
    sendResponse(res, {
      message: "Question added successfully",
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

const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await surveyService.updateQuestion(
      req.params.surveyId,
      req.params.questionId,
      req.body
    );
    sendResponse(res, {
      message: "Question updated successfully",
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

const removeQuestion = async (req, res) => {
  try {
    const result = await surveyService.removeQuestion(
      req.params.surveyId,
      req.params.questionId
    );
    sendResponse(res, {
      message: "Question removed successfully",
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

// Option Management Controllers
const addQuestionOption = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await surveyService.addQuestionOption(
      req.params.surveyId,
      req.params.questionId,
      req.body
    );
    sendResponse(res, {
      message: "Option added successfully",
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

const updateQuestionOption = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await surveyService.updateQuestionOption(
      req.params.optionId,
      req.body
    );
    sendResponse(res, {
      message: "Option updated successfully",
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

const removeQuestionOption = async (req, res) => {
  try {
    const result = await surveyService.removeQuestionOption(
      req.params.surveyId,
      req.params.questionId,
      req.params.optionId
    );
    sendResponse(res, {
      message: "Option removed successfully",
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
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  voteSurvey,
  getSurveyResults,
  getQuestionResults,
  addQuestion,
  addQuestionOption,
  removeQuestion,
  removeQuestionOption,
  updateQuestion,
  updateQuestionOption,
  checkVote,
};

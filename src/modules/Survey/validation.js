// validation/survey.validation.js
const { body } = require("express-validator");

const createSurveyValidation = [
  body("thumbnail").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Thumbnail file is required");
    }
    return true;
  }),
  body("topic").notEmpty().withMessage("Topic is required"),
  body("liveEndedAt")
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("liveStartedAt")
    .isISO8601()
    .withMessage("Live started at must be a valid date"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),
  body("questions.*.question")
    .notEmpty()
    .withMessage("Question text is required"),
  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each question must have at least 2 options"),
  body("questions.*.options.*.content")
    .notEmpty()
    .withMessage("Option content is required"),
  body("questions.*.options.*.color")
    .notEmpty()
    .withMessage("Option color is required"),
 
];

const updateSurveyValidation = [
  body("topic").optional().notEmpty().withMessage("Topic is required"),
  body("liveEndedAt")
    .optional()
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("liveStartedAt")
    .optional()
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),
  body("questions.*.question")
    .optional()
    .notEmpty()
    .withMessage("Question text is required"),
  body("questions.*.options")
    .optional()
    .isArray({ min: 2 })
    .withMessage("Each question must have at least 2 options"),
  body("questions.*.options.*.content")
    .optional()
    .notEmpty()
    .withMessage("Option content is required"),
  body("questions.*.options.*.color")
    .optional()
    .notEmpty()
    .withMessage("Option color is required"),
];

const voteValidation = [
  body("votes")
    .isArray({ min: 1 })
    .withMessage("Votes must be an array and cannot be empty"),

  body("votes.*.questionId")
    .notEmpty()
    .withMessage("Question ID is required for each vote"),

  body("votes.*.optionId")
    .notEmpty()
    .withMessage("Option ID is required for each vote"),
];

const addQuestionValidation = [
  body("question").notEmpty().withMessage("Question text is required"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("At least 2 options required"),
  body("options.*.content")
    .notEmpty()
    .withMessage("Option content is required"),
  body("options.*.color").notEmpty().withMessage("Option color is required"),
];

const addQuestionOptionValidation = [
  body("content").notEmpty().withMessage("Option content is required"),
  body("color").notEmpty().withMessage("Option color is required"),
];

const updateQuestionValidation = [
  body("question")
    .optional()
    .notEmpty()
    .withMessage("Question text is required"),
  body("options")
    .optional()
    .isArray({ min: 2 })
    .withMessage("At least 2 options required"),
  body("options.*.content")
    .optional()
    .notEmpty()
    .withMessage("Option content is required"),
  body("options.*.color")
    .optional()
    .notEmpty()
    .withMessage("Option color is required"),
];

const updateQuestionOptionValidation = [
  body("content")
    .optional()
    .notEmpty()
    .withMessage("Option content is required"),
  body("color").optional().notEmpty().withMessage("Option color is required"),
];

module.exports = {
  createSurveyValidation,
  updateSurveyValidation,
  voteValidation,
  addQuestionValidation,
  addQuestionOptionValidation,
  updateQuestionValidation,
  updateQuestionOptionValidation,
};

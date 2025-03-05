const { body } = require("express-validator");

const createTrackerValidation = [
  body("topic").notEmpty().withMessage("Topic is required"),
  body("liveEndedAt")
    .optional()
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("liveStartedAt")
    .optional()
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("At least 2 options required"),
  body("options.*.content")
    .notEmpty()
    .withMessage("Option content is required"),
  body("options.*.color").notEmpty().withMessage("Option color is required"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
];

const updateTrackerValidation = [
  body("topic").optional().notEmpty().withMessage("Topic cannot be empty"),
  body("liveEndedAt")
    .optional()
    .isISO8601()
    .withMessage("Live ended at must be a valid date"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
];

const voteValidation = [
  body("optionId").notEmpty().withMessage("Option ID is required"),
];
const addOptionValidation = [
  body("content").notEmpty().withMessage("Option content is required"),
  body("color").notEmpty().withMessage("Option color is required"),
];

module.exports = {
  voteValidation,
  updateTrackerValidation,
  createTrackerValidation,
  addOptionValidation,
};

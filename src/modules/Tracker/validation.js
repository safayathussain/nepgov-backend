const { body } = require("express-validator");

const createTrackerValidation = [
  body("topic").notEmpty().withMessage("Topic is required"),
  body("liveEndedAt")
    .optional({ nullable: true, checkFalsy: true })
    .if(body("liveEndedAt").exists().notEmpty())
    .isISO8601()
    .withMessage("Live end date must be a valid ISO8601 date"),
  body("liveStartedAt")
    .notEmpty()
    .isISO8601()
    .withMessage("Live start date must be a valid ISO8601 date"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("At least 2 options are required"),
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
    .optional({ nullable: true, checkFalsy: true })
    .if(body("liveEndedAt").exists().notEmpty())
    .isISO8601()
    .withMessage("Live end date must be a valid ISO8601 date"),
  body("liveStartedAt")
    .optional()
    .isISO8601()
    .withMessage("Live started at must be a valid date"),
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

// validations/categoryValidation.js
const { body } = require("express-validator");

const createCategoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("surveysCount").optional().isInt().withMessage("SurveysCount must be a number"),
  body("trackersCount").optional().isInt().withMessage("TrackersCount must be a number"),
  body("articleCount").optional().isInt().withMessage("ArticleCount must be a number"),
];

const updateCategoryValidation = [
  body("name").optional().notEmpty().withMessage("Category name cannot be empty"),
  body("surveysCount").optional().isInt().withMessage("SurveysCount must be a number"),
  body("trackersCount").optional().isInt().withMessage("TrackersCount must be a number"),
  body("articleCount").optional().isInt().withMessage("ArticleCount must be a number"),
];

module.exports = { createCategoryValidation, updateCategoryValidation };
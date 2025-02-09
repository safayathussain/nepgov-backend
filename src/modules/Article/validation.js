const { body } = require("express-validator");

const createArticleValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("categories")
    .isArray().withMessage("Categories must be an array")
    .custom(value => value.length > 0).withMessage("At least one category is required"),
];

const updateArticleValidation = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("categories")
    .optional()
    .isArray().withMessage("Categories must be an array")
    .custom(value => value.length > 0).withMessage("At least one category is required"),
];

module.exports = { createArticleValidation, updateArticleValidation };
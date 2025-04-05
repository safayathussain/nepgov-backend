const { body } = require("express-validator");

const createEmailCategoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
];

const updateEmailCategoryValidation = [
  body("name").optional().notEmpty().withMessage("Category name cannot be empty"),
];

module.exports = { createEmailCategoryValidation, updateEmailCategoryValidation };
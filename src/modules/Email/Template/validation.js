const { body } = require("express-validator");

const createEmailTemplateValidation = [
  body("name").notEmpty().withMessage("Template name is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("htmlContent").notEmpty().withMessage("HTML content is required"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
];

const updateEmailTemplateValidation = [
  body("name").optional().notEmpty().withMessage("Template name cannot be empty"),
  body("subject").optional().notEmpty().withMessage("Subject cannot be empty"),
  body("htmlContent").optional().notEmpty().withMessage("HTML content cannot be empty"),
  body("category").optional().isMongoId().withMessage("Valid category ID is required"),
];

module.exports = { createEmailTemplateValidation, updateEmailTemplateValidation };
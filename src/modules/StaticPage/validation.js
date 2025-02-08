const { body } = require("express-validator");

const VALID_PAGES = ["aboutUs", "cookie-policy", "privacy-policy", "terms-and-conditions"];

const createStaticPageValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("page")
    .notEmpty().withMessage("Page type is required")
    .isIn(VALID_PAGES).withMessage("Invalid page type. Must be one of: aboutUs, cookie-policy, privacy-policy, terms-and-conditions"),
];

const updateStaticPageValidation = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("page")
    .optional()
    .isIn(VALID_PAGES).withMessage("Invalid page type. Must be one of: aboutUs, cookie-policy, privacy-policy, terms-and-conditions"),
];

module.exports = { createStaticPageValidation, updateStaticPageValidation };
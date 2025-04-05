const { body } = require("express-validator");

const sendEmailValidation = [
  body("templateId")
    .isMongoId()
    .withMessage("Valid template ID is required"),
  body("recipients")
    .isArray({ min: 1 })
    .withMessage("Recipients must be a non-empty array"),
  body("recipients.*")
    .isMongoId()
    .withMessage("Each recipient must be a valid user ID"),
];
 

const updateEmailStatusValidation = [
  body("status")
    .isIn(["pending", "sent", "failed", "queued", "bounced", "delivered"])
    .withMessage("Invalid status value"),
];

module.exports = { sendEmailValidation, updateEmailStatusValidation };
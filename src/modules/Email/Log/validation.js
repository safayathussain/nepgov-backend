const { body } = require("express-validator");
 

const sendEmailValidation = [
  body("templateId")
    .isMongoId()
    .withMessage("Valid template ID is required"),
  body("recipients")
    .isArray({ min: 1 })
    .withMessage("Recipients must be a non-empty array"),
  body("recipients.*.email")
    .isEmail()
    .withMessage("Each recipient must have a valid email"),
  body("recipients.*.firstName")
    .isString()
    .notEmpty()
    .withMessage("Each recipient must have a first name"),
  body("recipients.*.lastName")
    .isString()
    .notEmpty()
    .withMessage("Each recipient must have a last name"),
];
 
 

const updateEmailStatusValidation = [
  body("status")
    .isIn(["pending", "sent", "failed", "queued", "bounced", "delivered"])
    .withMessage("Invalid status value"),
];

module.exports = { sendEmailValidation, updateEmailStatusValidation };
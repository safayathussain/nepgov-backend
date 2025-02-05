const { body } = require("express-validator");

const registerValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("dob").notEmpty().withMessage("Date of birth is required"),
  body("gender").isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
  body("postCode").notEmpty().withMessage("Postcode is required"),
];

const emailValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

const otpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const resetPasswordValidation = [
  ...otpValidation,
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

module.exports = { registerValidation, emailValidation, otpValidation, resetPasswordValidation };

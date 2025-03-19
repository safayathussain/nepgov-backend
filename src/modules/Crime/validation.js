const { body } = require("express-validator");

 

const createCrimeValidation = [
  // Required string fields
  body("crimeType")
    .trim()
    .notEmpty()
    .withMessage("Crime type is required"),
  
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("crimeDetails")
    .trim()
    .notEmpty()
    .withMessage("Crime details are required"),

  // Optional string fields
  body("additionalLocationDetails")
    .trim()
    .optional({ nullable: true }),

  body("personDetails")
    .trim()
    .optional({ nullable: true }),

  body("personAppearance")
    .trim()
    .optional({ nullable: true }),

  body("personContact")
    .trim()
    .optional({ nullable: true }),

  // Enum fields
  body("hasVehicle")
    .notEmpty()
    .withMessage("Vehicle status is required")
    .isIn(["yes", "no", "dontKnow"])
    .withMessage("Vehicle status must be 'yes', 'no', or 'dontKnow'"),

  body("hasWeapon")
    .notEmpty()
    .withMessage("Weapon status is required")
    .isIn(["yes", "no", "dontKnow"])
    .withMessage("Weapon status must be 'yes', 'no', or 'dontKnow'"),
 
];

module.exports = { createCrimeValidation };
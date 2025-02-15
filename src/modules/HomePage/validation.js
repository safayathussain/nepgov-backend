// validation.js
const { body } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const updateHomePageValidation = [
  body("hero.dailyQuestion")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid daily question ID"),

  body("featuredSurveyTracker.surveys.*")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid survey ID"),

  body("featuredSurveyTracker.trackers.*")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid tracker ID"),

  body("liveSurveyTracker.*.id")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid ID in liveSurveyTracker"),

  body("liveSurveyTracker.*.type")
    .optional()
    .isIn(["Survey", "Tracker"])
    .withMessage("Type must be either Survey or Tracker"),
];

module.exports = { updateHomePageValidation };
const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const upload = require("../../utils/upload");
const {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  voteSurvey,
  getSurveyResults,
  addQuestion,
  addQuestionOption,
  removeQuestion,
  removeQuestionOption,
  updateQuestion,
  updateQuestionOption
} = require("./controller");

const {
  createSurveyValidation,
  updateSurveyValidation,
  voteValidation,
  addQuestionValidation,
  addQuestionOptionValidation,
  updateQuestionValidation,
  updateQuestionOptionValidation
} = require("./validation");

// Survey CRUD operations
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createSurveyValidation,
  upload.single("thumbnail"),
  createSurvey
);

router.get("/", getAllSurveys);
router.get("/:id", getSurveyById);
router.get("/:id/results", getSurveyResults);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateSurveyValidation,
  upload.single("thumbnail"),
  updateSurvey
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteSurvey
);

// Voting
router.post(
  "/:id/vote",
  authMiddleware,
  voteValidation,
  voteSurvey
);

// Question Management
router.post(
  "/:surveyId/question",
  authMiddleware,
  roleMiddleware(["admin"]),
  addQuestionValidation,
  addQuestion
);

router.put(
  "/:surveyId/question/:questionId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateQuestionValidation,
  updateQuestion
);

router.delete(
  "/:surveyId/question/:questionId",
  authMiddleware,
  roleMiddleware(["admin"]),
  removeQuestion
);

// Option Management
// add option
router.post(
  "/:surveyId/question/:questionId/option",
  authMiddleware,
  roleMiddleware(["admin"]),
  addQuestionOptionValidation,
  addQuestionOption
);
// update option
router.put(
  "/:surveyId/question/:questionId/option/:optionId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateQuestionOptionValidation,
  updateQuestionOption
);
// delete option
router.delete(
  "/:surveyId/question/:questionId/option/:optionId",
  authMiddleware,
  roleMiddleware(["admin"]),
  removeQuestionOption
);

module.exports = router;

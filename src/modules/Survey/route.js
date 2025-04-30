const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { setFolderName } = require("../../middlewares/middlewares");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { folders } = require("../../utils/constants");
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
  updateQuestionOption,
  checkVote,
  getQuestionResults,
} = require("./controller");

const {
  createSurveyValidation,
  updateSurveyValidation,
  voteValidation,
  addQuestionValidation,
  addQuestionOptionValidation,
  updateQuestionValidation,
  updateQuestionOptionValidation,
} = require("./validation");

// Survey CRUD operations
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  setFolderName(folders.surveys),
  upload.single("thumbnail"),
  createSurveyValidation,
  createSurvey
);

router.get("/", getAllSurveys);
router.get("/result/:id/:questionId", getQuestionResults);
router.get("/result/:id", getSurveyResults);
router.get("/checkVote/:id", authMiddleware, checkVote);
router.get("/:id", getSurveyById);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateSurveyValidation,
  setFolderName(folders.surveys),
  upload.single("thumbnail"),
  updateSurvey
);

router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteSurvey);

// Voting
router.post("/:id/vote", authMiddleware, voteValidation, voteSurvey);

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

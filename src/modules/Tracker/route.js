const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  createTracker,
  getAllTrackers,
  getTrackerById,
  updateTracker,
  voteTracker,
  addOption,
  editOption,
  deleteTracker,
  checkVote,
} = require("./controller");
const {
  createTrackerValidation,
  updateTrackerValidation,
  voteValidation,
  addOptionValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createTrackerValidation,
  createTracker
);

router.get("/", getAllTrackers);
router.get("/checkVote/:id", authMiddleware, checkVote);
router.get("/:id", getTrackerById);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateTrackerValidation,
  updateTracker
);
router.post(
  "/add-option/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  addOptionValidation,
  addOption
);
router.put(
  "/edit-option/:optionId",
  authMiddleware,
  roleMiddleware(["admin"]),
  addOptionValidation,
  editOption
);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteTracker
);
router.post(
  "/:id/vote",
  authMiddleware,
  voteValidation,
  voteTracker
);

module.exports = router;
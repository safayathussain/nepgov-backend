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

router.post(
  "/:id/vote",
  authMiddleware,
  roleMiddleware(["admin"]),
  voteValidation,
  voteTracker
);

module.exports = router;
// route.js
const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  getHomePage,
  updateHomePage,
} = require("./controller");
const { updateHomePageValidation } = require("./validation");

router.get("/", getHomePage);
router.put(
  "/update",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateHomePageValidation,
  updateHomePage
);

module.exports = router;
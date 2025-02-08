// router.js
const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  createStaticPage,
  getAllStaticPages,
  getStaticPageById,
  getStaticPageByType,
  updateStaticPage,
  deleteStaticPage,
} = require("./controller");
const {
  createStaticPageValidation,
  updateStaticPageValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createStaticPageValidation,
  createStaticPage
);
router.get("/", getAllStaticPages);
router.get("/page/:page", getStaticPageByType);
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateStaticPageValidation,
  updateStaticPage
);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteStaticPage
);
router.get("/:id", getStaticPageById);

module.exports = router;

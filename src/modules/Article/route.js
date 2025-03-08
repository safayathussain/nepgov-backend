const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const upload = require("../../utils/upload");
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("./controller");
const {
  createArticleValidation,
  updateArticleValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("thumbnail"),
  createArticleValidation,
  createArticle
);
router.get("/", getAllArticles);
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("thumbnail"),
  updateArticleValidation,
  updateArticle
);
router.delete("/delete/:id", authMiddleware, roleMiddleware(["admin"]), deleteArticle);
router.get("/:id", getArticleById);

module.exports = router;

const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("./controller");
const {
  createCategoryValidation,
  updateCategoryValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createCategoryValidation,
  createCategory
);
router.get("/", getAllCategories);
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateCategoryValidation,
  updateCategory
);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteCategory
);
router.get("/:id", getCategoryById);

module.exports = router;

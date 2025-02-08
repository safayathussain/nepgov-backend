// router.js
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

router.post("/create-category", authMiddleware, roleMiddleware(["admin"]), createCategoryValidation, createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/update-category/:id", authMiddleware,roleMiddleware(["admin"]), updateCategoryValidation, updateCategory);
router.delete("/delete-category/:id", authMiddleware,roleMiddleware(["admin"]), deleteCategory);

module.exports = router;

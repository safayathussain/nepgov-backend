const router = require("express").Router();
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const {
  createEmailCategory,
  getAllEmailCategories,
  getEmailCategoryById,
  updateEmailCategory,
  deleteEmailCategory,
} = require("./controller");
const {
  createEmailCategoryValidation,
  updateEmailCategoryValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createEmailCategoryValidation,
  createEmailCategory
);
router.get("/", getAllEmailCategories);
router.get("/:id", getEmailCategoryById);
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateEmailCategoryValidation,
  updateEmailCategory
);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteEmailCategory
);

module.exports = router;
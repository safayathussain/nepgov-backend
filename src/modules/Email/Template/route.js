const router = require("express").Router();
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require("./controller");
const {
  createEmailTemplateValidation,
  updateEmailTemplateValidation,
} = require("./validation");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  createEmailTemplateValidation,
  createEmailTemplate
);
router.get("/", getAllEmailTemplates);
router.get("/:id", getEmailTemplateById);
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateEmailTemplateValidation,
  updateEmailTemplate
);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteEmailTemplate
);

module.exports = router;
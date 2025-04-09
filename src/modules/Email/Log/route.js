const router = require("express").Router();
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const {
  sendEmail,
  getEmailLog,
  getAllEmailLogs,
  updateEmailStatus,
} = require("./controller");
const {
  sendEmailValidation,
  updateEmailStatusValidation,
} = require("./validation");
const EmailLog = require("./model")
router.post(
  "/send",
  authMiddleware,
  roleMiddleware(["admin"]),
  sendEmailValidation,
  sendEmail
);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllEmailLogs);
router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getEmailLog);
router.put(
  "/status/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateEmailStatusValidation,
  updateEmailStatus
);

 

module.exports = router;
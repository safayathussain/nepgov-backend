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

// Webhook route (unchanged)
router.post("/webhook", async (req, res) => {
 return res.status(200).json({ message: "Webhook processed successfully" });

  try {
    const { RecordType, MessageID, DeliveredAt, BouncedAt, Details } = req.body;

    const emailLog = await EmailLog.findOne({ postmarkMessageId: MessageID });
    if (!emailLog) {
      return res.status(404).json({ message: "Email log not found" });
    }

    let newStatus = emailLog.status;
    if (RecordType === "Delivery") {
      newStatus = "delivered";
    } else if (RecordType === "Bounce") {
      newStatus = "bounced";
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        errorMessage: Details || "Email bounced",
      });
    }

    await emailLogService.updateEmailStatus(emailLog._id, newStatus);
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ message: "Failed to process webhook" });
  }
});

module.exports = router;
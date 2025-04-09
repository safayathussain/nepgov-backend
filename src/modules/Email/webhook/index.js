const EmailLog = require("../Log/model")

const postMarkWebhook = async(req, res) => {
    
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
}

module.exports = {postMarkWebhook}
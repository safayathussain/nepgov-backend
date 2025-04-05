const postmark = require("postmark");
const EmailLog = require("./model");
const EmailTemplate = require("../Template/model");
const User = require("../../User/model");

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}
// Initialize Postmark client
let client;
try {
  client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
} catch (error) {
  console.error("Failed to initialize Postmark client:", error.message);
}

const sendEmail = async (req, res) => {
  const { templateId, recipients } = req.body;

  if (!templateId || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Template ID and an array of recipients are required",
    });
  }

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    const users = await User.find({ _id: { $in: recipients } });
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No valid users found" });
    }

    const emailPromises = users.map(async (user) => {
      if (!user.email) return null;

      const emailLog = await EmailLog.create({
        template: templateId,
        recipient: user._id,
        status: "pending",
        createdAt: new Date(),
      });

      return client
        .sendEmail({
          From: process.env.POSTMARK_SENDER_EMAIL,
          To: user.email,
          Subject: template.subject,
          HtmlBody: template.htmlContent.replace(
            "[first name]",
            user.firstName?.trim() || user.email.split("@")[0] || "User"
          ),
        })
        .then((response) => {
          const status = (response.Status || "queued").toLowerCase();
          return EmailLog.findByIdAndUpdate(
            emailLog._id,
            {
              status: status === "queued" ? "queued" : "sent",
              postmarkMessageId: response.MessageID,
              sentAt: new Date(),
            },
            { new: true }
          );
        })
        .catch((error) => {
          return EmailLog.findByIdAndUpdate(
            emailLog._id,
            {
              status: "failed",
              errorMessage: error.message,
              failedAt: new Date(),
            },
            { new: true }
          ).then(() => Promise.reject(error));
        });
    });

    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter((r) => r.status === "fulfilled").length;

    return results.map((r) => ({
      status: r.status,
      value: r.value?._id || r.reason?.message,
    }));
  } catch (error) {
    console.error("Bulk email sending failed:", error);
    return 
  }
};
const getEmailLog = async (id) => {
  const emailLog = await EmailLog.findById(id)
    .populate("template")
    .populate("recipient");
  if (!emailLog) throw new Error("Email log not found");
  return emailLog;
};

const getAllEmailLogs = async () => {
  return await EmailLog.find({})
    .sort({ createdAt: -1 })
    .populate("template")
    .populate("recipient");
};

const updateEmailStatus = async (id, status) => {
  const emailLog = await EmailLog.findById(id);
  if (!emailLog) throw new Error("Email log not found");

  const updatedEmailLog = await EmailLog.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )
    .populate("template")
    .populate("recipient");
  return updatedEmailLog;
};

module.exports = {
  sendEmail,
  getEmailLog,
  getAllEmailLogs,
  updateEmailStatus,
};

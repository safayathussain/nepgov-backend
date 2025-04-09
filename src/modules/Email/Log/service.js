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

  // Input validation
  if (!templateId || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Template ID and an array of recipients are required",
    });
  }

  try {
    // Fetch template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    // Fetch users
    const users = await User.find({ _id: { $in: recipients } });
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No valid users found" });
    }

    // Create email logs and prepare batch email data
    const emailData = await Promise.all(
      users.map(async (user) => {
        if (!user.email) return null;

        const emailLog = await EmailLog.create({
          template: templateId,
          recipient: user._id,
          status: "pending",
          createdAt: new Date(),
        });

        const htmlContent = template.htmlContent.replace(
          "[first name]",
          user.firstName?.trim() || user.email.split("@")[0] || "User"
        );

        return {
          From: process.env.POSTMARK_SENDER_EMAIL,
          To: user.email,
          Subject: template.subject,
          HtmlBody: htmlContent,
          TextBody: template.textContent || htmlContent.replace(/<[^>]*>/g, "").trim(),
          TrackOpens: true,
          Tag: `broadcast-${templateId}`,
          Metadata: { userId: user._id.toString(), templateId, emailLogId: emailLog._id },
          MessageStream: "broadcast"
        };
      })
    );

    // Filter out null entries (users without emails)
    const validEmailData = emailData.filter(Boolean);

    if (validEmailData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses found among recipients",
      });
    }

    // Send emails in a batch
    const batchResponses = await client.sendEmailBatch(validEmailData);

    // Update email logs based on batch responses
    const updatePromises = batchResponses.map(async (response, index) => {
      const emailLogId = validEmailData[index].Metadata.emailLogId;
      const status = (response.Status || "queued").toLowerCase();

      if (response.ErrorCode === 0) {
        // Success
        return EmailLog.findByIdAndUpdate(
          emailLogId,
          {
            status: status === "queued" ? "queued" : "sent",
            postmarkMessageId: response.MessageID,
            queuedAt: new Date(),
          },
          { new: true }
        );
      } else {
        // Failure
        return EmailLog.findByIdAndUpdate(
          emailLogId,
          {
            status: "failed",
            errorMessage: response.Message,
            failedAt: new Date(),
          },
          { new: true }
        );
      }
    });

    const updatedLogs = await Promise.all(updatePromises);

    // Prepare response
    const successful = batchResponses.filter((r) => r.ErrorCode === 0).length;
    const failed = batchResponses.length - successful;

    return res.status(200).json({
      success: true,
      message: `Broadcast processed: ${successful} queued, ${failed} failed`,
      data: batchResponses.map((r, index) => ({
        status: r.ErrorCode === 0 ? "queued" : "failed",
        email: validEmailData[index].To,
        messageId: r.MessageID,
        error: r.ErrorCode !== 0 ? r.Message : null,
        emailLogId: validEmailData[index].Metadata.emailLogId,
      })),
    });
  } catch (error) {
    console.error("Broadcast email sending failed:", error);
    return res.status(500).json({
      success: false,
      message: `Broadcast email sending failed: ${error.message}`,
    });
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

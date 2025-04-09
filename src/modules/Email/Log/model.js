const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    recipient: {
      type: String, //email
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (optional)
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "queued", "bounced", "delivered"],
      default: "pending",
    },
    postmarkMessageId: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);

const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailTemplate",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
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
}, {
  timestamps: true,
});

module.exports = mongoose.model("EmailLog", emailLogSchema);
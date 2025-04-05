const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailCategory",
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
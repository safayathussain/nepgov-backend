const mongoose = require("mongoose");

const staticPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ["about-us", "cookie-policy", "privacy-policy", "terms-and-conditions"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("StaticPage", staticPageSchema);
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  surveysCount: {
    type: Number,
    default: 0
  },
  trackersCount: {
    type: Number,
    default: 0
  },
  articleCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
const mongoose = require("mongoose");

const emailCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }, 
  templateCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("EmailCategory", emailCategorySchema);
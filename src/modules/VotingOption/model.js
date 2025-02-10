const { default: mongoose } = require("mongoose");

const votingOptionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  votedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("VotingOption", votingOptionSchema)
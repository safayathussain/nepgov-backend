// model.js
const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  options: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "VotingOption"
  }],
  liveEndedAt: {
    type: Date,
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  votedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});



const trackerVoteSchema = new mongoose.Schema({
  tracker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tracker",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  option: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VotingOption",
    required: true
  }
}, {
  timestamps: true
});

const trackerOptionSchema = new mongoose.Schema({
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

module.exports = {
  Tracker: mongoose.model("Tracker", trackerSchema),
  TrackerVote: mongoose.model("TrackerVote", trackerVoteSchema),
  TrackerOption: mongoose.model("TrackerOption", trackerOptionSchema)
};

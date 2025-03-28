// model.js
const mongoose = require("mongoose");

const homePageSchema = new mongoose.Schema({
  hero: {
    dailyQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tracker'
    }
  },
  featuredSurveyTracker: {
    surveys: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey'
    }],
    trackers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tracker'
    }],
    articles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    }]
  },
  liveSurveyTracker: [{
    data: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'liveSurveyTracker.type'
    },
    type: {
      type: String,
      enum: ['Survey', 'Tracker'],
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("HomePage", homePageSchema);
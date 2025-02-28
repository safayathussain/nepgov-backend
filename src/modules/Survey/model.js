const mongoose = require("mongoose");

const surveyQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurveyQuestionOption",
      },
    ],
  }
);

const surveySchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    questions: [surveyQuestionSchema],
   
    liveEndedAt: {
      type: Date,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    thumbnail: {
      type: String,
      required: true,
    }, 
  },
  {
    timestamps: true,
  }
);

const surveyVoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyQuestion",
      required: true,
    },
    option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyQuestionOption",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const surveyQuestionOptionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    votedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Survey: mongoose.model("Survey", surveySchema),
  SurveyVote: mongoose.model("SurveyVote", surveyVoteSchema),
  SurveyQuestionOption: mongoose.model(
    "SurveyQuestionOption",
    surveyQuestionOptionSchema
  ),
};
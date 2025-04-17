const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state_province: { type: String, default: "" },
    country: { type: String, default: "" },
    profilePicture: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    postCode: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const UserProfileSurveySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reasonForJoining: { type: String, required: true },
    politicalParty: { type: String, required: true },
    ethnicity: { type: String, required: true },
    highestQualification: { type: String, required: true },
    consentCategories: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const UserProfileSurvey = mongoose.model(
  "UserProfileSurvey",
  UserProfileSurveySchema
);

const User = mongoose.model("User", userSchema);
module.exports = { User, UserProfileSurvey };

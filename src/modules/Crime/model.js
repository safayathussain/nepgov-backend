const mongoose = require("mongoose");

const CrimeSchema = new mongoose.Schema(
  {
    crimeType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrimeType",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    additionalLocationDetails: {
      type: String,
      default: "",
    },
    time: {
      type: String,
    },
    crimeDetails: {
      type: String,
      required: true,
    },
    personDetails: {
      type: String,
      default: "",
    },
    personAppearance: {
      type: String,
      default: "",
    },
    personContact: {
      type: String,
      default: "",
    },
    hasVehicle: {
      type: String,
      enum: ["yes", "no", "dontKnow"],
      required: true,
    },
    hasWeapon: {
      type: String,
      enum: ["yes", "no", "dontKnow"],
      required: true,
    },
    isSeenByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CrimeTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = {
  Crime: mongoose.model("Crime", CrimeSchema),
  CrimeType: mongoose.model("CrimeType", CrimeTypeSchema),
};

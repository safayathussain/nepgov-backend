const mongoose = require("mongoose");

const CrimeSchema = new mongoose.Schema(
  {
    crimeType: {
      type: String,
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

module.exports = mongoose.model("Crime", CrimeSchema);


const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    hostname: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    assessment: {
      type: String,
      required: true,
    },

    warnings: [
      {
        code: String,
        message: String,
      },
    ],

    // Google Safe Browsing results
    threatStatus: {
      type: String,
      enum: ["unsafe", "no_match", "unavailable"],
      default: "unavailable",
    },

    threatTypes: {
      type: [String],
      default: [],
    },

    threatCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Scan", scanSchema);

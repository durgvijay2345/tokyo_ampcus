const mongoose = require("mongoose");

const { Schema } = mongoose;

const CommitSchema = new Schema(
  {
    sha: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    author: {
      type: String,
    },
    date: {
      type: Date,
    },

    classification: {
      type: String,
      default: "Other",
    },
    classificationConfidence: {
      type: Number,
      default: 0,
    },
    classificationReasoning: {
      type: String,
    },

    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
    filesChanged: {
      type: Number,
      default: 0,
    },

    impact: {
      type: Number,
      default: 0,
    },
    impactBreakdown: {
      ai_explanation: {
        type: String,
      },
    },
  },
  {
    _id: false,
  },
);

module.exports = CommitSchema;

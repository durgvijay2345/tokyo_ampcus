const mongoose = require("mongoose");

const { Schema } = mongoose;

const InsightSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["critical", "warning", "info", "success"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    actionable: {
      type: String,
    },
    metrics: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  },
);

module.exports = InsightSchema;

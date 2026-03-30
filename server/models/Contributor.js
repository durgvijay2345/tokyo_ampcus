const mongoose = require("mongoose");

const { Schema } = mongoose;

const ContributorSchema = new Schema(
  {
    login: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
    },

    // Stats
    commits: {
      type: Number,
      default: 0,
    },
    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
    linesChanged: {
      type: Number,
      default: 0,
    },
    filesChanged: {
      type: Number,
      default: 0,
    },
    pullRequests: {
      type: Number,
      default: 0,
    },

    // Impact
    impactScore: {
      type: Number,
      default: 0,
    },
    totalImpact: {
      type: Number,
      default: 0,
    },
    maxImpact: {
      type: Number,
      default: 0,
    },

    // AI Distributions
    classifications: {
      Feature: { type: Number, default: 0 },
      "Bug Fix": { type: Number, default: 0 },
      Refactor: { type: Number, default: 0 },
      Documentation: { type: Number, default: 0 },
      Other: { type: Number, default: 0 },
    },

    topAreas: [
      {
        path: {
          type: String,
        },
        count: {
          type: Number,
        },
        _id: false,
      },
    ],

    hourlyActivity: {
      type: [Number],
      default: [],
    },
    dailyActivity: {
      type: [Number],
      default: [],
    },
    commitDates: {
      type: [Date],
      default: [],
    },
  },
  {
    _id: false,
  },
);

module.exports = ContributorSchema;

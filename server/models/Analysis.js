const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const CommitSchema = require("./Commit");
const ContributorSchema = require("./Contributor");
const InsightSchema = require("./Insight");

const AnalysisSchema = new Schema(
  {
    repoUrl: {
      type: String,
      required: true,
      index: true,
    },
    repoName: {
      type: String,
      default: "",
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    summary: {
      totalCommits: {
        type: Number,
        default: 0,
      },
      totalContributors: {
        type: Number,
        default: 0,
      },
      totalPullRequests: {
        type: Number,
        default: 0,
      },
      totalLinesChanged: {
        type: Number,
        default: 0,
      },
      healthScore: {
        type: Number,
        default: 0,
      },
      busFactor: {
        type: Number,
        default: 0,
      },
    },

    result: {
      repository: {
        type: Schema.Types.Mixed,
      },
      summary: {
        type: Schema.Types.Mixed,
      },
      contributors: {
        type: [ContributorSchema],
        default: [],
      },
      commits: {
        type: [CommitSchema],
        default: [],
      },
      classificationDistribution: {
        type: Schema.Types.Mixed,
      },
      timeline: {
        daily: {
          type: [Schema.Types.Mixed],
          default: [],
        },
        weekly: {
          type: [Schema.Types.Mixed],
          default: [],
        },
      },
      busFactor: {
        type: Schema.Types.Mixed,
      },
      healthScore: {
        type: Schema.Types.Mixed,
      },
      codeChurn: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      insights: {
        type: [InsightSchema],
        default: [],
      },
      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    collection: "analyses",
  },
);

module.exports = model("Analysis", AnalysisSchema);

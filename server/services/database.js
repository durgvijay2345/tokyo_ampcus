

const mongoose = require('mongoose');

const Analysis = require('../models/Analysis');



async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tokyo_pulse';
  await mongoose.connect(uri);
  console.log(' Connected to MongoDB');
}


async function saveAnalysis(repoUrl, result) {
  const doc = {
    repoUrl,
    repoName: result.repository?.name || repoUrl,
    analyzedAt: result.analyzedAt || new Date(),
    summary: {
      totalCommits:      result.summary?.totalCommits      || 0,
      totalContributors: result.summary?.totalContributors  || 0,
      healthScore:       result.healthScore?.overall        || 0,
      busFactor:         result.busFactor?.value             || 0
    },
    result
  };

  return Analysis.findOneAndReplace(
    { repoUrl },
    doc,
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
}


async function getAnalysisList() {
  const docs = await Analysis.find()
    .sort({ analyzedAt: -1 })
    .limit(20)
    .select('repoUrl repoName analyzedAt summary')
    .lean();

  return docs.map(d => ({
    id:         d._id.toString(),
    repoUrl:    d.repoUrl,
    repoName:   d.repoName,
    analyzedAt: d.analyzedAt,
    summary:    d.summary
  }));
}

async function getAnalysisById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Analysis.findById(id).lean();
  return doc ? doc.result : null;
}

async function getAnalysisByUrl(repoUrl) {
  const doc = await Analysis.findOne({ repoUrl })
    .sort({ analyzedAt: -1 })
    .lean();

  if (!doc) return null;

  // Check freshness (10-minute TTL)
  const age = Date.now() - new Date(doc.analyzedAt).getTime();
  if (age > 10 * 60 * 1000) return null;

  return doc.result;
}

async function deleteAnalysis(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await Analysis.findByIdAndDelete(id);
  return result != null;
}

module.exports = { connectDB, saveAnalysis, getAnalysisList, getAnalysisById, getAnalysisByUrl, deleteAnalysis };
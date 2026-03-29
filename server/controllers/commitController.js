const Analysis = require("../models/Analysis");

exports.getCommitsByAnalysisId = async (req, res) => {
  try {
    const doc = await Analysis.findById(req.params.analysisId)
      .select("result.commits")
      .lean();

    if (!doc) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(doc.result.commits || []);
  } catch (err) {
    console.log("Commits route error:", err.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
};

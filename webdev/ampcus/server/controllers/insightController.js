const Analysis = require('../models/Analysis');

exports.getInsightsByAnalysisId = async (req, res) => {
  try {
    const doc = await Analysis.findById(req.params.analysisId).select('result.insights').lean();
    if (!doc) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(doc.result.insights || []);
  } catch (err) {
    console.error('Insights route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
};

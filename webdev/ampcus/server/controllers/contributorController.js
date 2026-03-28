const Analysis = require('../models/Analysis');

exports.getContributorsByAnalysisId = async (req, res) => {
  try {
    const doc = await Analysis.findById(req.params.analysisId).select('result.contributors').lean();
    if (!doc) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(doc.result.contributors || []);
  } catch (err) {
    console.error('Contributors route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
};

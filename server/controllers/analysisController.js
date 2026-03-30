const { fetchRepository } = require('../services/github');
const { analyze } = require('../services/analyzer');
const cache = require('../services/cache');
const db = require('../services/database');

exports.checkHealth = (req, res) => {
  res.json({
    status: 'ok',
    service: 'TOKYO PULSE API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    modules: ['github', 'analyzer', 'ai-classifier', 'ai-impact', 'ai-insights', 'mongodb', 'cache']
  });
};

exports.analyzeRepository = async (req, res) => {
  try {
    const { repoUrl, token } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    // Check cache first (hot path)
    const cacheKey = `analysis:${repoUrl}`;
    if (await cache.has(cacheKey)) {
      console.log(' Returning cached result (cache)');
      return res.json({ ...(await cache.get(cacheKey)), cached: true, source: 'cache' });
    }

    // Check persistent database (warm path)
    const stored = await db.getAnalysisByUrl(repoUrl);
    if (stored) {
      console.log(' Returning stored result (database)');
      await cache.set(cacheKey, stored); // Refresh cache
      return res.json({ ...stored, cached: true, source: 'database' });
    }

    // Fetch from GitHub and analyze (cold path)
    const repoData = await fetchRepository(repoUrl, token);
    const result = await analyze(repoData);

    // Store in both cache and database
    await cache.set(cacheKey, result);
    await db.saveAnalysis(repoUrl, result);

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found. Check the URL and ensure it is public.' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded. Try again later or provide a GitHub token.' });
    }

    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await db.getAnalysisList();
    res.json(history);
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const result = await db.getAnalysisById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json({ ...result, source: 'database' });
  } catch (err) {
    console.error('Analysis lookup error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve analysis' });
  }
};

exports.deleteHistoryById = async (req, res) => {
  try {
    const success = await db.deleteAnalysisById(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    // Note: Since we don't have the repoUrl, we can't reliably flush its specific cache key here, 
    // but the db entry is gone. Hot cache will naturally timeout.
    res.json({ message: 'Analysis deleted successfully' });
  } catch (err) {
    console.error('Delete history error:', err.message);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
};

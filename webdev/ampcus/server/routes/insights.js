const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');


router.get('/:analysisId', insightController.getInsightsByAnalysisId);

module.exports = router;
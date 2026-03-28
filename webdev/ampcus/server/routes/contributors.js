const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorController');


router.get('/:analysisId', contributorController.getContributorsByAnalysisId);

module.exports = router;

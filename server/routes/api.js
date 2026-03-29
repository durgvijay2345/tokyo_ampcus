
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');


router.get('/health', analysisController.checkHealth);


router.post('/analyze', analysisController.analyzeRepository);


router.get('/history', analysisController.getHistory);


router.get('/analysis/:id', analysisController.getAnalysisById);


router.delete('/history/:id', analysisController.deleteHistoryById);


router.use('/commits', require('./commits'));
router.use('/contributors', require('./contributors'));
router.use('/insights', require('./insights'));

module.exports = router;
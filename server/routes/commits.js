const express = require("express");
const router = express.Router();

const { getCommitsByAnalysisId } = require("../controllers/commitController");

router.get("/:analysisId", getCommitsByAnalysisId);

module.exports = router;

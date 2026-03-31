const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;

function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "No GEMINI_API_KEY found in .env. Falling back to heuristic analysis.",
    );
    return false;
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return true;
}

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });
}

function normalizeCommits(commits) {
  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit?.message || "",
    stats: c.stats || { additions: 0, deletions: 0, total: 0 },
    files: (c.files || []).map((f) => ({
      filename: f.filename,
      patch: f.patch ? f.patch.substring(0, 800) : "",
    })),
  }));
}

function safeParseJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed))
      throw new Error("Gemini did not return an array");
    return parsed;
  } catch (error) {
    console.error("❌ JSON parse error:", error.message);
    return null;
  }
}

function toResultMap(arr) {
  const map = new Map();
  for (const item of arr) {
    if (item.sha) map.set(item.sha, item);
  }
  return map;
}

async function analyzeCommitsBatch(commits) {
  if (!genAI && !initializeGemini()) {
    return null;
  }

  const model = getModel();
  const payload = normalizeCommits(commits);

  const prompt = `
You are an expert GitHub repository analyzer. I am providing you with an array of commit objects. 
Each object contains the commit 'sha', the commit 'message', overall 'stats' (additions/deletions), and the modified 'files' (filename and code patch).

Your task is to analyze each commit and return a JSON array of objects.
For each commit, you must provide EXACTLY these fields:
- "sha": The exact same SHA string from the input.
- "classification": Exactly one of ["Feature", "Bug Fix", "Refactor", "Documentation", "Other"].
- "score": A float between 0.0 and 100.0 representing the impact score of the commit. Consider the size of the diff, the complexity of the changes, and whether critical files were touched.
- "summary": A concise, human-readable 1-line summary of what the commit actually does (max 80 chars).

Analyze the following commits:
${JSON.stringify(payload, null, 2)}
`;

  try {
    console.log(
      `📡 Sending ${commits.length} commits to Gemini for AI analysis...`,
    );
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = safeParseJSON(text);
    if (!parsed) return null;

    console.log("✅ Gemini analysis complete.");

    return toResultMap(parsed);
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return null;
  }
}

module.exports = { analyzeCommitsBatch, initializeGemini };

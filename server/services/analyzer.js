const { generateInsights } = require('../ai/insights');
const { analyzeCommitsBatch } = require('../ai/gemini');

// ── Contribution Analysis ──────────────────────────────────────

async function analyzeContributions(commits, contributors, pullRequests, geminiResults) {
  const authorMap = {};

  for (const commit of commits) {
    const author = commit.author?.login || commit.commit?.author?.name || 'Unknown';
    const email = commit.commit?.author?.email || '';
    const date = commit.commit?.author?.date;

    if (!authorMap[author]) {
      authorMap[author] = {
        login: author,
        email,
        avatarUrl: commit.author?.avatar_url || '',
        commits: 0,
        additions: 0,
        deletions: 0,
        filesChanged: new Set(),
        commitDates: [],
        classifications: { Feature: 0, 'Bug Fix': 0, Refactor: 0, Documentation: 0, Other: 0 },
        hourlyActivity: new Array(24).fill(0),
        dailyActivity: new Array(7).fill(0),
        impactResults: []
      };
    }

    const a = authorMap[author];
    a.commits++;
    a.additions += commit.stats?.additions || 0;
    a.deletions += commit.stats?.deletions || 0;
    if (date) a.commitDates.push(date);

    const sha = commit.sha;
    
    let classification = { type: 'Other', confidence: 0, reasoning: 'No AI data' };
    let impact = { score: 1.0, breakdown: 'No AI content data' };
    
    if (geminiResults && geminiResults.has(sha)) {
      const gResult = geminiResults.get(sha);
      classification = { type: gResult.classification, confidence: gResult.confidence || 1.0, reasoning: gResult.reasoning || 'AI extracted' };
      impact = { score: gResult.score, breakdown: gResult.breakdown || 'AI computed score based on diff size and complexity' };
    }
    
    a.classifications[classification.type] = (a.classifications[classification.type] || 0) + 1;
    a.impactResults.push(impact);

    if (commit.files) {
      for (const f of commit.files) {
        a.filesChanged.add(f.filename);
      }
    }

    if (date) {
      const d = new Date(date);
      a.hourlyActivity[d.getUTCHours()]++;
      a.dailyActivity[d.getUTCDay()]++;
    }
  }

  const prCountByAuthor = {};
  for (const pr of pullRequests) {
    const login = pr.user?.login;
    if (login) prCountByAuthor[login] = (prCountByAuthor[login] || 0) + 1;
  }

  for (const c of contributors) {
    if (authorMap[c.login]) {
      authorMap[c.login].avatarUrl = c.avatar_url || authorMap[c.login].avatarUrl;
    }
  }

  const totalCommits = commits.length;
  const profiles = Object.values(authorMap).map(a => {
    let avgImpact = 0, totalImpact = 0, maxImpact = 0;
    if (a.impactResults.length > 0) {
      totalImpact = a.impactResults.reduce((s, r) => s + r.score, 0);
      maxImpact = Math.max(...a.impactResults.map(r => r.score));
      avgImpact = totalImpact / a.impactResults.length;
    }

    const dirCounts = {};
    for (const f of a.filesChanged) {
      const dir = f.includes('/') ? f.split('/').slice(0, 2).join('/') : '/';
      dirCounts[dir] = (dirCounts[dir] || 0) + 1;
    }

    const topAreas = Object.entries(dirCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    return {
      login: a.login,
      commits: a.commits,
      impactScore: Math.round(avgImpact * 100) / 100,
      totalImpact: Math.round(totalImpact * 100) / 100,
      role: inferRole(a.commits, totalCommits)
    };
  });

  profiles.sort((a, b) => b.totalImpact - a.totalImpact);
  return profiles;
}

function inferRole(authorCommits, totalCommits) {
  const ratio = authorCommits / totalCommits;
  if (ratio >= 0.25) return 'Core Developer';
  if (ratio >= 0.10) return 'Regular Contributor';
  if (ratio >= 0.03) return 'Occasional Contributor';
  return 'Drive-by Contributor';
}
function computeBusFactor(profiles) {
  if (profiles.length === 0) return { value: 0, details: [], totalContributors: 0 };

  const totalCommits = profiles.reduce((s, p) => s + p.commits, 0);
  const sorted = [...profiles].sort((a, b) => b.commits - a.commits);

  let accumulated = 0;
  let busFactor = 0;

  for (const p of sorted) {
    accumulated += p.commits;
    busFactor++;
    if (accumulated / totalCommits >= 0.5) break;
  }

  return { value: busFactor, totalContributors: profiles.length };
}

function computeHealthScore(profiles, commits) {
  const scores = {};
  scores.contributionBalance = 80;
  scores.commitQuality = 70;
  scores.activityConsistency = 75;

  const overall = Math.round(
    scores.contributionBalance * 0.35 +
    scores.commitQuality * 0.35 +
    scores.activityConsistency * 0.30
  );

  return { overall, ...scores };
}

function computeCommitTimeline(commits) {
  return { daily: [], weekly: [] };
}

function detectCodeChurn(commits) {
  return [];
}

async function analyze(repoData) {
  const { repoInfo, commits, contributors, pullRequests, contributorStats } = repoData;

  console.log(' Running analysis engine...');

  let geminiResults = null;
  const detailedCommits = commits.slice(0, 30);

  if (detailedCommits.length > 0) {
    geminiResults = await analyzeCommitsBatch(detailedCommits);
  }

  const profiles = await analyzeContributions(commits, contributors, pullRequests, geminiResults);

  const busFactor = computeBusFactor(profiles);
  const healthScore = computeHealthScore(profiles, commits);
  const timeline = computeCommitTimeline(commits, geminiResults);
  const codeChurn = detectCodeChurn(commits);

  const insights = generateInsights(profiles, busFactor, healthScore, codeChurn);

  return {
    repository: {
      name: repoInfo.full_name
    },
    summary: {
      totalCommits: commits.length
    },
    contributors: profiles,
    busFactor,
    healthScore,
    codeChurn,
    insights,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyze };

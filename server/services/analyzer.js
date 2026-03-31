

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

    // AI: Classify & Impact (Strictly Gemini)
    const sha = commit.sha;
    
    // If we have Gemini data for this commit, use it. Otherwise, use basic defaults since heuristics are removed.
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

    // Activity heatmap data
    if (date) {
      const d = new Date(date);
      a.hourlyActivity[d.getUTCHours()]++;
      a.dailyActivity[d.getUTCDay()]++;
    }
  }

  // PR counts
  const prCountByAuthor = {};
  for (const pr of pullRequests) {
    const login = pr.user?.login;
    if (login) prCountByAuthor[login] = (prCountByAuthor[login] || 0) + 1;
  }

  // Enrich avatars from contributors API
  for (const c of contributors) {
    if (authorMap[c.login]) {
      authorMap[c.login].avatarUrl = c.avatar_url || authorMap[c.login].avatarUrl;
    }
  }

  // Build final profiles
  const totalCommits = commits.length;
  const profiles = Object.values(authorMap).map(a => {
    // Aggregate impact using basic math since AI impact array contains raw scores
    let avgImpact = 0, totalImpact = 0, maxImpact = 0;
    if (a.impactResults.length > 0) {
      totalImpact = a.impactResults.reduce((s, r) => s + r.score, 0);
      maxImpact = Math.max(...a.impactResults.map(r => r.score));
      avgImpact = totalImpact / a.impactResults.length;
    }

    // Top areas of contribution
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
      email: a.email,
      avatarUrl: a.avatarUrl,
      commits: a.commits,
      additions: a.additions,
      deletions: a.deletions,
      linesChanged: a.additions + a.deletions,
      filesChanged: a.filesChanged.size,
      pullRequests: prCountByAuthor[a.login] || 0,
      impactScore: Math.round(avgImpact * 100) / 100,
      totalImpact: Math.round(totalImpact * 100) / 100,
      maxImpact: Math.round(maxImpact * 100) / 100,
      classifications: a.classifications,
      topAreas,
      hourlyActivity: a.hourlyActivity,
      dailyActivity: a.dailyActivity,
      role: inferRole(a.commits, totalCommits),
      commitDates: a.commitDates.sort()
    };
  });

  profiles.sort((a, b) => b.totalImpact - a.totalImpact);
  return profiles;
}

// ── Role Inference ─────────────────────────────────────────────

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
  const critical = [];

  for (const p of sorted) {
    accumulated += p.commits;
    busFactor++;
    critical.push({
      login: p.login,
      commitShare: Math.round((p.commits / totalCommits) * 100),
      avatarUrl: p.avatarUrl
    });
    if (accumulated / totalCommits >= 0.5) break;
  }

  return { value: busFactor, critical, totalContributors: profiles.length };
}



function computeHealthScore(profiles, commits) {
  const scores = {};

  if (profiles.length > 1) {
    const commitCounts = profiles.map(p => p.commits);
    const total = commitCounts.reduce((s, v) => s + v, 0);
    const ideal = total / profiles.length;
    const deviations = commitCounts.map(c => Math.abs(c - ideal) / ideal);
    const avgDev = deviations.reduce((s, v) => s + v, 0) / deviations.length;
    scores.contributionBalance = Math.max(0, Math.round(100 - avgDev * 50));
  } else {
    scores.contributionBalance = profiles.length === 1 ? 30 : 0;
  }


  const classCounts = { Feature: 0, 'Bug Fix': 0, Refactor: 0, Documentation: 0, Other: 0 };
  for (const p of profiles) {
    for (const [k, v] of Object.entries(p.classifications)) {
      classCounts[k] += v;
    }
  }
  const totalClassified = Object.values(classCounts).reduce((s, v) => s + v, 0);
  const otherRatio = totalClassified > 0 ? classCounts.Other / totalClassified : 1;
  scores.commitQuality = Math.round(100 - otherRatio * 60);

  if (commits.length > 1) {
    const dates = commits
      .map(c => new Date(c.commit?.author?.date))
      .filter(d => !isNaN(d))
      .sort((a, b) => a - b);
    if (dates.length > 1) {
      const spanDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
      const activeDays = new Set(dates.map(d => d.toISOString().split('T')[0])).size;
      const ratio = spanDays > 0 ? activeDays / spanDays : 1;
      scores.activityConsistency = Math.min(100, Math.round(ratio * 200));
    } else {
      scores.activityConsistency = 20;
    }
  } else {
    scores.activityConsistency = 10;
  }

  const overall = Math.round(
    scores.contributionBalance * 0.35 +
    scores.commitQuality * 0.35 +
    scores.activityConsistency * 0.30
  );

  return { overall, ...scores };
}



function computeCommitTimeline(commits, geminiResults) {
  const daily = {};
  const weekly = {};

  for (const c of commits) {
    const date = c.commit?.author?.date;
    if (!date) continue;

    const d = new Date(date);
    const dayKey = d.toISOString().split('T')[0];
    const weekStart = new Date(d);
    weekStart.setUTCDate(d.getUTCDate() - d.getUTCDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    const sha = c.sha;
    let type = 'Other';
    if (geminiResults && geminiResults.has(sha)) {
      type = geminiResults.get(sha).classification;
    }

    if (!daily[dayKey]) daily[dayKey] = { date: dayKey, total: 0, Feature: 0, 'Bug Fix': 0, Refactor: 0, Documentation: 0, Other: 0 };
    daily[dayKey].total++;
    daily[dayKey][type]++;

    if (!weekly[weekKey]) weekly[weekKey] = { date: weekKey, total: 0, Feature: 0, 'Bug Fix': 0, Refactor: 0, Documentation: 0, Other: 0 };
    weekly[weekKey].total++;
    weekly[weekKey][type]++;
  }

  return {
    daily: Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)),
    weekly: Object.values(weekly).sort((a, b) => a.date.localeCompare(b.date))
  };
}



function detectCodeChurn(commits) {
  const fileStats = {};

  for (const commit of commits) {
    if (!commit.files) continue;
    for (const f of commit.files) {
      if (!fileStats[f.filename]) {
        fileStats[f.filename] = { filename: f.filename, changes: 0, additions: 0, deletions: 0, commits: 0 };
      }
      fileStats[f.filename].changes += f.changes || 0;
      fileStats[f.filename].additions += f.additions || 0;
      fileStats[f.filename].deletions += f.deletions || 0;
      fileStats[f.filename].commits++;
    }
  }

  return Object.values(fileStats)
    .filter(f => f.commits >= 3 && f.deletions > f.additions * 0.5)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 15)
    .map(f => ({
      ...f,
      churnRatio: f.additions > 0 ? Math.round((f.deletions / f.additions) * 100) / 100 : 0
    }));
}



async function analyze(repoData) {
  const { repoInfo, commits, contributors, pullRequests, contributorStats } = repoData;

  console.log(' Running analysis engine...');

  
  let geminiResults = null;
  const detailedCommits = commits.slice(0, 50);
  if (detailedCommits.length > 0) {
    console.log(`📡 Requesting strict LLM analysis for ${detailedCommits.length} commits...`);
    geminiResults = await analyzeCommitsBatch(detailedCommits);
    if (geminiResults) {
      console.log(` successfully fetched AI analysis for ${geminiResults.size} commits from Gemini`);
    } else {
      console.warn(` Warning: LLM analysis failed. Check API key. Falling back to empty defaults.`);
    }
  }

  const profiles = await analyzeContributions(commits, contributors, pullRequests, geminiResults);

  
  if (contributorStats && contributorStats.length > 0) {
    for (const stat of contributorStats) {
      const login = stat.author?.login;
      const profile = profiles.find(p => p.login === login);
      if (profile && profile.additions === 0 && profile.deletions === 0) {
        // Sum weekly stats for total additions/deletions
        let totalAdds = 0, totalDels = 0;
        for (const week of (stat.weeks || [])) {
          totalAdds += week.a || 0;
          totalDels += week.d || 0;
        }
        profile.additions = totalAdds;
        profile.deletions = totalDels;
        profile.linesChanged = totalAdds + totalDels;
      }
    }
  }

  const busFactor = computeBusFactor(profiles);
  const healthScore = computeHealthScore(profiles, commits);
  const timeline = computeCommitTimeline(commits, geminiResults);
  const codeChurn = detectCodeChurn(commits);


  const insights = generateInsights(profiles, busFactor, healthScore, codeChurn);

  
  const commitsSummary = commits.slice(0, 50).map(c => {
    const sha = c.sha;
    let classification = 'Other', classificationConfidence = 0, classificationReasoning = 'No LLM data', impactScore = 1, impactBreakdown = {}, messageStr = c.commit?.message || '';

    if (geminiResults && geminiResults.has(sha)) {
      const gResult = geminiResults.get(sha);
      classification = gResult.classification;
      classificationConfidence = gResult.confidence || 1.0;
      classificationReasoning = gResult.reasoning || 'AI extracted';
      impactScore = gResult.score;
      impactBreakdown = { ai_explanation: gResult.breakdown || 'AI computed score based on diff size and complexity' };
      messageStr = gResult.summary || messageStr;
    }

    // fallback string truncation for summary if no LLM data
    if (!geminiResults || !geminiResults.has(sha)) {
        messageStr = messageStr.split('\n')[0].trim();
        if (messageStr.length > 120) messageStr = messageStr.substring(0, 117) + '...';
    }

    return {
      sha: c.sha?.substring(0, 7),
      message: messageStr,
      author: c.author?.login || c.commit?.author?.name || 'Unknown',
      date: c.commit?.author?.date,
      classification,
      classificationConfidence,
      classificationReasoning,
      additions: c.stats?.additions || 0,
      deletions: c.stats?.deletions || 0,
      filesChanged: c.files?.length || 0,
      impact: impactScore,
      impactBreakdown
    };
  });

  // Classification distribution
  const classificationDist = { Feature: 0, 'Bug Fix': 0, Refactor: 0, Documentation: 0, Other: 0 };
  for (const c of commitsSummary) {
    classificationDist[c.classification]++;
  }

  console.log(' Analysis complete');

  return {
    repository: {
      name: repoInfo.full_name,
      description: repoInfo.description,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      language: repoInfo.language,
      createdAt: repoInfo.created_at,
      updatedAt: repoInfo.updated_at,
      openIssues: repoInfo.open_issues_count
    },
    summary: {
      totalCommits: commits.length,
      totalContributors: profiles.length,
      totalPullRequests: pullRequests.length,
      totalLinesChanged: profiles.reduce((s, p) => s + p.linesChanged, 0)
    },
    contributors: profiles,
    commits: commitsSummary,
    classificationDistribution: classificationDist,
    timeline,
    busFactor,
    healthScore,
    codeChurn,
    insights,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyze };
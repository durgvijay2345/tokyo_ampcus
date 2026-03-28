function generateInsights(profiles, busFactor, healthScore, churnFiles) {
  const insights = [];
  const totalCommits = profiles.reduce((s, p) => s + p.commits, 0);

  // 1. Workload Imbalance
  if (profiles.length > 1) {
    const topContributor = profiles[0];
    const topShare = topContributor.commits / totalCommits;
    if (topShare > 0.5) {
      insights.push({
        type: 'warning',
        category: 'Workload Distribution',
        title: 'Uneven workload distribution detected',
        description: `${topContributor.login} accounts for ${Math.round(topShare * 100)}% of all commits. This creates a single point of failure and may indicate unbalanced task allocation.`,
        evidence: { contributor: topContributor.login, commitShare: Math.round(topShare * 100), commits: topContributor.commits, totalCommits }
      });
    } else if (topShare > 0.35) {
      insights.push({
        type: 'info',
        category: 'Workload Distribution',
        title: 'Moderately concentrated contributions',
        description: `${topContributor.login} has ${Math.round(topShare * 100)}% of commits. Consider spreading ownership more evenly.`,
        evidence: { contributor: topContributor.login, commitShare: Math.round(topShare * 100) }
      });
    }
  }

  // 2. Bus Factor Risk
  if (busFactor.value <= 1 && profiles.length > 1) {
    insights.push({
      type: 'critical',
      category: 'Bus Factor',
      title: 'Critical bus factor risk',
      description: `Bus factor is ${busFactor.value}. If ${busFactor.critical[0]?.login} becomes unavailable, the project could stall. Urgent knowledge-sharing needed.`,
      evidence: { busFactor: busFactor.value, criticalDev: busFactor.critical[0]?.login }
    });
  } else if (busFactor.value <= 2 && profiles.length > 3) {
    insights.push({
      type: 'warning',
      category: 'Bus Factor',
      title: 'Low bus factor',
      description: `Only ${busFactor.value} developers account for 50%+ of commits across ${busFactor.totalContributors} contributors. Cross-training recommended.`,
      evidence: { busFactor: busFactor.value, totalContributors: busFactor.totalContributors }
    });
  } else if (busFactor.value >= 3) {
    insights.push({
      type: 'success',
      category: 'Bus Factor',
      title: 'Healthy bus factor',
      description: `Bus factor is ${busFactor.value}, indicating good knowledge distribution across the team.`,
      evidence: { busFactor: busFactor.value }
    });
  }

  // 3. High-Impact Contributors
  const highImpact = profiles.filter(p => p.impactScore > 10);
  if (highImpact.length > 0) {
    insights.push({
      type: 'info',
      category: 'High Impact',
      title: 'High-impact contributors identified',
      description: `${highImpact.map(p => p.login).join(', ')} ${highImpact.length === 1 ? 'has' : 'have'} consistently high-impact contributions (avg impact > 10).`,
      evidence: { contributors: highImpact.map(p => ({ login: p.login, avgImpact: p.impactScore })) }
    });
  }

  // 4. Code Churn Detection
  if (churnFiles.length > 5) {
    insights.push({
      type: 'warning',
      category: 'Code Churn',
      title: 'Significant code churn detected',
      description: `${churnFiles.length} files show high churn (repeated add/delete cycles), indicating instability or iterative rework. Top: ${churnFiles.slice(0, 3).map(f => f.filename).join(', ')}`,
      evidence: { churnFileCount: churnFiles.length, topFiles: churnFiles.slice(0, 5).map(f => f.filename) }
    });
  } else if (churnFiles.length > 0) {
    insights.push({
      type: 'info',
      category: 'Code Churn',
      title: 'Minor code churn observed',
      description: `${churnFiles.length} files have noticeable churn patterns. This is within normal range but worth monitoring.`,
      evidence: { churnFileCount: churnFiles.length }
    });
  }

  // 5. Low-Impact Repetitive Commits
  const lowImpactContributors = profiles.filter(p => p.impactScore < 3 && p.commits > 5);
  if (lowImpactContributors.length > 0) {
    insights.push({
      type: 'info',
      category: 'Commit Patterns',
      title: 'Low-impact repetitive commits detected',
      description: `${lowImpactContributors.map(p => p.login).join(', ')} ${lowImpactContributors.length === 1 ? 'has' : 'have'} many commits with low average impact (< 3). Consider consolidating related changes into larger, meaningful commits.`,
      evidence: { contributors: lowImpactContributors.map(p => ({ login: p.login, commits: p.commits, avgImpact: p.impactScore })) }
    });
  }

  // 6. Inactive Contributors
  const inactive = profiles.filter(p => (p.commits / totalCommits) < 0.02 && profiles.length > 3);
  if (inactive.length > 0) {
    insights.push({
      type: 'info',
      category: 'Contributor Activity',
      title: `${inactive.length} inactive contributor(s)`,
      description: `${inactive.map(p => p.login).join(', ')} ${inactive.length === 1 ? 'has' : 'have'} less than 2% of total commits. They may be drive-by contributors or recently onboarded.`,
      evidence: { inactiveCount: inactive.length, contributors: inactive.map(p => p.login) }
    });
  }

  // 7. Overall Health Assessment
  if (healthScore.overall >= 75) {
    insights.push({
      type: 'success',
      category: 'Health',
      title: 'Strong engineering health',
      description: `Overall health score is ${healthScore.overall}/100, reflecting good contribution balance (${healthScore.contributionBalance}), commit quality (${healthScore.commitQuality}), and activity consistency (${healthScore.activityConsistency}).`,
      evidence: { ...healthScore }
    });
  } else if (healthScore.overall >= 50) {
    const weak = [];
    if (healthScore.contributionBalance < 50) weak.push('contribution balance');
    if (healthScore.commitQuality < 50) weak.push('commit quality');
    if (healthScore.activityConsistency < 50) weak.push('activity consistency');
    insights.push({
      type: 'warning',
      category: 'Health',
      title: 'Moderate engineering health',
      description: `Health score is ${healthScore.overall}/100. Areas for improvement: ${weak.join(', ') || 'general consistency'}.`,
      evidence: { ...healthScore }
    });
  } else {
    insights.push({
      type: 'critical',
      category: 'Health',
      title: 'Poor engineering health',
      description: `Health score is ${healthScore.overall}/100. Significant improvements needed in contribution balance, commit quality, and/or activity consistency.`,
      evidence: { ...healthScore }
    });
  }

  return insights;
}

module.exports = { generateInsights };

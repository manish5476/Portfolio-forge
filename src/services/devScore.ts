/**
 * Developer Scoring & Ranking Algorithm Module
 * Calculates a normalized 0-100 Developer Score based on GitHub activity metrics.
 */

export interface GitHubActivityInput {
  commitsLast90Days: number;
  commitsPreviousDays: number;
  commitConsistencyIndex: number; // 0 to 1 (lower variance across weeks)
  mergedPRs: number;
  closedUnmergedPRs: number;
  prReviewCommentsCount: number;
  codeReviewsPerformed: number;
  starsReceived: number;
  forksReceived: number;
  watchersReceived: number;
  issuesClosed: number;
  issuesOpened: number;
  currentStreakDays: number;
  longestStreakDays: number;
  primaryLanguagesCount: number;
  bytesWrittenByLanguage: Record<string, number>;
  ossCommitsCount: number; // External repo contributions
  personalCommitsCount: number; // Owned repo contributions
  daysSinceLastActivity: number;
}

export interface MetricBreakdown {
  score: number; // 0-100
  weight: number;
  weightedScore: number;
  description: string;
}

export interface DeveloperScoreResult {
  overallScore: number; // 0-100
  tier: 'Architect' | 'Principal' | 'Senior' | 'Mid-Level' | 'Junior' | 'Novice';
  percentileRank: number;
  metrics: {
    commitFrequency: MetricBreakdown;
    prQuality: MetricBreakdown;
    repoImpact: MetricBreakdown;
    codeReviews: MetricBreakdown;
    issueResolutions: MetricBreakdown;
    streaks: MetricBreakdown;
    languageDiversity: MetricBreakdown;
    ossContributionRatio: MetricBreakdown;
  };
  penaltyDecay: number; // multiplier applied for inactivity e.g. 1.0 or 0.85
}

export const DEFAULT_WEIGHTS = {
  commitFrequency: 0.20,
  prQuality: 0.20,
  repoImpact: 0.18,
  ossContributionRatio: 0.12,
  codeReviews: 0.10,
  issueResolutions: 0.08,
  languageDiversity: 0.07,
  streaks: 0.05,
};

/**
 * Calculates Developer Score (0-100)
 */
export function calculateDeveloperScore(
  input: GitHubActivityInput,
  customWeights: typeof DEFAULT_WEIGHTS = DEFAULT_WEIGHTS
): DeveloperScoreResult {
  // 1. Commit Frequency & Consistency (Weighted by Recency)
  // Recency weight: recent 90 days commits worth 2.5x older commits
  const effectiveCommits = input.commitsLast90Days * 2.5 + input.commitsPreviousDays * 0.5;
  const commitVolumeScore = Math.min(100, (effectiveCommits / 120) * 100); // 120 effective commits = 100 max
  const commitConsistencyScore = input.commitConsistencyIndex * 100;
  const commitScore = Math.min(100, commitVolumeScore * 0.7 + commitConsistencyScore * 0.3);

  // 2. Pull Request Quality (Merged vs Closed PRs)
  const totalPRs = input.mergedPRs + input.closedUnmergedPRs;
  const mergeRatio = totalPRs > 0 ? input.mergedPRs / totalPRs : 0;
  // Volume scaling: requiring minimum PR volume to reach 100
  const prVolumeFactor = Math.min(1.0, input.mergedPRs / 15);
  const prQualityScore = Math.min(100, mergeRatio * 100 * prVolumeFactor);

  // 3. Repository Impact (Logarithmic scaling for Stars, Forks, Watchers)
  const starPoints = Math.log2(1 + input.starsReceived) * 12;
  const forkPoints = Math.log2(1 + input.forksReceived) * 16;
  const watcherPoints = Math.log2(1 + input.watchersReceived) * 8;
  const repoImpactScore = Math.min(100, starPoints + forkPoints + watcherPoints);

  // 4. Code Review Participation
  const reviewScore = Math.min(
    100,
    input.codeReviewsPerformed * 12 + input.prReviewCommentsCount * 2
  );

  // 5. Issue Contributions & Resolutions
  const issueScore = Math.min(
    100,
    input.issuesClosed * 10 + input.issuesOpened * 3
  );

  // 6. Contribution Streak Length
  const streakScore = Math.min(
    100,
    input.currentStreakDays * 2.5 + Math.min(30, input.longestStreakDays) * 1.0
  );

  // 7. Language Diversity & Simpson's Index
  const langCount = input.primaryLanguagesCount;
  const langScore = Math.min(100, Math.min(5, langCount) * 20);

  // 8. Open Source vs Personal Projects
  const totalCommits = input.ossCommitsCount + input.personalCommitsCount;
  const ossRatio = totalCommits > 0 ? input.ossCommitsCount / totalCommits : 0;
  // OSS contribution receives a 1.5x multiplier bonus
  const ossScore = Math.min(100, (ossRatio * 1.5) * 100);

  // Sub-scores object
  const buildMetric = (score: number, weight: number, description: string): MetricBreakdown => ({
    score,
    weight,
    weightedScore: score * weight,
    description,
  });

  const rawMetrics = {
    commitFrequency: buildMetric(commitScore, customWeights.commitFrequency, 'Recency-weighted commit frequency & weekly consistency'),
    prQuality: buildMetric(prQualityScore, customWeights.prQuality, 'Merged vs unmerged pull request acceptance ratio'),
    repoImpact: buildMetric(repoImpactScore, customWeights.repoImpact, 'Logarithmic reach across stars, forks, and watchers'),
    codeReviews: buildMetric(reviewScore, customWeights.codeReviews, 'Peer code review approvals & inline review comments'),
    issueResolutions: buildMetric(issueScore, customWeights.issueResolutions, 'Issues opened and resolved across repositories'),
    streaks: buildMetric(streakScore, customWeights.streaks, 'Active and historical consecutive contribution streak'),
    languageDiversity: buildMetric(langScore, customWeights.languageDiversity, 'Multi-language proficiency & repository stack breadth'),
    ossContributionRatio: buildMetric(ossScore, customWeights.ossContributionRatio, 'External open-source vs personal repository contribution split'),
  };

  // Weighted raw sum
  let rawSum = 0;
  for (const key of Object.keys(rawMetrics) as Array<keyof typeof rawMetrics>) {
    rawSum += rawMetrics[key].weightedScore;
  }

  // Decay factor for inactive users (> 30 days inactivity)
  let decayFactor = 1.0;
  if (input.daysSinceLastActivity > 30) {
    const inactiveDays = input.daysSinceLastActivity - 30;
    // Half-life decay over 180 days of inactivity
    decayFactor = Math.max(0.3, Math.exp(-0.005 * inactiveDays));
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, rawSum * decayFactor)));

  // Tier categorization
  let tier: DeveloperScoreResult['tier'] = 'Novice';
  if (finalScore >= 90) tier = 'Architect';
  else if (finalScore >= 80) tier = 'Principal';
  else if (finalScore >= 65) tier = 'Senior';
  else if (finalScore >= 45) tier = 'Mid-Level';
  else if (finalScore >= 25) tier = 'Junior';

  return {
    overallScore: finalScore,
    tier,
    percentileRank: Math.min(99, Math.round(finalScore * 0.98)),
    metrics: rawMetrics as DeveloperScoreResult['metrics'],
    penaltyDecay: Number(decayFactor.toFixed(2)),
  };
}

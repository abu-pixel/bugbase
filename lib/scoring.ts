// lib/scoring.ts

export function calculateFinalScore({
  bugQuality,
  examScore,
  reportScore,
}: {
  bugQuality: number;
  examScore: number;
  reportScore: number;
}) {
  // Defensive defaults (prevents NaN bugs)
  const bq = Number(bugQuality || 0);
  const ex = Number(examScore || 0);
  const rp = Number(reportScore || 0);

  // Weighted scoring system (server-truth logic)
  let score =
    bq * 0.5 +
    ex * 0.3 +
    rp * 0.2;

  // Safety boundaries
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return Math.round(score);
}
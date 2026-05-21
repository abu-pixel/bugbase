// SAFE IMPORT (avoids TypeScript red errors)
import * as stringSimilarity from "string-similarity";

export function calculateBugScore(title: string, description: string): number {
  let score: number = 5;

  // length quality scoring
  if (description && description.length > 50) score += 2;
  if (description && description.length > 150) score += 2;

  // title quality scoring
  if (title && title.length > 10) score += 1;

  // safe similarity check (prevents crash)
  let similarity = 0;

  try {
    similarity = stringSimilarity.compareTwoStrings(
      title || "",
      description || ""
    );
  } catch (error) {
    similarity = 0;
  }

  // repetition penalty
  if (similarity > 0.6) score -= 2;

  // clamp score (0–10 safe range)
  if (score > 10) score = 10;
  if (score < 1) score = 1;

  return score;
}
// Difficulty score for a trail.
//
// Inputs (any may be 0/missing):
//   distanceKm         - total length
//   elevationGainM     - cumulative ascent
//   maxAltitudeM       - peak altitude reached
//   technicalFactor    - 0..1 multiplier for terrain (scrambles, exposure, snow)
//
// Score is unbounded but typically 0-200. Bands:
//   <  30  easy
//   < 70   moderate
//   < 130  hard
//   >=130  expert
//
// Weights tuned so that:
//   - 5 km flat trail at sea level  -> ~10  (easy)
//   - 15 km, 800 m gain, 2500 m max -> ~55  (moderate)
//   - 22 km, 1800 m gain, 4000 m max-> ~110 (hard)
//   - 30 km, 3000 m gain, 5500 m max-> ~180 (expert)

const ALTITUDE_PENALTY_START_M = 2500;

const round = (n) => Math.round(n * 10) / 10;

const computeDifficultyScore = ({
  distanceKm = 0,
  elevationGainM = 0,
  maxAltitudeM = 0,
  technicalFactor = 0
} = {}) => {
  const dist = Math.max(0, Number(distanceKm) || 0);
  const gain = Math.max(0, Number(elevationGainM) || 0);
  const peak = Math.max(0, Number(maxAltitudeM) || 0);
  const tech = Math.max(0, Math.min(1, Number(technicalFactor) || 0));

  const distanceScore = dist * 1.5;
  const elevationScore = gain * 0.04;
  const altitudePenalty =
    peak > ALTITUDE_PENALTY_START_M
      ? Math.pow((peak - ALTITUDE_PENALTY_START_M) / 1000, 1.4) * 12
      : 0;
  const technicalBoost = (distanceScore + elevationScore) * tech * 0.5;

  return round(distanceScore + elevationScore + altitudePenalty + technicalBoost);
};

const scoreToBand = (score) => {
  if (score < 30) return "easy";
  if (score < 70) return "moderate";
  if (score < 130) return "hard";
  return "expert";
};

module.exports = {
  computeDifficultyScore,
  scoreToBand
};

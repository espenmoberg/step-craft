import type { StairGeometry } from "./geometry";

/** Standard sidekloss-lengde fra nesa og bakover (langs trinnet). */
export const STANDARD_BLOCK_MM = 200;

/**
 * Maks klosslengde som fortsatt får plass i vangehøyden W.
 * Avhenger av stigningsvinkel — brattere ⇒ kortere maks.
 */
export function maxBlockForAngle(angleDeg: number, W = 198, t = 5): number {
  const th = (angleDeg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);
  if (s < 0.05) return STANDARD_BLOCK_MM;
  // KL*s + 96*c + t <= W - 5 (margin)
  return Math.floor((W - 5 - t - 96 * c) / s);
}

/**
 * Anbefalt lengde for hvert trinn: 200 mm normalt,
 * men siste (og evt. nest siste) forkortes så de ikke går inn i setekappet.
 */
export function blockLengthForStep(
  geo: StairGeometry,
  stepIndex: number // 0-based nose index
): number {
  const { noses, points, angleDeg, params } = geo;
  const maxFit = maxBlockForAngle(angleDeg, params.W, params.t);
  const base = Math.min(params.KL, maxFit);
  const th = (angleDeg * Math.PI) / 180;
  const c = Math.cos(th);
  const last = noses.length - 1;

  // Stopp ca. 15 mm før H (hæl) langs u, omsatt til lengde langs trinnet
  const maxBeforeSeat = Math.max(
    50,
    Math.floor((points.H.u - noses[stepIndex] - 15) / c)
  );

  if (stepIndex === last) return Math.min(base, maxBeforeSeat);
  // Nest siste: bare om 200-klossen ellers når setet
  if (stepIndex === last - 1) {
    const endU = noses[stepIndex] + base * c;
    if (endU > points.H.u - 15) return Math.min(base, maxBeforeSeat);
  }
  return base;
}

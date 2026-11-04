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
 * Anbefalt lengde for hvert trinn: 200 mm (også øverst — mykt sete/terreng).
 * Kortes bare ned hvis vinkelen gjør at 200 mm ikke får plass i vangehøyden.
 */
export function blockLengthForStep(
  geo: StairGeometry,
  _stepIndex: number // 0-based nose index (samme lengde alle trinn)
): number {
  const { angleDeg, params } = geo;
  const maxFit = maxBlockForAngle(angleDeg, params.W, params.t);
  return Math.min(params.KL, maxFit);
}

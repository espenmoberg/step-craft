import type { StairGeometry } from "./geometry";

/** Klosshøyde (flatt, 48 mm). */
export const BLOCK_HEIGHT_MM = 48;

/**
 * Bakre kappvinkel fra vannrett (sidevisning).
 * 45° → topp blir 48 mm lengre enn bunn; fjerner bakre nedre hjørne
 * så toppflaten kan støtte mer av bakre trinnbord.
 */
export const BLOCK_MITER_DEG = 45;

/**
 * Ønsket toppflate (vannrett fra nesa). Med 45° bak og 33,4° stigning
 * er ~244 mm maks som fortsatt får plass i 48×198 med 5 mm margin.
 */
export const STANDARD_BLOCK_TOP_MM = 244;

/** @deprecated bruk STANDARD_BLOCK_TOP_MM */
export const STANDARD_BLOCK_MM = STANDARD_BLOCK_TOP_MM;

export type BlockDims = {
  /** Toppflate under trinn, mm fra nesa */
  topMm: number;
  /** Underkant (kortere pga. bakre gjæring) */
  bottomMm: number;
  miterDeg: number;
  heightMm: number;
};

/** Bunn = topp − h / tan(miter). Ved 45°: bunn = topp − 48. */
export function bottomFromTop(
  topMm: number,
  miterDeg = BLOCK_MITER_DEG,
  heightMm = BLOCK_HEIGHT_MM
): number {
  const rad = (miterDeg * Math.PI) / 180;
  const tan = Math.tan(rad);
  if (tan < 0.05) return topMm;
  return Math.max(0, topMm - heightMm / tan);
}

/**
 * Maks toppflate med bakre gjæring som fortsatt får plass i vangehøyden W.
 * Kritisk punkt: bakre nedre hjørne (der gjæringen møter underkanten).
 */
export function maxBlockTopForAngle(
  angleDeg: number,
  W = 198,
  t = 5,
  miterDeg = BLOCK_MITER_DEG
): number {
  const th = (angleDeg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);
  if (s < 0.05) return STANDARD_BLOCK_TOP_MM;
  const rad = (miterDeg * Math.PI) / 180;
  const tanM = Math.tan(rad);
  const inset = tanM < 0.05 ? 0 : BLOCK_HEIGHT_MM / tanM;
  // bottom*s + 96*c + t <= W - 5, bottom = top - inset
  // top*s <= W - 5 - t - 96*c + inset*s
  const num = W - 5 - t - 96 * c + inset * s;
  return Math.floor(num / s);
}

/** @deprecated kvadratisk maks — bruk maxBlockTopForAngle */
export function maxBlockForAngle(angleDeg: number, W = 198, t = 5): number {
  return maxBlockTopForAngle(angleDeg, W, t, 90);
}

export function blockDimsForStep(
  geo: StairGeometry,
  _stepIndex: number
): BlockDims {
  const { angleDeg, params } = geo;
  const maxFit = maxBlockTopForAngle(angleDeg, params.W, params.t, BLOCK_MITER_DEG);
  const topMm = Math.min(params.KL, maxFit);
  return {
    topMm,
    bottomMm: Math.round(bottomFromTop(topMm) * 10) / 10,
    miterDeg: BLOCK_MITER_DEG,
    heightMm: BLOCK_HEIGHT_MM,
  };
}

/** Topplengde (for bakoverkompatibilitet i lister). */
export function blockLengthForStep(
  geo: StairGeometry,
  stepIndex: number
): number {
  return blockDimsForStep(geo, stepIndex).topMm;
}

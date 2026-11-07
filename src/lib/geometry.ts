/**
 * Geometri for utetrapp med lukkede endevanger (trinn på klosser mellom vangene).
 * Alle mål i mm. Port av trappegeometri.py.
 *
 * Koordinater: x vannrett (oppover trappa), y loddrett. Hellene nederst: y = 0.
 * Trinnese nr. 1 ligger i x = 0. Opptrinn r = H / n.
 * Vangens kappmål oppgis i brettkoordinater:
 *   u = avstand langs vangens overkant, målt fra brettets rette ende (nederst)
 *   v = avstand ned fra overkant, vinkelrett på kanten
 */

export type StairParams = {
  /** Total høyde, helle nederst til toppflate */
  H: number;
  /** Antall opptrinn i treverket */
  n: number;
  /** Inntrinn (nese til nese) */
  g: number;
  /** Trinndybde */
  d: number;
  /** Vangehøyde (48x198 → 198) */
  W: number;
  /** Trinnese under vangens overkant */
  t: number;
  /** Høyde på lodd kapp foran ved foten */
  FRONT: number;
  /** Setelengde vannrett øverst (0 = ingen innkutt / fuglenebb) */
  SEAT: number;
  /** Kloss toppflate fra nesa og bakover (vannrett); bak ende gjæres 45° */
  KL: number;
  /** Ekstra steinblokk nederst (0 hvis alt i tre) */
  stoneBase: number;
};

export type PointUV = { u: number; v: number };

export type StairGeometry = {
  params: StairParams;
  r: number;
  NT: number;
  angleDeg: number;
  formula: number;
  stringerLength: number;
  diagonalAF: number;
  horizontalSpan: number;
  seatBelowTop: number;
  treadFitsInW: number;
  blockFitsInW: number;
  points: Record<"A" | "B" | "C" | "H" | "G" | "F" | "E", PointUV>;
  noses: number[];
  mal: { width: number; height: number; hypot: number };
  plumbCutDeg: number;
  levelCutDeg: number;
  /** Verdenskordinater for tegning */
  world: {
    xf: number;
    xe: number;
    ys: number;
    xB: number;
    FRONT: number;
    noses: { x: number; y: number }[];
    posts: number[];
    handrailLength: number;
  };
};

export const STOCK_STRINGER_MM = 3890;

/**
 * Målt på stedet: 33,4° og 3800 mm fra punkt B til nese på øverste trinn.
 * 13 opptrinn → H ≈ 2370, inntrinn 277, formel ≈ 641. Trinndybde 250 (148+98)
 * fordi 300 ikke får plass i 48×198 ved denne vinkelen.
 */
export const DEFAULT_PARAMS: StairParams = {
  H: 2370,
  n: 13,
  g: 277,
  d: 250,
  W: 198,
  t: 5,
  FRONT: 100,
  SEAT: 0, // dropper innkutt/fuglenebb øverst — bare lodd endekapp
  KL: 244, // toppflate; bak 45° så bunn ≈ 196 — bedre støtte for bakbord
  stoneBase: 0,
};

function computeWoodHeight(p: StairParams): number {
  return p.H - p.stoneBase;
}

export function computeGeometry(params: StairParams): StairGeometry {
  const woodH = computeWoodHeight(params);
  const { n, g, d, W, t, FRONT, SEAT, KL } = params;
  const r = woodH / n;
  const NT = n - 1;
  const th = Math.atan(r / g);
  const s = Math.sin(th);
  const c = Math.cos(th);
  const k = Math.tan(th);

  const ytop = (x: number) => r + k * x + t / c;
  const ybot = (x: number) => ytop(x) - W / c;
  const xf = (FRONT - ytop(0)) / k;
  const xb0 = (0 - ybot(0)) / k;
  const xe = (NT - 1) * g + d;
  const ys = ybot(xe);
  // Med SEAT=0: ingen fuglenebb — G/H faller sammen med F (lodd ende).
  const xB = xe - SEAT;

  const bc0 = (x: number, y: number): [number, number] => [
    (x - xf) * c + (y - FRONT) * s,
    (ytop(x) - y) * c,
  ];
  const U0 = bc0(xf, 0)[0];
  const bc = (x: number, y: number): PointUV => {
    const [u, v] = bc0(x, y);
    return { u: u - U0, v };
  };

  const F = bc(xe, ys);
  const points = {
    A: bc(xf, 0),
    B: bc(xf, FRONT),
    C: bc(xb0, 0),
    H: SEAT > 0 ? bc(xB, ybot(xB)) : F,
    G: SEAT > 0 ? bc(xB, ys) : F,
    F,
    E: bc(xe, ytop(xe)),
  };

  const noses = Array.from({ length: NT }, (_, i) => {
    const step = i + 1;
    return bc((step - 1) * g, step * r).u;
  });

  const worldNoses = Array.from({ length: NT }, (_, i) => {
    const step = i + 1;
    return { x: (step - 1) * g, y: step * r };
  });

  // Stolpesentre langs u (nese 1, midt, nest siste) – samme logikk som 12-trinns dok
  const noseIdx = [0, Math.floor((NT - 1) / 2), NT - 1];
  const posts = noseIdx.map((i) => Math.round(noses[i] + 75));
  const handrailLength = Math.round(noses[NT - 1] - noses[0] + 600);

  return {
    params,
    r,
    NT,
    angleDeg: (th * 180) / Math.PI,
    formula: 2 * r + g,
    stringerLength: points.E.u,
    diagonalAF: Math.hypot(points.F.u - points.A.u, points.F.v - points.A.v),
    horizontalSpan: xe - xf,
    seatBelowTop: woodH - ys,
    treadFitsInW: d * s + 48 * c + t,
    // Med 45° bak: kritisk er bakre nedre hjørne (bunn = KL - 48)
    blockFitsInW: Math.max(0, KL - 48) * s + 96 * c + t,
    points,
    noses,
    mal: { width: g, height: r, hypot: Math.hypot(g, r) },
    plumbCutDeg: 90 - (th * 180) / Math.PI,
    levelCutDeg: (th * 180) / Math.PI,
    world: {
      xf,
      xe,
      ys,
      xB,
      FRONT,
      noses: worldNoses,
      posts,
      handrailLength,
    },
  };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round0(n: number): number {
  return Math.round(n);
}

export function fitsStock(stringerLength: number, stock = STOCK_STRINGER_MM): boolean {
  return stringerLength <= stock - 20; // 20 mm margin for kapp
}

export function shortfall(stringerLength: number, stock = STOCK_STRINGER_MM): number {
  return Math.max(0, stringerLength - stock);
}

/** Visual language matching the Claude handover drawings. */

export const Ink = {
  line: "#555555",
  dim: "#b5b5b5",
  text: "#1f1f1f",
  muted: "#6b6b6b",
  blue: "#2f6fd6",
  bg: "#ffffff",
  stone: "#9a917e",
} as const;

export function pts(points: Array<[number, number] | { x: number; y: number }>): string {
  return points
    .map((p) => {
      if (Array.isArray(p)) return `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

export function fmt1(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ",");
}

export function fmt0(n: number): string {
  return String(Math.round(n));
}

"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Rettvinklet trekantmal: inntrinn × opptrinn, hypotenus langs vangeoverkant.
 */
export function TemplateDrawing({ geo }: Props) {
  const g = geo.params.g;
  const r = geo.r;
  const hyp = geo.mal.hypot;
  const th = geo.angleDeg;

  // Layout in SVG mm-ish units (scale so triangle fits)
  const ox = 90;
  const oy = 320; // right-angle corner
  const scale = 1.55;
  const gx = g * scale;
  const ry = r * scale;

  const A = { x: ox, y: oy }; // rett vinkel
  const B = { x: ox + gx, y: oy }; // ende av inntrinn
  const C = { x: ox, y: oy - ry }; // ende av opptrinn

  // Dimension offsets
  const dim = 28;

  return (
    <svg
      viewBox="0 0 640 400"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Trekantmal for merking av vange"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="640" height="400" fill={Ink.bg} />

      <text x="24" y="28" fontSize={15} fontWeight={600} fill={Ink.text}>
        Trekantmal: ett steg
      </text>
      <text x="24" y="48" fill={Ink.muted}>
        Rettvinklet mal i kryssfinér/MDF. Hypotenusen legges langs vangens
        overkant.
      </text>

      {/* Light ground guides */}
      <line
        x1={A.x - 20}
        y1={A.y}
        x2={B.x + 50}
        y2={A.y}
        stroke={Ink.dim}
        strokeWidth={0.75}
        strokeDasharray="4 4"
      />
      <line
        x1={A.x}
        y1={A.y + 20}
        x2={A.x}
        y2={C.y - 40}
        stroke={Ink.dim}
        strokeWidth={0.75}
        strokeDasharray="4 4"
      />

      {/* Triangle fill */}
      <polygon
        points={pts([
          [A.x, A.y],
          [B.x, B.y],
          [C.x, C.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.08}
        stroke={Ink.line}
        strokeWidth={1.75}
      />

      {/* Right-angle mark */}
      <polyline
        points={pts([
          [A.x + 14, A.y],
          [A.x + 14, A.y - 14],
          [A.x, A.y - 14],
        ])}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />

      {/* Angle arc at B (θ between run and hypotenuse) */}
      <path
        d={`M ${B.x - 36} ${B.y} A 36 36 0 0 0 ${B.x - 36 * Math.cos((th * Math.PI) / 180)} ${B.y - 36 * Math.sin((th * Math.PI) / 180)}`}
        fill="none"
        stroke={Ink.blue}
        strokeWidth={1.25}
      />
      <text
        x={B.x - 52}
        y={B.y - 10}
        fill={Ink.blue}
        fontSize={11}
        fontWeight={600}
      >
        {fmt1(th)}°
      </text>

      {/* Run dimension (bottom) */}
      <line
        x1={A.x}
        y1={A.y + dim}
        x2={B.x}
        y2={B.y + dim}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={A.x}
        y1={A.y + dim - 5}
        x2={A.x}
        y2={A.y + dim + 5}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={B.x}
        y1={B.y + dim - 5}
        x2={B.x}
        y2={B.y + dim + 5}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text
        x={(A.x + B.x) / 2}
        y={A.y + dim + 18}
        textAnchor="middle"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        Inntrinn {fmt0(g)}
      </text>

      {/* Rise dimension (left) */}
      <line
        x1={A.x - dim}
        y1={A.y}
        x2={C.x - dim}
        y2={C.y}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={A.x - dim - 5}
        y1={A.y}
        x2={A.x - dim + 5}
        y2={A.y}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={C.x - dim - 5}
        y1={C.y}
        x2={C.x - dim + 5}
        y2={C.y}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text
        x={A.x - dim - 12}
        y={(A.y + C.y) / 2 + 4}
        textAnchor="end"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        Opptrinn {fmt1(r)}
      </text>

      {/* Hypotenuse dimension (offset parallel) */}
      {(() => {
        const ang = Math.atan2(C.y - B.y, C.x - B.x);
        const nx = Math.cos(ang - Math.PI / 2);
        const ny = Math.sin(ang - Math.PI / 2);
        const off = 36;
        const p1 = { x: B.x + nx * off, y: B.y + ny * off };
        const p2 = { x: C.x + nx * off, y: C.y + ny * off };
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        return (
          <g>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={Ink.dim}
              strokeWidth={1}
            />
            <line
              x1={B.x}
              y1={B.y}
              x2={p1.x}
              y2={p1.y}
              stroke={Ink.dim}
              strokeWidth={0.75}
            />
            <line
              x1={C.x}
              y1={C.y}
              x2={p2.x}
              y2={p2.y}
              stroke={Ink.dim}
              strokeWidth={0.75}
            />
            <text
              x={mid.x + 8}
              y={mid.y - 4}
              fill={Ink.text}
              fontWeight={600}
              fontSize={13}
            >
              Hypotenus {fmt0(hyp)}
            </text>
            <text x={mid.x + 8} y={mid.y + 12} fill={Ink.muted} fontSize={11}>
              = steg langs overkant
            </text>
          </g>
        );
      })()}

      {/* Corner labels */}
      <text x={A.x + 18} y={A.y - 20} fill={Ink.muted} fontSize={11}>
        90°
      </text>
      <text x={B.x + 8} y={B.y - 8} fill={Ink.muted} fontSize={11}>
        vannrett
      </text>
      <text x={C.x + 10} y={C.y + 4} fill={Ink.muted} fontSize={11}>
        lodd
      </text>

      {/* How to use */}
      <text x="24" y="372" fill={Ink.muted} fontSize={11}>
        Bruk: hypotenus mot vangeoverkant → merk neser hver {fmt0(hyp)} mm
        (første nese ca. u {fmt0(geo.noses[0])}). Samme mal til lodd/vannrett
        fot.
      </text>
    </svg>
  );
}

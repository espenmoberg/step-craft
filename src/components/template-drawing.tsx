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

  const ox = 160;
  const oy = 330;
  const scale = 1.15;
  const gx = g * scale;
  const ry = r * scale;

  const A = { x: ox, y: oy };
  const B = { x: ox + gx, y: oy };
  const C = { x: ox, y: oy - ry };

  const dim = 28;

  // Offset hypotenuse dimension OUTSIDE the triangle (away from A)
  const bcx = (B.x + C.x) / 2;
  const bcy = (B.y + C.y) / 2;
  const dx = C.x - B.x;
  const dy = C.y - B.y;
  const len = Math.hypot(dx, dy) || 1;
  // Two unit normals
  let nx = -dy / len;
  let ny = dx / len;
  // Pick the normal pointing away from A
  if ((bcx + nx - A.x) ** 2 + (bcy + ny - A.y) ** 2 < (bcx - nx - A.x) ** 2 + (bcy - ny - A.y) ** 2) {
    nx = -nx;
    ny = -ny;
  }
  const hoff = 56;
  const h1 = { x: B.x + nx * hoff, y: B.y + ny * hoff };
  const h2 = { x: C.x + nx * hoff, y: C.y + ny * hoff };
  // Tekst utenfor dimensjonslinjen (ikke oppå den)
  const hMid = {
    x: (h1.x + h2.x) / 2 + nx * 22,
    y: (h1.y + h2.y) / 2 + ny * 22,
  };

  // Angle label: inne i vinkelen, klar av hypotenus og bunnlinje
  const angLabel = {
    x: A.x + gx * 0.55,
    y: A.y - 52,
  };

  return (
    <svg
      viewBox="0 0 720 470"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Trekantmal for merking av vange"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="720" height="470" fill={Ink.bg} />

      <text x="24" y="28" fontSize={15} fontWeight={600} fill={Ink.text}>
        Trekantmal: ett steg
      </text>
      <text x="24" y="50" fill={Ink.muted} fontSize={12}>
        Rettvinklet mal i kryssfinér eller MDF. Hypotenusen legges langs
        vangens overkant.
      </text>

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

      <polyline
        points={pts([
          [A.x + 16, A.y],
          [A.x + 16, A.y - 16],
          [A.x, A.y - 16],
        ])}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      <text x={A.x + 22} y={A.y - 22} fill={Ink.muted} fontSize={11}>
        90°
      </text>

      <path
        d={`M ${B.x - 44} ${B.y} A 44 44 0 0 0 ${
          B.x - 44 * Math.cos((th * Math.PI) / 180)
        } ${B.y - 44 * Math.sin((th * Math.PI) / 180)}`}
        fill="none"
        stroke={Ink.blue}
        strokeWidth={1.25}
      />
      <text
        x={angLabel.x}
        y={angLabel.y}
        fill={Ink.blue}
        fontSize={13}
        fontWeight={600}
      >
        {fmt1(th)}°
      </text>

      {/* Inntrinn */}
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
        y={A.y + dim + 22}
        textAnchor="middle"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        Inntrinn {fmt0(g)} (vannrett)
      </text>

      {/* Opptrinn */}
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
        y={(A.y + C.y) / 2 - 8}
        textAnchor="end"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        Opptrinn
      </text>
      <text
        x={A.x - dim - 12}
        y={(A.y + C.y) / 2 + 10}
        textAnchor="end"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        {fmt1(r)} (lodd)
      </text>

      {/* Hypotenus — utenfor trekanten */}
      <line
        x1={h1.x}
        y1={h1.y}
        x2={h2.x}
        y2={h2.y}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={B.x}
        y1={B.y}
        x2={h1.x}
        y2={h1.y}
        stroke={Ink.dim}
        strokeWidth={0.75}
      />
      <line
        x1={C.x}
        y1={C.y}
        x2={h2.x}
        y2={h2.y}
        stroke={Ink.dim}
        strokeWidth={0.75}
      />
      <text
        x={hMid.x}
        y={hMid.y}
        textAnchor="middle"
        fill={Ink.text}
        fontWeight={600}
        fontSize={13}
      >
        Hypotenus {fmt0(hyp)} · langs overkant
      </text>

      <line
        x1={24}
        y1={400}
        x2={696}
        y2={400}
        stroke={Ink.dim}
        strokeWidth={0.75}
      />
      <text x="24" y="422" fill={Ink.muted} fontSize={12}>
        Bruk: legg hypotenusen mot vangeoverkant. Merk neser hver {fmt0(hyp)}{" "}
        mm (første nese ca. u {fmt0(geo.noses[0])}).
      </text>
      <text x="24" y="442" fill={Ink.muted} fontSize={12}>
        Samme mal brukes til lodd- og vannrett fotkapp.
      </text>
    </svg>
  );
}

"use client";

import type { StairGeometry } from "@/lib/geometry";
import { BLOCK_MITER_DEG, blockDimsForStep } from "@/lib/blocks";
import { Ink, fmt0, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Enkel bruksanvisning: merk neser → sett kloss ved nese.
 */
export function TemplateUsageDrawing({ geo }: Props) {
  const g = geo.params.g;
  const r = geo.r;
  const hyp = geo.mal.hypot;
  const nose0 = geo.noses[0];
  const W = geo.params.W;
  const block = blockDimsForStep(geo, 0);
  const th = (geo.angleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);

  const scale = 0.36;
  const x0 = 48;
  const boardLen = 1000;
  const boardW = x0 + boardLen * scale;
  const boardH = W * scale;
  const alt = (g * r) / hyp;
  const uX = (u: number) => x0 + u * scale;

  function mal(u: number, y: number) {
    const p = { x: uX(u), y };
    const q = { x: uX(u + hyp), y };
    return {
      p,
      q,
      tip: { x: p.x + ((r * r) / hyp) * scale, y: y + alt * scale },
    };
  }

  const yA = 78;
  const yB = 230;

  const m1 = mal(nose0, yA);

  // Kloss ved nese (panel B)
  const nx = uX(nose0);
  const topY = yB + (5 + 48 * cos) * scale;
  const botY = yB + (5 + 96 * cos) * scale;
  const kloss = [
    [nx, topY],
    [nx + block.topMm * cos * scale, topY + block.topMm * sin * scale],
    [nx + block.bottomMm * cos * scale, botY + block.bottomMm * sin * scale],
    [nx, botY],
  ] as Array<[number, number]>;

  return (
    <svg
      viewBox="0 0 720 420"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Enkel bruk av mal og kloss"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="720" height="420" fill={Ink.bg} />

      <text x="24" y="26" fontSize={15} fontWeight={600} fill={Ink.text}>
        Slik gjør du det
      </text>

      {/* —— A: neser —— */}
      <text x="24" y="54" fontSize={13} fontWeight={600} fill={Ink.text}>
        A · Merk neser
      </text>
      <text x="120" y="54" fill={Ink.muted} fontSize={12}>
        Hypotenus mot overkant. Første nese u {fmt0(nose0)}, deretter hver{" "}
        {fmt0(hyp)} mm.
      </text>

      <rect
        x={x0}
        y={yA}
        width={boardW - x0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.4}
      />
      <polygon
        points={pts([
          [m1.p.x, m1.p.y],
          [m1.q.x, m1.q.y],
          [m1.tip.x, m1.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.2}
        stroke={Ink.blue}
        strokeWidth={1.4}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={uX(nose0 + i * hyp)} cy={yA} r={3} fill={Ink.blue} />
          <text
            x={uX(nose0 + i * hyp)}
            y={yA - 10}
            textAnchor="middle"
            fill={Ink.blue}
            fontSize={11}
            fontWeight={600}
          >
            {i + 1}
          </text>
        </g>
      ))}

      {/* —— B: kloss —— */}
      <text x="24" y="200" fontSize={13} fontWeight={600} fill={Ink.text}>
        B · Sett kloss
      </text>
      <text x="120" y="200" fill={Ink.muted} fontSize={12}>
        Kapp klossene ferdige først ({fmt0(block.topMm)} /{" "}
        {fmt0(block.bottomMm)}, bak {BLOCK_MITER_DEG}°).
      </text>

      <rect
        x={x0}
        y={yB}
        width={boardW - x0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.4}
      />
      <circle cx={nx} cy={yB} r={3} fill={Ink.blue} />
      <text
        x={nx}
        y={yB - 10}
        textAnchor="middle"
        fill={Ink.blue}
        fontSize={11}
        fontWeight={600}
      >
        nese
      </text>
      <polygon
        points={pts(kloss)}
        fill={Ink.blue}
        fillOpacity={0.18}
        stroke={Ink.line}
        strokeWidth={1.4}
      />

      {/* Three short cues next to the block — no essay */}
      <text x={nx - 8} y={yB + boardH * 0.55} textAnchor="end" fill={Ink.text} fontSize={11}>
        1 forside ved nese
      </text>
      <text
        x={(kloss[0][0] + kloss[1][0]) / 2}
        y={topY - 8}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={11}
      >
        2 vater på toppen
      </text>
      <text
        x={kloss[1][0] + 10}
        y={(kloss[1][1] + kloss[2][1]) / 2 + 4}
        fill={Ink.text}
        fontSize={11}
      >
        3 skru
      </text>

      <text x="24" y="360" fill={Ink.muted} fontSize={12}>
        Lang flate av 45°-kappet opp. Gjenta ved hver nese (begge vanger).
      </text>
      <text x="24" y="382" fill={Ink.muted} fontSize={12}>
        Prøv ett trinnbord: nesa skal ligge 5 mm under overkant.
      </text>
      <text x="24" y="404" fill={Ink.muted} fontSize={11}>
        Fotkapp: malens rette sider mot kanten (lodd + vannrett).
      </text>
    </svg>
  );
}

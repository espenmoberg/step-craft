"use client";

import type { StairGeometry } from "@/lib/geometry";
import {
  BLOCK_MITER_DEG,
  blockDimsForStep,
} from "@/lib/blocks";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Bruk av trekantmal: neser, forskyvning, og plassering av sidekloss.
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

  // Samme skala for vange og mal
  const scale = 0.36;
  const boardX0 = 40;
  const boardLenMm = 1180;
  const boardW = boardX0 + boardLenMm * scale;
  const boardH = W * scale;
  const alt = (g * r) / hyp;

  const uToX = (u: number) => boardX0 + u * scale;

  function malAt(uLeft: number, topY: number) {
    const p = { x: uToX(uLeft), y: topY };
    const q = { x: uToX(uLeft + hyp), y: topY };
    const footX = p.x + ((r * r) / hyp) * scale;
    return {
      p,
      q,
      tip: { x: footX, y: topY + alt * scale },
    };
  }

  const y1 = 88;
  const y2 = 230;
  const y3 = 375;

  const mal1 = malAt(nose0, y1);
  const mal2a = malAt(nose0, y2);
  const mal2b = malAt(nose0 + hyp, y2);

  // Block on panel 3: front at nose, top horizontal 244mm
  // In board drawing (overkant horizontal): horizontal run → Δu = L*cos, Δv = L*sin
  const noseX = uToX(nose0);
  const blockTopFront = {
    x: noseX,
    y: y3 + (5 + 48 * cos) * scale, // under trinn
  };
  const blockTopBack = {
    x: noseX + block.topMm * cos * scale,
    y: blockTopFront.y + block.topMm * sin * scale,
  };
  const blockBotFront = {
    x: noseX,
    y: y3 + (5 + 96 * cos) * scale,
  };
  const blockBotBack = {
    x: noseX + block.bottomMm * cos * scale,
    y: blockBotFront.y + block.bottomMm * sin * scale,
  };

  // Plumb guide at nose (short tick into board)
  const plumbBottom = { x: noseX, y: y3 + boardH * 0.85 };

  return (
    <svg
      viewBox="0 0 720 560"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Bruk av trekantmal og plassering av kloss"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="720" height="560" fill={Ink.bg} />

      <text x="24" y="24" fontSize={15} fontWeight={600} fill={Ink.text}>
        Slik brukes malen
      </text>
      <text x="24" y="42" fill={Ink.muted} fontSize={11}>
        Samme skala for vange, mal og kloss. Overkant øverst.
      </text>

      {/* —— 1 —— */}
      <text x="24" y="64" fontSize={12} fontWeight={600} fill={Ink.text}>
        1 · Merk neser med hypotenusen mot overkant
      </text>
      <rect
        x={boardX0}
        y={y1}
        width={boardW - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.4}
      />
      {[nose0, nose0 + hyp].map((u, i) => (
        <g key={i}>
          <circle cx={uToX(u)} cy={y1} r={2.5} fill={Ink.blue} />
          <text
            x={uToX(u)}
            y={y1 - 8}
            textAnchor="middle"
            fill={Ink.blue}
            fontSize={10}
            fontWeight={600}
          >
            Nese {i + 1}
          </text>
        </g>
      ))}
      <polygon
        points={pts([
          [mal1.p.x, mal1.p.y],
          [mal1.q.x, mal1.q.y],
          [mal1.tip.x, mal1.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.2}
        stroke={Ink.blue}
        strokeWidth={1.4}
      />
      <text
        x={(mal1.p.x + mal1.q.x) / 2}
        y={y1 - 10}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={10}
        fontWeight={600}
      >
        {fmt0(hyp)} mm
      </text>
      <text x="24" y={y1 + boardH + 16} fill={Ink.muted} fontSize={11}>
        Første nese u {fmt0(nose0)}. Deretter +{fmt0(hyp)} for hver nese.
      </text>

      {/* —— 2 —— */}
      <text x="24" y="210" fontSize={12} fontWeight={600} fill={Ink.text}>
        2 · Skyv malen ett steg
      </text>
      <rect
        x={boardX0}
        y={y2}
        width={boardW - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.4}
      />
      <polygon
        points={pts([
          [mal2a.p.x, mal2a.p.y],
          [mal2a.q.x, mal2a.q.y],
          [mal2a.tip.x, mal2a.tip.y],
        ])}
        fill="none"
        stroke={Ink.dim}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <polygon
        points={pts([
          [mal2b.p.x, mal2b.p.y],
          [mal2b.q.x, mal2b.q.y],
          [mal2b.tip.x, mal2b.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.2}
        stroke={Ink.blue}
        strokeWidth={1.4}
      />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={uToX(nose0 + i * hyp)}
          cy={y2}
          r={2.5}
          fill={Ink.blue}
        />
      ))}
      <text x="24" y={y2 + boardH + 16} fill={Ink.muted} fontSize={11}>
        Gjenta til alle {geo.NT} neser er merket.
      </text>

      {/* —— 3 Kloss —— */}
      <text x="24" y="352" fontSize={12} fontWeight={600} fill={Ink.text}>
        3 · Plasser klossen fra nesa (bruk malen til lodd/vannrett)
      </text>
      <rect
        x={boardX0}
        y={y3}
        width={boardW - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.4}
      />

      {/* Nose */}
      <circle cx={noseX} cy={y3} r={2.5} fill={Ink.blue} />
      <text
        x={noseX}
        y={y3 - 8}
        textAnchor="middle"
        fill={Ink.blue}
        fontSize={10}
        fontWeight={600}
      >
        Nese
      </text>

      {/* Plumb line at nose = front of block */}
      <line
        x1={noseX}
        y1={y3}
        x2={plumbBottom.x}
        y2={plumbBottom.y}
        stroke={Ink.line}
        strokeWidth={1.1}
        strokeDasharray="3 2"
      />
      <text
        x={noseX - 6}
        y={y3 + boardH * 0.45}
        textAnchor="end"
        fill={Ink.text}
        fontSize={10}
      >
        lodd
      </text>

      {/* Block trapezoid */}
      <polygon
        points={pts([
          [blockTopFront.x, blockTopFront.y],
          [blockTopBack.x, blockTopBack.y],
          [blockBotBack.x, blockBotBack.y],
          [blockBotFront.x, blockBotFront.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.15}
        stroke={Ink.line}
        strokeWidth={1.4}
      />

      {/* Dimension top length — horizontal callout */}
      <text
        x={(blockTopFront.x + blockTopBack.x) / 2}
        y={blockTopFront.y - 6}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={10}
        fontWeight={600}
      >
        topp {fmt0(block.topMm)} vannrett
      </text>
      <text
        x={blockTopBack.x + 8}
        y={(blockTopBack.y + blockBotBack.y) / 2 + 4}
        fill={Ink.text}
        fontSize={10}
      >
        bak {BLOCK_MITER_DEG}°
      </text>

      {/* Mini mal hint: lodd edge at nose */}
      <text x="24" y={y3 + boardH + 18} fill={Ink.muted} fontSize={11}>
        a) Malens lodde side ved nesa → forside av kloss (lodd ende).
      </text>
      <text x="24" y={y3 + boardH + 34} fill={Ink.muted} fontSize={11}>
        b) Mål {fmt0(block.topMm)} mm vannrett bakover (vater), ikke langs
        vangen · bak {BLOCK_MITER_DEG}°, lang flate oppe.
      </text>
      <text x="24" y={y3 + boardH + 50} fill={Ink.muted} fontSize={11}>
        c) Kloss topp ca. 48 mm under trinnoverside (nesa er 5 mm under
        overkant).
      </text>

      <text x="24" y="548" fill={Ink.muted} fontSize={10}>
        Fotkapp: rette sider ({fmt0(g)} / {fmt1(r)}) mot kanten for B–A lodd og
        A–C vannrett.
      </text>
    </svg>
  );
}

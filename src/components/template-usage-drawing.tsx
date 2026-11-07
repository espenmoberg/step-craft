"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Viser hvordan trekantmalen legges langs vangeoverkant og forskyves for nesemarkering.
 * Samme skala for vange og mal (malens høyde mot hypotenus får plass i 48×198).
 */
export function TemplateUsageDrawing({ geo }: Props) {
  const g = geo.params.g;
  const r = geo.r;
  const hyp = geo.mal.hypot;
  const nose0 = geo.noses[0];
  const W = geo.params.W;

  // Én skala for både vange og mal (mm → px)
  const scale = 0.38;
  const boardX0 = 36;
  const boardLen = 1100; // vis del av vangen
  const boardW = boardX0 + boardLen * scale;
  const boardH = W * scale; // ~75 px — ekte proporsjon
  const alt = (g * r) / hyp; // høyde mot hypotenus ≈ 152 mm < W

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

  // Panel Y-positions
  const y1 = 100;
  const y2 = 270;

  const mal1 = malAt(nose0, y1);
  const mal2a = malAt(nose0, y2); // ghost
  const mal2b = malAt(nose0 + hyp, y2);

  const noses1 = [0, 1, 2].map((i) => nose0 + i * hyp);

  return (
    <svg
      viewBox="0 0 720 470"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Bruk av trekantmal på vangen"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="720" height="470" fill={Ink.bg} />

      <text x="24" y="26" fontSize={15} fontWeight={600} fill={Ink.text}>
        Slik brukes malen
      </text>
      <text x="24" y="46" fill={Ink.muted} fontSize={11}>
        Samme skala for vange og mal. Overkant øverst (innsiden).
      </text>

      {/* —— Steg 1 —— */}
      <text x="24" y="72" fontSize={13} fontWeight={600} fill={Ink.text}>
        1 · Hypotenus mot overkant
      </text>

      <rect
        x={boardX0}
        y={y1}
        width={boardW - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.5}
      />
      <text
        x={boardW - 8}
        y={y1 + boardH / 2 + 4}
        textAnchor="end"
        fill={Ink.muted}
        fontSize={10}
      >
        48×{W}
      </text>

      {/* Nose marks */}
      {noses1.map((u, i) => (
        <g key={i}>
          <line
            x1={uToX(u)}
            y1={y1 - 4}
            x2={uToX(u)}
            y2={y1 + 10}
            stroke={Ink.blue}
            strokeWidth={1.25}
          />
          <circle cx={uToX(u)} cy={y1} r={2.5} fill={Ink.blue} />
          {i < 2 && (
            <text
              x={uToX(u)}
              y={y1 - 10}
              textAnchor="middle"
              fill={Ink.blue}
              fontSize={10}
              fontWeight={600}
            >
              Nese {i + 1}
            </text>
          )}
        </g>
      ))}

      {/* Mal — tip inside board */}
      <polygon
        points={pts([
          [mal1.p.x, mal1.p.y],
          [mal1.q.x, mal1.q.y],
          [mal1.tip.x, mal1.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.22}
        stroke={Ink.blue}
        strokeWidth={1.5}
      />

      {/* Hyp span */}
      <line
        x1={mal1.p.x}
        y1={y1 - 28}
        x2={mal1.q.x}
        y2={y1 - 28}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={mal1.p.x}
        y1={y1 - 32}
        x2={mal1.p.x}
        y2={y1 - 24}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={mal1.q.x}
        y1={y1 - 32}
        x2={mal1.q.x}
        y2={y1 - 24}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text
        x={(mal1.p.x + mal1.q.x) / 2}
        y={y1 - 36}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={11}
        fontWeight={600}
      >
        {fmt0(hyp)} mm
      </text>

      <text x="24" y={y1 + boardH + 20} fill={Ink.muted} fontSize={11}>
        Venstre hjørne på overkant = nese (u {fmt0(nose0)}). Merk med blyant.
      </text>

      {/* —— Steg 2 —— */}
      <text x="24" y="248" fontSize={13} fontWeight={600} fill={Ink.text}>
        2 · Skyv ett steg ({fmt0(hyp)} mm) og merk neste
      </text>

      <rect
        x={boardX0}
        y={y2}
        width={boardW - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.5}
      />

      {/* Ghost previous */}
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

      {/* Moved mal */}
      <polygon
        points={pts([
          [mal2b.p.x, mal2b.p.y],
          [mal2b.q.x, mal2b.q.y],
          [mal2b.tip.x, mal2b.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.22}
        stroke={Ink.blue}
        strokeWidth={1.5}
      />

      {[nose0, nose0 + hyp, nose0 + 2 * hyp].map((u, i) => (
        <g key={i}>
          <circle cx={uToX(u)} cy={y2} r={2.5} fill={Ink.blue} />
          <text
            x={uToX(u)}
            y={y2 - 10}
            textAnchor="middle"
            fill={Ink.blue}
            fontSize={10}
            fontWeight={600}
          >
            {i + 1}
          </text>
        </g>
      ))}

      <defs>
        <marker
          id="arr"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={Ink.line} />
        </marker>
      </defs>
      <line
        x1={mal2a.p.x + 12}
        y1={y2 - 22}
        x2={mal2b.p.x - 12}
        y2={y2 - 22}
        stroke={Ink.line}
        strokeWidth={1.1}
        markerEnd="url(#arr)"
      />
      <text
        x={(mal2a.p.x + mal2b.p.x) / 2}
        y={y2 - 28}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={11}
        fontWeight={600}
      >
        +{fmt0(hyp)}
      </text>

      <text x="24" y={y2 + boardH + 20} fill={Ink.muted} fontSize={11}>
        Gjenta til alle {geo.NT} neser er merket.
      </text>

      {/* —— Steg 3 —— */}
      <text x="24" y="420" fontSize={13} fontWeight={600} fill={Ink.text}>
        3 · Fotkapp med samme mal
      </text>
      <text x="24" y="442" fill={Ink.muted} fontSize={11}>
        Rette sider ({fmt0(g)} vannrett / {fmt1(r)} lodd) mot kanten → merk B–A
        lodd og A–C vannrett.
      </text>
    </svg>
  );
}

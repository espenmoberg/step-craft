"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Viser hvordan trekantmalen legges langs vangeoverkant og forskyves for nesemarkering.
 */
export function TemplateUsageDrawing({ geo }: Props) {
  const g = geo.params.g;
  const r = geo.r;
  const hyp = geo.mal.hypot;
  const nose0 = geo.noses[0];
  const W = geo.params.W;

  // Panel 1: board + one mal placement
  const boardY = 110;
  const boardH = 56; // visual thickness (not to scale)
  const boardX0 = 40;
  const boardX1 = 680;
  const scale = 0.55; // mm → px along board

  // First nose position on board drawing (from left end ≈ u=0 at A region)
  const uToX = (u: number) => boardX0 + 50 + u * scale;

  // Mal with hypotenuse on top edge: right angle hangs down into the board
  // In board view: top edge is horizontal. Hypotenuse along top.
  // Rise is perpendicular into board (down), run along board... 
  // When mal is placed: hypotenuse on overkant. The right angle points "into" the board.
  // Looking at inside face: overkant at top. Mal: hypotenuse on top edge.
  // From left nose mark: run goes right along... actually for marking noses we only need
  // the hypotenuse length. Showing the triangle hanging below the top edge.

  const malScale = 0.72;
  const malHyp = hyp * malScale;
  const malR = r * malScale;

  // Place first mal so left end of hypotenuse is at nose 1, right at nose 1+hyp
  // Triangle hangs below: from left hyp endpoint, go down-right for the interior.
  // Simpler: hypotenuse from P to Q on top edge. Right angle R below.
  // For stair mal with run horizontal and rise vertical when free: when hypotenuse
  // is on top edge, the right-angle corner is offset perpendicular into the board.
  // Offset distance from hyp toward interior = (g*r)/hyp (altitude to hypotenuse).
  const alt = (g * r) / hyp; // altitude to hypotenuse in mm
  const altPx = alt * malScale;

  function malAt(uLeft: number) {
    const p = { x: uToX(uLeft), y: boardY }; // left hyp end (nese)
    const q = { x: uToX(uLeft + hyp), y: boardY }; // right hyp end
    // Right angle below midpoint, offset by altitude
    // Position of right angle: from p along hyp by (g^2)/hyp, then perp into board by alt
    // Or: the run side leaves from the lower-angle end...
    // Visually clear: triangle with base on top edge, tip down.
    // Rett vinkel under hypotenusen (høyde mot hypotenus = g·r/hyp)
    const footX = p.x + (malR * malR) / malHyp;
    return {
      p,
      q,
      tip: { x: footX, y: boardY + altPx },
    };
  }

  const mal1 = malAt(nose0);
  const mal2 = malAt(nose0 + hyp); // next step — lightly shown

  // Show a few nose ticks
  const nosesShown = [0, 1, 2, 3].map((i) => nose0 + i * hyp).filter((u) => uToX(u) < boardX1 - 30);

  return (
    <svg
      viewBox="0 0 720 520"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Bruk av trekantmal på vangen"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={12}
    >
      <rect width="720" height="520" fill={Ink.bg} />

      <text x="24" y="28" fontSize={15} fontWeight={600} fill={Ink.text}>
        Slik brukes malen
      </text>
      <text x="24" y="50" fill={Ink.muted} fontSize={12}>
        Vangen sett fra innsiden — overkant øverst. Mål i mm langs overkant (u).
      </text>

      {/* —— Steg 1 —— */}
      <text x="24" y="82" fontSize={13} fontWeight={600} fill={Ink.text}>
        1 · Legg hypotenusen mot overkanten
      </text>

      {/* Stringer board */}
      <rect
        x={boardX0}
        y={boardY}
        width={boardX1 - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.5}
      />
      <text x={boardX0 + 8} y={boardY + boardH / 2 + 4} fill={Ink.muted} fontSize={11}>
        Endevange 48×{W}
      </text>
      <text x={boardX1 - 8} y={boardY - 8} textAnchor="end" fill={Ink.muted} fontSize={11}>
        overkant →
      </text>

      {/* Nose marks */}
      {nosesShown.map((u, i) => (
        <g key={i}>
          <line
            x1={uToX(u)}
            y1={boardY - 6}
            x2={uToX(u)}
            y2={boardY + 14}
            stroke={Ink.blue}
            strokeWidth={1.5}
          />
          <circle cx={uToX(u)} cy={boardY} r={3} fill={Ink.blue} />
          <text
            x={uToX(u)}
            y={boardY - 12}
            textAnchor="middle"
            fill={Ink.blue}
            fontSize={11}
            fontWeight={600}
          >
            {i === 0 ? `Nese 1` : i === 1 ? `Nese 2` : ""}
          </text>
          {i < 2 && (
            <text
              x={uToX(u)}
              y={boardY + boardH + 18}
              textAnchor="middle"
              fill={Ink.muted}
              fontSize={10}
            >
              u {fmt0(u)}
            </text>
          )}
        </g>
      ))}

      {/* Mal triangle on board */}
      <polygon
        points={pts([
          [mal1.p.x, mal1.p.y],
          [mal1.q.x, mal1.q.y],
          [mal1.tip.x, mal1.tip.y],
        ])}
        fill={Ink.blue}
        fillOpacity={0.18}
        stroke={Ink.blue}
        strokeWidth={1.75}
      />
      <text
        x={(mal1.p.x + mal1.q.x) / 2}
        y={mal1.tip.y + 18}
        textAnchor="middle"
        fill={Ink.blue}
        fontSize={12}
        fontWeight={600}
      >
        Mal
      </text>

      {/* Hypotenuse span dimension */}
      <line
        x1={mal1.p.x}
        y1={boardY - 36}
        x2={mal1.q.x}
        y2={boardY - 36}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={mal1.p.x}
        y1={boardY - 41}
        x2={mal1.p.x}
        y2={boardY - 31}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={mal1.q.x}
        y1={boardY - 41}
        x2={mal1.q.x}
        y2={boardY - 31}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text
        x={(mal1.p.x + mal1.q.x) / 2}
        y={boardY - 44}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={12}
        fontWeight={600}
      >
        Hypotenus {fmt0(hyp)}
      </text>

      <text x="24" y={boardY + boardH + 48} fill={Ink.muted} fontSize={12}>
        Venstre hjørne av hypotenusen = nese. Merk med blyant på overkanten.
      </text>

      {/* —— Steg 2 —— */}
      <text x="24" y="290" fontSize={13} fontWeight={600} fill={Ink.text}>
        2 · Skyv malen ett steg og merk neste nese
      </text>

      {/* Second board strip */}
      <rect
        x={boardX0}
        y={320}
        width={boardX1 - boardX0}
        height={boardH}
        fill="#f3f1ea"
        stroke={Ink.line}
        strokeWidth={1.5}
      />

      {/* Previous mal ghost */}
      <polygon
        points={pts([
          [mal1.p.x, 320],
          [mal1.q.x, 320],
          [mal1.tip.x, 320 + altPx],
        ])}
        fill="none"
        stroke={Ink.dim}
        strokeWidth={1.25}
        strokeDasharray="5 4"
      />
      <text
        x={(mal1.p.x + mal1.q.x) / 2}
        y={320 + altPx + 16}
        textAnchor="middle"
        fill={Ink.muted}
        fontSize={11}
      >
        forrige
      </text>

      {/* New mal position */}
      <polygon
        points={pts([
          [mal2.p.x, 320],
          [mal2.q.x, 320],
          [mal2.tip.x, 320 + altPx],
        ])}
        fill={Ink.blue}
        fillOpacity={0.18}
        stroke={Ink.blue}
        strokeWidth={1.75}
      />
      <text
        x={(mal2.p.x + mal2.q.x) / 2}
        y={320 + altPx + 16}
        textAnchor="middle"
        fill={Ink.blue}
        fontSize={12}
        fontWeight={600}
      >
        Mal (flyttet)
      </text>

      {/* Arrow between */}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={Ink.line} />
        </marker>
      </defs>
      <line
        x1={mal1.q.x + 8}
        y1={320 - 18}
        x2={mal2.p.x - 8}
        y2={320 - 18}
        stroke={Ink.line}
        strokeWidth={1.25}
        markerEnd="url(#arrow)"
      />
      <text
        x={(mal1.q.x + mal2.p.x) / 2}
        y={320 - 26}
        textAnchor="middle"
        fill={Ink.text}
        fontSize={11}
        fontWeight={600}
      >
        +{fmt0(hyp)} mm
      </text>

      {/* Nose dots on second strip */}
      {[nose0, nose0 + hyp, nose0 + 2 * hyp].map((u, i) => (
        <g key={i}>
          <circle cx={uToX(u)} cy={320} r={3} fill={Ink.blue} />
          <text
            x={uToX(u)}
            y={312}
            textAnchor="middle"
            fill={Ink.blue}
            fontSize={11}
            fontWeight={600}
          >
            {i + 1}
          </text>
        </g>
      ))}

      <text x="24" y="420" fill={Ink.muted} fontSize={12}>
        Gjenta til alle {geo.NT} neser er merket. Første nese: u {fmt0(nose0)}{" "}
        fra rett ende (punkt A).
      </text>

      {/* —— Steg 3 short —— */}
      <text x="24" y="455" fontSize={13} fontWeight={600} fill={Ink.text}>
        3 · Fotkapp med samme mal
      </text>
      <text x="24" y="476" fill={Ink.muted} fontSize={12}>
        Sett de rette sidene ({fmt0(g)} vannrett / {fmt1(r)} lodd) mot vangekanten
        for å merke lodd kapp B–A og vannrett fot A–C.
      </text>
    </svg>
  );
}

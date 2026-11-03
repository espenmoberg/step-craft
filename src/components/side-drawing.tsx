"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

type XY = { x: number; y: number };

/**
 * Sidetegning matching the handover PDF/SVG:
 * ascending left→right, horizontal tread boards, thin stringer outline,
 * short callouts (no long crossing leaders).
 */
export function SideDrawing({ geo }: Props) {
  const { params, world, r, NT, angleDeg, stringerLength } = geo;
  const stone = params.stoneBase;
  const th = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const k = Math.tan(th);

  const ytop = (x: number) => r + k * x + params.t / cos;
  const ybot = (x: number) => ytop(x) - params.W / cos;
  const xb0 = (0 - ybot(0)) / k;

  // World coords: y=0 at hellene (terreng). Wooden stair sits on stone.
  const A: XY = { x: world.xf, y: stone };
  const B: XY = { x: world.xf, y: stone + world.FRONT };
  const C: XY = { x: xb0, y: stone };
  const E: XY = { x: world.xe, y: stone + ytop(world.xe) };
  const F: XY = { x: world.xe, y: stone + world.ys };
  const G: XY = { x: world.xB, y: stone + world.ys };
  const H: XY = { x: world.xB, y: stone + ybot(world.xB) };

  const noses = world.noses.map((n) => ({
    x: n.x,
    y: n.y + stone,
  }));

  // Fit content into viewBox with margins (same framing as handover)
  const margin = { l: 70, r: 90, t: 70, b: 90 };
  const vbW = 760;
  const vbH = 700;
  const worldMinX = Math.min(A.x, noses[0].x) - 40;
  const worldMaxX = Math.max(E.x, noses[NT - 1].x) + 80;
  const worldMinY = 0;
  const worldMaxY = Math.max(params.H, noses[NT - 1].y + 950);
  const scale = Math.min(
    (vbW - margin.l - margin.r) / (worldMaxX - worldMinX),
    (vbH - margin.t - margin.b) / (worldMaxY - worldMinY)
  );
  const toX = (x: number) => margin.l + (x - worldMinX) * scale;
  const toY = (y: number) => vbH - margin.b - (y - worldMinY) * scale;

  const frontBoard = Math.min(148, params.d * 0.52);
  const gap = 4;
  const backBoard = Math.max(60, params.d - frontBoard - gap);
  const treadH = Math.max(4.5, 48 * scale);
  const blockH = Math.max(4, 48 * scale);

  // Stringer outline — same corner order as handover SVG
  const stringer = pts(
    [A, C, H, G, F, E, B].map((p) => [toX(p.x), toY(p.y)] as [number, number])
  );

  const railY = (noseY: number) => toY(noseY + 900);
  const first = noses[0];
  const last = noses[NT - 1];

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Sidetegning av utetrappa"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={11.5}
    >
      <rect width={vbW} height={vbH} fill={Ink.bg} />

      <text x="24" y="28" fontSize={15} fontWeight={600} fill={Ink.text}>
        Sidetegning: {params.n} opptrinn à {fmt1(r)}
        {stone > 0 ? ` + stein ${fmt1(stone)}` : ""} · {NT} inntrinn à {params.g}{" "}
        mm
      </text>
      <text x="24" y="48" fill={Ink.muted}>
        Mål i mm. Trinnene ligger på sideklosser mellom endevangene. Stigning{" "}
        {fmt1(angleDeg)}°.
      </text>

      {/* Ground line */}
      <line
        x1={toX(worldMinX)}
        y1={toY(0)}
        x2={toX(worldMaxX)}
        y2={toY(0)}
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      <text x={toX(A.x) - 8} y={toY(0) - 8} fill={Ink.text}>
        Terreng
      </text>
      <text x={toX(E.x) + 8} y={toY(params.H) - 8} fill={Ink.text}>
        Toppflate
      </text>
      <line
        x1={toX(E.x) - 20}
        y1={toY(params.H)}
        x2={toX(E.x) + 40}
        y2={toY(params.H)}
        stroke={Ink.line}
        strokeWidth={1.25}
      />

      {/* Stone under first rise */}
      {stone > 0 && (
        <rect
          x={toX(A.x)}
          y={toY(stone)}
          width={Math.max(28, (Math.min(first.x + params.g, C.x + 80) - A.x) * scale)}
          height={stone * scale}
          fill={Ink.stone}
          fillOpacity={0.35}
          stroke={Ink.line}
          strokeWidth={1}
        />
      )}

      {/* Endevange — light fill so the board reads as a thin band, not stray diagonals */}
      <polygon
        points={stringer}
        fill={Ink.blue}
        fillOpacity={0.06}
        stroke={Ink.line}
        strokeWidth={1.5}
      />

      {/* Trinn + klosser */}
      {noses.map((nose, i) => {
        const x0 = toX(nose.x);
        const y0 = toY(nose.y);
        const fw = frontBoard * scale;
        const bw = backBoard * scale;
        const gapW = gap * scale;
        return (
          <g key={i}>
            <rect
              x={x0}
              y={y0}
              width={fw}
              height={treadH}
              fill={Ink.blue}
              fillOpacity={0.25}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <rect
              x={x0 + fw + gapW}
              y={y0}
              width={bw}
              height={treadH}
              fill={Ink.blue}
              fillOpacity={0.25}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <rect
              x={x0}
              y={y0 + treadH}
              width={params.KL * scale}
              height={blockH}
              fill="none"
              stroke={Ink.line}
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Stolper (3) + håndlist — parallel with nose line */}
      {([0, Math.floor((NT - 1) / 2), NT - 1] as const).map((idx, i) => {
        const nose = noses[idx];
        const px = toX(nose.x + 36);
        const py = toY(nose.y);
        const top = railY(nose.y);
        const w = 11;
        return (
          <polygon
            key={`p-${i}`}
            points={pts([
              [px, py],
              [px + w, py],
              [px + w, top],
              [px, top + 6],
            ])}
            fill="none"
            stroke={Ink.line}
            strokeWidth={1.25}
          />
        );
      })}
      <line
        x1={toX(first.x - 60)}
        y1={railY(first.y)}
        x2={toX(last.x + 100)}
        y2={railY(last.y)}
        stroke={Ink.line}
        strokeWidth={2}
      />

      {/* Dimensions — short, outside the stair */}
      <g stroke={Ink.dim} strokeWidth={1} fill={Ink.text}>
        <line
          x1={toX(first.x)}
          y1={toY(0) + 18}
          x2={toX(E.x)}
          y2={toY(0) + 18}
        />
        <line
          x1={toX(first.x)}
          y1={toY(0) + 13}
          x2={toX(first.x)}
          y2={toY(0) + 23}
        />
        <line
          x1={toX(E.x)}
          y1={toY(0) + 13}
          x2={toX(E.x)}
          y2={toY(0) + 23}
        />
        <text
          x={(toX(first.x) + toX(E.x)) / 2}
          y={toY(0) + 34}
          textAnchor="middle"
          stroke="none"
        >
          {fmt0(E.x - first.x)} (første trinnese til vangens toppende)
        </text>

        <line
          x1={toX(A.x)}
          y1={toY(0) + 44}
          x2={toX(first.x)}
          y2={toY(0) + 44}
        />
        <text x={toX(A.x)} y={toY(0) + 58} textAnchor="start" stroke="none">
          tå {fmt0(first.x - A.x)}
        </text>

        <line
          x1={toX(E.x) + 36}
          y1={toY(0)}
          x2={toX(E.x) + 36}
          y2={toY(params.H)}
        />
        <text
          x={toX(E.x) + 42}
          y={(toY(0) + toY(params.H)) / 2}
          stroke="none"
        >
          {fmt0(params.H)}
        </text>
        <text
          x={toX(E.x) + 42}
          y={(toY(0) + toY(params.H)) / 2 + 14}
          stroke="none"
        >
          {stone > 0
            ? `${params.n} × ${fmt1(r)} + ${fmt1(stone)}`
            : `${params.n} × ${fmt1(r)}`}
        </text>
      </g>

      {/* Compact labels — no long leaders across the stair */}
      <g fill={Ink.text} fontSize={11}>
        <text
          x={toX(noses[Math.min(2, NT - 1)].x)}
          y={toY(noses[Math.min(2, NT - 1)].y) - 10}
        >
          {params.d >= 290 ? "Trinn 2×48×148" : "Trinn 48×148 + 48×98"}
        </text>
        <text
          x={(toX(H.x) + toX(C.x)) / 2}
          y={(toY(H.y) + toY(C.y)) / 2 + 16}
        >
          Endevange 48×198
        </text>
        <text x={toX(first.x - 40)} y={railY(first.y) - 8}>
          Håndlist 900 over nese · stolpe Ø76
        </text>
        <text
          x={toX(noses[Math.floor(NT * 0.6)].x + 40)}
          y={toY(noses[Math.floor(NT * 0.6)].y) + treadH + blockH + 14}
        >
          Sidekloss 48×73 × {params.KL}
        </text>
      </g>

      <text x="24" y={vbH - 16} fill={Ink.muted} fontSize={11}>
        Diagonal A–F {fmt0(geo.diagonalAF)} · vange {fmt0(stringerLength)} ·
        vannrett {fmt0(geo.horizontalSpan)} mm
      </text>
    </svg>
  );
}

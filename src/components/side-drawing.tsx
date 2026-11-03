"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

/**
 * Sidetegning in the same visual language as the handover SVG/PDF:
 * horizontal tread boards, blue tint, callouts, dimension lines.
 */
export function SideDrawing({ geo }: Props) {
  const { params, world, r, NT, angleDeg, stringerLength } = geo;
  const stone = params.stoneBase;
  const th = (angleDeg * Math.PI) / 180;
  const c = Math.cos(th);
  const k = Math.tan(th);
  const ytop = (x: number) => r + k * x + params.t / c;
  const ybot = (x: number) => ytop(x) - params.W / c;
  const xb0 = (0 - ybot(0)) / k;

  // Fit drawing into viewBox like the handover (≈0.175 mm/px)
  const scale = 0.155;
  const ox = 95;
  const groundY = 600;
  const toX = (x: number) => ox + (x - world.xf) * scale;
  const toY = (y: number) => groundY - y * scale;

  const A = { x: world.xf, y: stone };
  const B = { x: world.xf, y: stone + world.FRONT };
  const C = { x: xb0, y: stone };
  const E = { x: world.xe, y: stone + ytop(world.xe) };
  const F = { x: world.xe, y: stone + world.ys };
  const G = { x: world.xB, y: stone + world.ys };
  const H = { x: world.xB, y: stone + ybot(world.xB) };

  // Stringer outline (outside edge): toe → bottom foot → heel → seat inner → seat outer → top end → front plumb
  const stringer = pts([A, C, H, G, F, E, B]);

  const frontBoard = 148;
  const gap = 4;
  const backBoard = Math.max(80, params.d - frontBoard - gap);
  const treadH = 48 * scale;
  const blockH = 48 * scale;

  const firstNose = world.noses[0];
  const lastNose = world.noses[NT - 1];
  const topX = toX(world.xe);
  const firstNoseX = toX(firstNose.x);
  const toeX = toX(world.xf);

  const callouts: Array<{
    label: string;
    side: "left" | "right";
    ty: number;
    tx: number;
    ax: number;
    ay: number;
  }> = [
    {
      label: "Håndlist 48×148 + lekt, 900 over nese",
      side: "left",
      ty: 95,
      tx: 250,
      ax: toX(world.noses[Math.floor(NT / 2)].x + 20),
      ay: toY(world.noses[Math.floor(NT / 2)].y + stone) - 900 * scale,
    },
    {
      label: "Rund stolpe Ø76, M10-bolter",
      side: "left",
      ty: 130,
      tx: 250,
      ax: toX(world.noses[Math.floor(NT / 2)].x + 36),
      ay: toY(world.noses[Math.floor(NT / 2)].y + stone) - 200 * scale,
    },
    {
      label:
        params.d >= 290
          ? "Trinn 2 × 48×148"
          : "Trinn 48×148 + 48×98",
      side: "left",
      ty: 165,
      tx: 250,
      ax: toX(world.noses[Math.min(2, NT - 1)].x + params.d * 0.35),
      ay: toY(world.noses[Math.min(2, NT - 1)].y + stone) + treadH / 2,
    },
    {
      label: "Endevange 48×198",
      side: "right",
      ty: 455,
      tx: 470,
      ax: toX((world.noses[Math.floor(NT * 0.7)].x + world.xe) / 2),
      ay: toY(
        stone +
          (ytop(world.noses[Math.floor(NT * 0.7)].x) +
            ybot(world.noses[Math.floor(NT * 0.7)].x)) /
            2
      ),
    },
    {
      label: `Sidekloss 48×73 × ${params.KL}`,
      side: "right",
      ty: 485,
      tx: 470,
      ax: toX(world.noses[Math.floor(NT * 0.65)].x + 80),
      ay: toY(world.noses[Math.floor(NT * 0.65)].y + stone) + treadH + blockH / 2,
    },
  ];

  return (
    <svg
      viewBox="0 0 760 700"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Sidetegning av utetrappa"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={11.5}
    >
      <rect width="760" height="700" fill={Ink.bg} />

      <text x="24" y="30" fontSize={15} fontWeight={600} fill={Ink.text}>
        Sidetegning: {params.n} opptrinn à {fmt1(r)} mm
        {stone > 0 ? ` + stein ${fmt1(stone)} mm` : ""} · {NT} inntrinn à{" "}
        {params.g} mm
      </text>
      <text x="24" y="50" fill={Ink.muted}>
        Mål i mm. Trinnene ligger på sideklosser mellom endevangene. Stigning{" "}
        {fmt1(angleDeg)}°.
      </text>

      {/* Terreng / toppflate markers */}
      <line
        x1={toeX - 40}
        y1={toY(0)}
        x2={toeX + 70}
        y2={toY(0)}
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      <line
        x1={topX - 10}
        y1={toY(params.H)}
        x2={topX + 55}
        y2={toY(params.H)}
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      <text x={toeX - 45} y={toY(0) - 6} fill={Ink.text}>
        Terreng
      </text>
      <text x={topX + 8} y={toY(params.H) - 8} fill={Ink.text}>
        Toppflate
      </text>

      {/* Stone block */}
      {stone > 0 && (
        <rect
          x={toX(world.xf) - 4}
          y={toY(stone)}
          width={Math.max(36, params.g * scale * 0.85)}
          height={stone * scale}
          fill={Ink.stone}
          fillOpacity={0.35}
          stroke={Ink.line}
          strokeWidth={1}
        />
      )}

      {/* Stringer */}
      <polygon
        points={stringer}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.5}
      />

      {/* Treads + side blocks */}
      {world.noses.map((nose, i) => {
        const yTop = nose.y + stone;
        const x0 = toX(nose.x);
        const y0 = toY(yTop);
        const fw = frontBoard * scale;
        const bw = backBoard * scale;
        const gapW = gap * scale;
        return (
          <g key={i}>
            <polygon
              points={pts([
                [x0, y0],
                [x0 + fw, y0],
                [x0 + fw, y0 + treadH],
                [x0, y0 + treadH],
              ])}
              fill={Ink.blue}
              fillOpacity={0.25}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <polygon
              points={pts([
                [x0 + fw + gapW, y0],
                [x0 + fw + gapW + bw, y0],
                [x0 + fw + gapW + bw, y0 + treadH],
                [x0 + fw + gapW, y0 + treadH],
              ])}
              fill={Ink.blue}
              fillOpacity={0.25}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <polygon
              points={pts([
                [x0, y0 + treadH],
                [x0 + params.KL * scale, y0 + treadH],
                [x0 + params.KL * scale, y0 + treadH + blockH],
                [x0, y0 + treadH + blockH],
              ])}
              fill="none"
              stroke={Ink.line}
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Posts + handrail */}
      {([0, Math.floor((NT - 1) / 2), NT - 1] as const).map((noseIdx, i) => {
        const nose = world.noses[noseIdx];
        const px = toX(nose.x + 40);
        const py = toY(nose.y + stone);
        const ph = 900 * scale;
        const w = 12.8;
        return (
          <g key={`post-${i}`}>
            <polygon
              points={pts([
                [px, py],
                [px + w, py],
                [px + w, py - ph],
                [px, py - ph + 8.4],
              ])}
              fill="none"
              stroke={Ink.line}
              strokeWidth={1.25}
            />
            {i !== 1 && (
              <line
                x1={px + w / 2}
                y1={py}
                x2={px + w / 2}
                y2={py + 70 * scale}
                stroke={Ink.line}
                strokeWidth={1.25}
                strokeDasharray="3 3"
              />
            )}
          </g>
        );
      })}

      <polygon
        points={pts([
          [
            toX(firstNose.x - 80),
            toY(firstNose.y + stone) - 900 * scale,
          ],
          [
            toX(lastNose.x + 120),
            toY(lastNose.y + stone) - 900 * scale,
          ],
          [
            toX(lastNose.x + 120),
            toY(lastNose.y + stone) - 900 * scale + 10,
          ],
          [
            toX(firstNose.x - 80),
            toY(firstNose.y + stone) - 900 * scale + 10,
          ],
        ])}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />

      {/* Dimensions */}
      <g stroke={Ink.dim} strokeWidth={1} fill={Ink.text}>
        <line x1={firstNoseX} y1={groundY + 12} x2={topX} y2={groundY + 12} />
        <line x1={firstNoseX} y1={groundY + 7} x2={firstNoseX} y2={groundY + 17} />
        <line x1={topX} y1={groundY + 7} x2={topX} y2={groundY + 17} />
        <text
          x={(firstNoseX + topX) / 2}
          y={groundY + 28}
          textAnchor="middle"
          stroke="none"
        >
          {fmt0(world.xe - firstNose.x)} (første trinnese til vangens toppende)
        </text>

        <line x1={toeX} y1={groundY + 36} x2={firstNoseX} y2={groundY + 36} />
        <line x1={toeX} y1={groundY + 31} x2={toeX} y2={groundY + 41} />
        <text x={toeX} y={groundY + 54} textAnchor="start" stroke="none">
          tå {fmt0(-world.xf)}
        </text>

        <line
          x1={topX + 48}
          y1={toY(0)}
          x2={topX + 48}
          y2={toY(params.H)}
        />
        <line
          x1={topX + 43}
          y1={toY(0)}
          x2={topX + 53}
          y2={toY(0)}
        />
        <line
          x1={topX + 43}
          y1={toY(params.H)}
          x2={topX + 53}
          y2={toY(params.H)}
        />
        <text x={topX + 42} y={(toY(0) + toY(params.H)) / 2} textAnchor="end" stroke="none">
          {fmt0(params.H)}
        </text>
        <text
          x={topX + 42}
          y={(toY(0) + toY(params.H)) / 2 + 15}
          textAnchor="end"
          stroke="none"
        >
          {stone > 0
            ? `${params.n} × ${fmt1(r)} + ${fmt1(stone)}`
            : `${params.n} × ${fmt1(r)}`}
        </text>
      </g>

      {/* Callouts */}
      {callouts.map((c) => (
        <g key={c.label}>
          <line
            x1={c.tx}
            y1={c.ty}
            x2={c.ax}
            y2={c.ay}
            stroke={Ink.dim}
            strokeWidth={1}
          />
          <circle cx={c.ax} cy={c.ay} r={2} fill={Ink.line} />
          <text
            x={c.tx}
            y={c.ty + 4}
            textAnchor={c.side === "left" ? "end" : "start"}
            fill={Ink.text}
          >
            {c.label}
          </text>
        </g>
      ))}

      <text x="24" y="680" fill={Ink.muted} fontSize={11}>
        Diagonal A–F {fmt0(geo.diagonalAF)} mm · vange {fmt0(stringerLength)} mm
        · vannrett span {fmt0(geo.horizontalSpan)} mm
      </text>
    </svg>
  );
}

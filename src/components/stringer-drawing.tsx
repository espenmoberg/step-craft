"use client";

import type { StairGeometry } from "@/lib/geometry";
import {
  blockDimsForStep,
  BLOCK_MITER_DEG,
  STANDARD_BLOCK_TOP_MM,
  type BlockDims,
} from "@/lib/blocks";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

function boardOutline(
  geo: StairGeometry,
  ux: (u: number) => number,
  vy: (v: number) => number
): string {
  const { points, params } = geo;
  const W = params.W;
  const hasSeat = params.SEAT > 0;
  const corners: Array<[number, number]> = [
    [ux(points.B.u), vy(points.B.v)],
    [ux(points.E.u), vy(points.E.v)],
    [ux(points.F.u), vy(points.F.v)],
  ];
  if (hasSeat) {
    corners.push(
      [ux(points.G.u), vy(points.G.v)],
      [ux(points.H.u), vy(points.H.v)]
    );
  }
  corners.push([ux(points.C.u), vy(W)], [ux(points.A.u), vy(points.A.v)]);
  return pts(corners);
}

function treadAndBlock(
  geo: StairGeometry,
  uNose: number,
  dims: BlockDims,
  ux: (u: number) => number,
  vy: (v: number) => number
) {
  const th = (geo.angleDeg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);
  const { d, t } = geo.params;
  const { topMm, bottomMm } = dims;
  const tread = [
    [uNose, t],
    [uNose + d * c, t + d * s],
    [uNose + d * c - 48 * s, t + d * s + 48 * c],
    [uNose - 48 * s, t + 48 * c],
  ] as Array<[number, number]>;
  // Vannrett kloss: topp topMm, bunn bottomMm, bak 45° (lang flate oppe)
  const block = [
    [uNose - 48 * s, t + 48 * c],
    [uNose + topMm * c - 48 * s, t + 48 * c + topMm * s],
    [uNose + bottomMm * c - 96 * s, t + 96 * c + bottomMm * s],
    [uNose - 96 * s, t + 96 * c],
  ] as Array<[number, number]>;
  return {
    tread: pts(tread.map(([u, v]) => [ux(u), vy(v)])),
    block: pts(block.map(([u, v]) => [ux(u), vy(v)])),
    nose: { x: ux(uNose), y: vy(t) },
  };
}

/**
 * Vangetegning: oversikt + Detalj A/B med lesbare mål.
 */
export function StringerDrawing({ geo }: Props) {
  const { params, points, noses, stringerLength, r, NT } = geo;
  const L = stringerLength;
  const W = params.W;
  const block0 = blockDimsForStep(geo, 0);
  const lastBlock = blockDimsForStep(geo, NT - 1);

  const ovScale = 640 / L;
  const ovOx = 50;
  const ovOy = 100;
  const ovUx = (u: number) => ovOx + u * ovScale;
  const ovVy = (v: number) => ovOy + v * ovScale;

  // Detail A: leave room left of the toe for A-label
  const thA = (geo.angleDeg * Math.PI) / 180;
  const firstTreadEndU = noses[0] + params.d * Math.cos(thA);
  const dA = { ox: 110, oy: 220, u0: -40, u1: firstTreadEndU + 40, scale: 1 };
  dA.scale = 360 / (dA.u1 - dA.u0);
  const dAUx = (u: number) => dA.ox + (u - dA.u0) * dA.scale;
  const dAVy = (v: number) => dA.oy + v * dA.scale;

  // Utsnittet må starte før øverste nese, ellers havner trinn og kloss utenfor vangen
  const dB = {
    ox: 50,
    oy: 470,
    u0: Math.min(noses[NT - 1], points.E.u, points.F.u) - 140,
    u1: Math.max(points.E.u, points.F.u) + 40,
    scale: 1,
  };
  dB.scale = 560 / (dB.u1 - dB.u0);
  const dBUx = (u: number) => dB.ox + (u - dB.u0) * dB.scale;
  const dBVy = (v: number) => dB.oy + v * dB.scale;

  const labelEvery = noses.length > 12 ? 2 : 1;

  return (
    <svg
      viewBox="0 0 760 720"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Kapptegning for endevange"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={11.5}
    >
      <rect width="760" height="720" fill={Ink.bg} />

      <text x="24" y="26" fontSize={15} fontWeight={600} fill={Ink.text}>
        Endevange 48×{W}: kapp- og merkemål fra rett ende
      </text>
      <text x="24" y="46" fill={Ink.muted}>
        Lengde {fmt0(L)} mm · u langs overkant · v ned fra overkant · innsiden
        vist
      </text>

      <polygon
        points={boardOutline(geo, ovUx, ovVy)}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />

      {noses.map((u, i) => {
        const dims = blockDimsForStep(geo, i);
        const { tread, block, nose } = treadAndBlock(geo, u, dims, ovUx, ovVy);
        return (
          <g key={i}>
            <polygon
              points={tread}
              fill={Ink.blue}
              fillOpacity={0.2}
              stroke={Ink.blue}
              strokeWidth={0.75}
            />
            <polygon
              points={block}
              fill="none"
              stroke={Ink.line}
              strokeWidth={0.75}
            />
            <circle cx={nose.x} cy={nose.y} r={2} fill={Ink.blue} />
            {i % labelEvery === 0 && (
              <text
                x={nose.x}
                y={ovOy - 8}
                textAnchor="middle"
                fontSize={10.5}
                fill={Ink.muted}
              >
                {fmt0(u)}
              </text>
            )}
          </g>
        );
      })}

      <text x="50" y="78" fill={Ink.text}>
        Trinnese 1–{NT} (u, 5 mm under overkant)
      </text>
      <text
        x={ovUx(L / 2)}
        y={ovOy + W * ovScale + 20}
        textAnchor="middle"
        fill={Ink.text}
      >
        {fmt0(L)}
      </text>
      <text x="50" y={ovOy + W * ovScale + 38} fill={Ink.muted} fontSize={11}>
        Sidekloss: topp {fmt0(block0.topMm)} / bunn {fmt0(block0.bottomMm)} mm,
        bak {BLOCK_MITER_DEG}° — samme på alle trinn
      </text>

      {/* —— Detalj A —— */}
      <text x="24" y="195" fontSize={13} fontWeight={600} fill={Ink.text}>
        Detalj A – nedre ende (fot)
      </text>

      <polygon
        points={pts([
          [dAUx(points.B.u), dAVy(0)],
          [dAUx(dA.u1), dAVy(0)],
          [dAUx(dA.u1), dAVy(W)],
          [dAUx(points.C.u), dAVy(W)],
          [dAUx(points.A.u), dAVy(points.A.v)],
        ])}
        fill="#fafafa"
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      {(() => {
        const { tread, block, nose } = treadAndBlock(
          geo,
          noses[0],
          block0,
          dAUx,
          dAVy
        );
        return (
          <g>
            <polygon
              points={tread}
              fill={Ink.blue}
              fillOpacity={0.22}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <polygon
              points={block}
              fill="none"
              stroke={Ink.line}
              strokeWidth={1}
            />
            <circle cx={nose.x} cy={nose.y} r={3} fill={Ink.blue} />
          </g>
        );
      })()}

      {/* Dimension ticks on the end face for A */}
      <line
        x1={dAUx(points.A.u) - 18}
        y1={dAVy(0)}
        x2={dAUx(points.A.u) - 18}
        y2={dAVy(points.A.v)}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={dAUx(points.A.u) - 22}
        y1={dAVy(0)}
        x2={dAUx(points.A.u) - 14}
        y2={dAVy(0)}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <line
        x1={dAUx(points.A.u) - 22}
        y1={dAVy(points.A.v)}
        x2={dAUx(points.A.u) - 14}
        y2={dAVy(points.A.v)}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text
        x={dAUx(points.A.u) - 28}
        y={(dAVy(0) + dAVy(points.A.v)) / 2 + 4}
        textAnchor="end"
        fill={Ink.text}
        fontWeight={600}
      >
        A · v {fmt0(points.A.v)}
      </text>

      <text x={dAUx(points.B.u) + 4} y={dA.oy - 8} fill={Ink.text}>
        B · u {fmt0(points.B.u)} (overkant)
      </text>
      <text x={dAUx(noses[0]) + 8} y={dA.oy - 8} fill={Ink.blue}>
        Nese 1 · u {fmt0(noses[0])}
      </text>
      <text
        x={dAUx(points.C.u)}
        y={dAVy(W) + 16}
        textAnchor="middle"
        fill={Ink.text}
      >
        C · u {fmt0(points.C.u)} (underkant)
      </text>

      <text x="24" y={dA.oy + W * dA.scale + 34} fill={Ink.muted}>
        Kapp: B–A lodd · A–C vannrett (fot). Kloss topp {fmt0(block0.topMm)} /
        bunn {fmt0(block0.bottomMm)}, bak {BLOCK_MITER_DEG}°, 48 under
        trinnoverside.
      </text>

      {/* —— Detalj B —— */}
      <text x="24" y="448" fontSize={13} fontWeight={600} fill={Ink.text}>
        Detalj B – øvre ende (vannrett kapp)
      </text>

      <polygon
        points={pts([
          [dBUx(dB.u0), dBVy(0)],
          [dBUx(points.E.u), dBVy(0)],
          [dBUx(points.F.u), dBVy(W)],
          [dBUx(dB.u0), dBVy(W)],
        ])}
        fill="#fafafa"
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      {(() => {
        const { tread, block, nose } = treadAndBlock(
          geo,
          noses[NT - 1],
          lastBlock,
          dBUx,
          dBVy
        );
        return (
          <g>
            <polygon
              points={tread}
              fill={Ink.blue}
              fillOpacity={0.22}
              stroke={Ink.blue}
              strokeWidth={1}
            />
            <polygon
              points={block}
              fill="none"
              stroke={Ink.line}
              strokeWidth={1}
            />
            <circle cx={nose.x} cy={nose.y} r={3} fill={Ink.blue} />
          </g>
        );
      })()}

      <text x={dBUx(noses[NT - 1])} y={dB.oy - 8} fill={Ink.blue}>
        Nese {NT} · u {fmt0(noses[NT - 1])}
      </text>
      <text x={dBUx(points.E.u)} y={dB.oy - 8} textAnchor="middle" fill={Ink.text}>
        E · u {fmt0(points.E.u)}
      </text>
      <text x={dBUx(points.F.u)} y={dBVy(W) + 14} textAnchor="middle" fill={Ink.text}>
        F · u {fmt0(points.F.u)}
      </text>

      <text x="24" y={dB.oy + W * dB.scale + 32} fill={Ink.muted}>
        Kapp: E–F vannrett i toppflatehøyde (rett over øverste trinn). Sagvinkel{" "}
        {fmt1(geo.levelCutDeg)}° mot overkant. Ingen fuglenebb.
      </text>

      <text x="24" y="700" fill={Ink.muted} fontSize={11}>
        Mal: {params.g} × {fmt1(r)} (hyp. {fmt1(geo.mal.hypot)}) · lodd{" "}
        {fmt1(geo.plumbCutDeg)}° · vannrett {fmt1(geo.levelCutDeg)}° · kloss{" "}
        topp {STANDARD_BLOCK_TOP_MM} mm, bak {BLOCK_MITER_DEG}°
      </text>
    </svg>
  );
}

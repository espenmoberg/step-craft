"use client";

import type { StairGeometry } from "@/lib/geometry";
import { Ink, fmt0, fmt1, pts } from "@/lib/draw-style";

type Props = { geo: StairGeometry };

function boardOutline(
  geo: StairGeometry,
  ux: (u: number) => number,
  vy: (v: number) => number
): string {
  const { points, params } = geo;
  const W = params.W;
  // Inside face: B along top to E, down to F, seat to G, down to H, along bottom to C, to A, up to B
  return pts([
    [ux(points.B.u), vy(points.B.v)],
    [ux(points.E.u), vy(points.E.v)],
    [ux(points.F.u), vy(points.F.v)],
    [ux(points.G.u), vy(points.G.v)],
    [ux(points.H.u), vy(points.H.v)],
    [ux(points.C.u), vy(W)],
    [ux(points.A.u), vy(points.A.v)],
  ]);
}

function treadOnBoard(
  geo: StairGeometry,
  uNose: number,
  ux: (u: number) => number,
  vy: (v: number) => number
) {
  const th = (geo.angleDeg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);
  const { d, KL, t } = geo.params;
  const tread = [
    [uNose, t],
    [uNose + d * c, t + d * s],
    [uNose + d * c - 48 * s, t + d * s + 48 * c],
    [uNose - 48 * s, t + 48 * c],
  ] as Array<[number, number]>;
  const block = [
    [uNose - 48 * s, t + 48 * c],
    [uNose + KL * c - 48 * s, t + 48 * c + KL * s],
    [uNose + KL * c - 96 * s, t + 96 * c + KL * s],
    [uNose - 96 * s, t + 96 * c],
  ] as Array<[number, number]>;
  return {
    tread: pts(tread.map(([u, v]) => [ux(u), vy(v)])),
    block: pts(block.map(([u, v]) => [ux(u), vy(v)])),
    nose: { x: ux(uNose), y: vy(t) },
  };
}

/**
 * Vangetegning matching handover: overview + Detail A + Detail B.
 */
export function StringerDrawing({ geo }: Props) {
  const { params, points, noses, stringerLength, r, NT } = geo;
  const L = stringerLength;
  const W = params.W;

  // --- Overview ---
  const ovScale = 660 / L;
  const ovOx = 40;
  const ovOy = 110;
  const ovUx = (u: number) => ovOx + u * ovScale;
  const ovVy = (v: number) => ovOy + v * ovScale;

  // --- Detail A (lower) scale ~1.25 visual: map u 0..~450, v 0..198 into box ---
  const dA = {
    ox: 40,
    oy: 230,
    // show u from -20 to ~420, v 0..198
    u0: -30,
    u1: 420,
    scale: 1.0, // px per mm — tuned below
  };
  dA.scale = 400 / (dA.u1 - dA.u0);
  const dAUx = (u: number) => dA.ox + (u - dA.u0) * dA.scale;
  const dAVy = (v: number) => dA.oy + v * dA.scale;

  // --- Detail B (upper) ---
  const dB = {
    ox: 40,
    oy: 478,
    u0: L - 520,
    u1: L + 40,
    scale: 1.0,
  };
  dB.scale = 380 / (dB.u1 - dB.u0);
  const dBUx = (u: number) => dB.ox + (u - dB.u0) * dB.scale;
  const dBVy = (v: number) => dB.oy + v * dB.scale;

  const labelEvery = noses.length > 12 ? 2 : 1;

  return (
    <svg
      viewBox="0 0 760 700"
      className="h-auto w-full bg-white"
      role="img"
      aria-label="Kapptegning for endevange"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={11.5}
    >
      <rect width="760" height="700" fill={Ink.bg} />

      <text x="24" y="30" fontSize={15} fontWeight={600} fill={Ink.text}>
        Endevange 48×{W}: alle kapp- og merkemål fra brettets rette ende
      </text>
      <text x="24" y="50" fill={Ink.muted}>
        Lengde {fmt0(L)}. u = langs overkant fra rett ende, v = ned fra overkant.
        Innsiden vist.
      </text>

      {/* Overview board */}
      <polygon
        points={boardOutline(geo, ovUx, ovVy)}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />

      {noses.map((u, i) => {
        const { tread, block, nose } = treadOnBoard(geo, u, ovUx, ovVy);
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

      <text x="30" y="86" fill={Ink.text}>
        Trinnese nr. 1–{NT} (u, 5 mm under overkant):
      </text>
      <text
        x={ovUx(L / 2)}
        y={ovOy + W * ovScale + 22}
        textAnchor="middle"
        fill={Ink.text}
      >
        {fmt0(L)}
      </text>

      {/* Detail A */}
      <text x="24" y="198" fontSize={13} fontWeight={600} fill={Ink.text}>
        Detalj A – nedre ende (forstørret)
      </text>

      {/* Cropped board piece for detail A */}
      <polygon
        points={pts([
          [dAUx(points.B.u), dAVy(0)],
          [dAUx(420), dAVy(0)],
          [dAUx(420), dAVy(W)],
          [dAUx(points.C.u), dAVy(W)],
          [dAUx(points.A.u), dAVy(points.A.v)],
        ])}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      {(() => {
        const { tread, block, nose } = treadOnBoard(geo, noses[0], dAUx, dAVy);
        return (
          <g>
            <polygon
              points={tread}
              fill={Ink.blue}
              fillOpacity={0.2}
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
      <line
        x1={dAUx(420)}
        y1={dAVy(-4)}
        x2={dAUx(420)}
        y2={dAVy(W + 4)}
        stroke={Ink.dim}
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      <text x={dAUx(points.B.u)} y={dA.oy - 10} fill={Ink.text}>
        B: u {fmt0(points.B.u)} på overkant
      </text>
      <text x={dAUx(noses[0]) + 10} y={dA.oy - 10} fill={Ink.text}>
        Nese 1: u {fmt0(noses[0])}, v {fmt0(params.t)}
      </text>
      <text
        x={dAUx(points.A.u) - 6}
        y={dAVy(points.A.v) + 4}
        textAnchor="end"
        fill={Ink.text}
      >
        A: v {fmt0(points.A.v)} på enden
      </text>
      <text
        x={dAUx(points.C.u)}
        y={dAVy(W) + 18}
        textAnchor="middle"
        fill={Ink.text}
      >
        C: u {fmt0(points.C.u)} på underkant
      </text>
      <text x="24" y={dA.oy + W * dA.scale + 36} fill={Ink.muted}>
        B–A lodd, A–C vannrett (fot)
      </text>
      <line
        x1={466}
        y1={dA.oy + 90}
        x2={dAUx(noses[0] + params.KL * 0.5)}
        y2={dAVy(params.t + 72)}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text x="470" y={dA.oy + 94} fill={Ink.muted}>
        Kloss: fra nesa, {params.KL} lang, 48 under
      </text>

      {/* Detail B */}
      <text x="24" y="454" fontSize={13} fontWeight={600} fill={Ink.text}>
        Detalj B – øvre ende med sete (forstørret)
      </text>

      <polygon
        points={pts([
          [dBUx(dB.u0 + 20), dBVy(0)],
          [dBUx(points.E.u), dBVy(0)],
          [dBUx(points.F.u), dBVy(W)],
          [dBUx(points.G.u), dBVy(points.G.v)],
          [dBUx(points.H.u), dBVy(W)],
          [dBUx(dB.u0 + 20), dBVy(W)],
        ])}
        fill="none"
        stroke={Ink.line}
        strokeWidth={1.25}
      />
      {(() => {
        const { tread, block, nose } = treadOnBoard(
          geo,
          noses[NT - 1],
          dBUx,
          dBVy
        );
        return (
          <g>
            <polygon
              points={tread}
              fill={Ink.blue}
              fillOpacity={0.2}
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
      <line
        x1={dBUx(dB.u0 + 20)}
        y1={dBVy(-4)}
        x2={dBUx(dB.u0 + 20)}
        y2={dBVy(W + 4)}
        stroke={Ink.dim}
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      <text x={dBUx(noses[NT - 1])} y={dB.oy - 10} fill={Ink.text}>
        Nese {NT}: u {fmt0(noses[NT - 1])}
      </text>
      <text x={dBUx(points.E.u) + 6} y={dB.oy + 4} fill={Ink.text}>
        E: u {fmt0(points.E.u)} på overkant
      </text>
      <text x={dBUx(points.F.u) + 6} y={dBVy(W) + 16} fill={Ink.text}>
        F: u {fmt0(points.F.u)} på underkant
      </text>
      <text
        x={dBUx(points.H.u) - 4}
        y={dBVy(W) + 16}
        textAnchor="end"
        fill={Ink.text}
      >
        H: u {fmt0(points.H.u)} på underkant
      </text>
      <line
        x1={466}
        y1={dB.oy + 70}
        x2={dBUx(points.G.u)}
        y2={dBVy(points.G.v)}
        stroke={Ink.dim}
        strokeWidth={1}
      />
      <text x="470" y={dB.oy + 74} fill={Ink.text}>
        G: u {fmt0(points.G.u)}, v {fmt0(points.G.v)}
      </text>
      <text x="44" y={dB.oy + W * dB.scale + 36} fill={Ink.muted}>
        E–F lodd (endekapp), F–G vannrett (sete), G–H lodd
      </text>

      <text x="24" y="688" fill={Ink.muted} fontSize={11}>
        Mal: {params.g} × {fmt1(r)} (hypotenus {fmt1(geo.mal.hypot)}) · lodd kapp{" "}
        {fmt1(geo.plumbCutDeg)}° · vannrett kapp {fmt1(geo.levelCutDeg)}°
      </text>
    </svg>
  );
}

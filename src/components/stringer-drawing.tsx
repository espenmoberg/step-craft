"use client";

import type { StairGeometry } from "@/lib/geometry";
import { round0, round1 } from "@/lib/geometry";

type Props = {
  geo: StairGeometry;
};

export function StringerDrawing({ geo }: Props) {
  const { params, points, noses, stringerLength, r } = geo;
  const L = stringerLength;
  const W = params.W;

  const scale = 660 / L;
  const ox = 40;
  const oy = 110;

  const ux = (u: number) => ox + u * scale;
  const vy = (v: number) => oy + v * scale;

  const outline = [
    [points.B.u, points.B.v],
    [points.E.u, points.E.v],
    [points.F.u, points.F.v],
    [points.G.u, points.G.v],
    [points.H.u, points.H.v],
    [points.C.u, points.C.v],
    [points.A.u, points.A.v],
  ]
    .map(([u, v]) => `${ux(u).toFixed(1)},${vy(v).toFixed(1)}`)
    .join(" ");

  const th = (geo.angleDeg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);

  const labelEvery = noses.length > 10 ? 2 : 1;

  return (
    <svg
      viewBox="0 0 760 500"
      className="h-auto w-full"
      role="img"
      aria-label="Kapptegning for endevange"
    >
      <text x="24" y="28" className="fill-ink text-[15px] font-semibold">
        Endevange 48×{W}: kapp- og merkemål fra rett ende
      </text>
      <text x="24" y="48" className="fill-muted-ink text-[12px]">
        Lengde {round0(L)} mm · u langs overkant · v ned fra overkant · innsiden vist
      </text>

      <polygon
        points={outline}
        className="fill-parchment stroke-ink/70"
        strokeWidth="1.5"
      />

      {noses.map((u, i) => {
        const tread = params.d;
        const block = params.KL;
        const treadPoly = [
          [u, params.t],
          [u + tread * c, params.t + tread * s],
          [u + tread * c - 48 * s, params.t + tread * s + 48 * c],
          [u - 48 * s, params.t + 48 * c],
        ]
          .map(([uu, vv]) => `${ux(uu).toFixed(1)},${vy(vv).toFixed(1)}`)
          .join(" ");
        const blockPoly = [
          [u - 48 * s, params.t + 48 * c],
          [u + block * c - 48 * s, params.t + 48 * c + block * s],
          [u + block * c - 96 * s, params.t + 96 * c + block * s],
          [u - 96 * s, params.t + 96 * c],
        ]
          .map(([uu, vv]) => `${ux(uu).toFixed(1)},${vy(vv).toFixed(1)}`)
          .join(" ");

        return (
          <g key={i}>
            <polygon
              points={treadPoly}
              className="fill-cedar/35 stroke-cedar"
              strokeWidth="0.8"
            />
            <polygon
              points={blockPoly}
              className="fill-none stroke-ink/45"
              strokeWidth="0.7"
            />
            <circle cx={ux(u)} cy={vy(params.t)} r="2.2" className="fill-cedar" />
            {i % labelEvery === 0 && (
              <text
                x={ux(u)}
                y={oy - 10}
                textAnchor="middle"
                className="fill-muted-ink text-[10px]"
              >
                {round0(u)}
              </text>
            )}
          </g>
        );
      })}

      <text
        x={ux(L / 2)}
        y={oy + W * scale + 26}
        textAnchor="middle"
        className="fill-ink text-[12px]"
      >
        {round0(L)}
      </text>

      <g className="fill-ink text-[11px]">
        <text x={ux(points.B.u) + 4} y={oy - 24}>
          B u {round0(points.B.u)}
        </text>
        <text x={ux(points.A.u) - 6} y={vy(points.A.v) + 4} textAnchor="end">
          A v {round0(points.A.v)}
        </text>
        <text x={ux(points.C.u)} y={vy(W) + 20} textAnchor="middle">
          C u {round0(points.C.u)}
        </text>
        <text x={ux(points.E.u) + 6} y={oy - 8}>
          E u {round0(points.E.u)}
        </text>
        <text x={ux(points.F.u) + 6} y={vy(W) + 20}>
          F u {round0(points.F.u)}
        </text>
        <text x={ux(points.G.u)} y={vy(points.G.v) - 8} textAnchor="middle">
          G u {round0(points.G.u)} / v {round0(points.G.v)}
        </text>
        <text x={ux(points.H.u) - 4} y={vy(W) + 20} textAnchor="end">
          H u {round0(points.H.u)}
        </text>
      </g>

      <text x="24" y="460" className="fill-muted-ink text-[11px]">
        Mal: {params.g} × {round1(r)} (hypotenus {round1(geo.mal.hypot)}) · lodd kapp{" "}
        {round1(geo.plumbCutDeg)}° · vannrett kapp {round1(geo.levelCutDeg)}°
      </text>
      <text x="24" y="480" className="fill-muted-ink text-[11px]">
        B–A lodd, A–C fot · E–F lodd, F–G sete, G–H lodd · nese 5 mm under overkant
      </text>
    </svg>
  );
}

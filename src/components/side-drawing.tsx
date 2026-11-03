"use client";

import type { StairGeometry } from "@/lib/geometry";
import { round0, round1 } from "@/lib/geometry";

type Props = {
  geo: StairGeometry;
};

export function SideDrawing({ geo }: Props) {
  const { params, world, r, NT, angleDeg, stringerLength } = geo;
  const scale = 0.145;
  const padL = 90;
  const baseY = 520;
  const stone = params.stoneBase;

  const toX = (x: number) => padL + (x - world.xf) * scale;
  const toY = (y: number) => baseY - y * scale;

  const th = (angleDeg * Math.PI) / 180;
  const c = Math.cos(th);
  const k = Math.tan(th);
  const ytop = (x: number) => r + k * x + params.t / c;
  const ybot = (x: number) => ytop(x) - params.W / c;

  const A = { x: world.xf, y: stone };
  const B = { x: world.xf, y: stone + world.FRONT };
  const Cpt = { x: (0 - ybot(0)) / k, y: stone };
  const E = { x: world.xe, y: stone + ytop(world.xe) };
  const F = { x: world.xe, y: stone + world.ys };
  const G = { x: world.xB, y: stone + world.ys };
  const H = { x: world.xB, y: stone + ybot(world.xB) };

  const outline = [A, Cpt, H, G, F, E, B]
    .map((p) => `${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(" ");

  const treadH = Math.max(5, 48 * scale);
  const blockH = Math.max(4, 48 * scale);

  return (
    <svg
      viewBox="0 0 760 640"
      className="h-auto w-full"
      role="img"
      aria-label="Sidetegning av utetrappa"
    >
      <defs>
        <linearGradient id="woodFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9a56a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8d6840" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <text x="24" y="28" fill="#1f241c" fontSize="15" fontWeight="600">
        Sidetegning: {params.n} opptrinn à {round1(r)} mm
        {stone > 0 ? ` + stein ${round1(stone)} mm` : ""}
      </text>
      <text x="24" y="48" fill="#5c6356" fontSize="12">
        Inntrinn {NT} × {params.g} mm · stigning {round1(angleDeg)}° · vange{" "}
        {round0(stringerLength)} mm
      </text>

      {/* Ground */}
      <rect x="40" y={toY(0)} width="680" height="48" fill="#b9a882" opacity="0.35" />
      <line
        x1="40"
        y1={toY(0)}
        x2="720"
        y2={toY(0)}
        stroke="#1f241c"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <text x="48" y={toY(0) + 28} fill="#5c6356" fontSize="11">
        Helle / gangvei
      </text>

      {/* Stone base */}
      {stone > 0 && (
        <g>
          <rect
            x={toX(world.xf) - 6}
            y={toY(stone)}
            width={Math.max(40, params.g * scale + 18)}
            height={stone * scale}
            fill="#9a8b6e"
            stroke="#1f241c"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <text
            x={toX(world.xf) + 8}
            y={toY(stone / 2) + 4}
            fill="#1f241c"
            fontSize="10"
          >
            stein {round1(stone)}
          </text>
        </g>
      )}

      {/* Stringer */}
      <polygon
        points={outline}
        fill="url(#woodFill)"
        stroke="#1f241c"
        strokeOpacity="0.7"
        strokeWidth="1.7"
      />

      {/* Treads + blocks */}
      {world.noses.map((nose, i) => {
        const yTop = nose.y + stone;
        const frontW = params.d * scale * 0.5;
        const backW = params.d * scale * 0.42;
        return (
          <g key={i}>
            <rect
              x={toX(nose.x)}
              y={toY(yTop)}
              width={frontW}
              height={treadH}
              fill="#9a6b3a"
              fillOpacity="0.55"
              stroke="#9a6b3a"
              strokeWidth="1"
            />
            <rect
              x={toX(nose.x) + frontW + 2}
              y={toY(yTop)}
              width={backW}
              height={treadH}
              fill="#9a6b3a"
              fillOpacity="0.4"
              stroke="#9a6b3a"
              strokeWidth="1"
            />
            <rect
              x={toX(nose.x)}
              y={toY(yTop) + treadH}
              width={params.KL * scale}
              height={blockH}
              fill="none"
              stroke="#1f241c"
              strokeOpacity="0.45"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Posts + handrail */}
      {world.posts.map((_, i) => {
        const noseIdx =
          i === 0 ? 0 : i === 1 ? Math.floor((NT - 1) / 2) : NT - 1;
        const nose = world.noses[noseIdx];
        const px = toX(nose.x + 30);
        const py = toY(nose.y + stone);
        const ph = 900 * scale;
        const buried = i === 1 ? 0 : 80 * scale;
        return (
          <rect
            key={`post-${i}`}
            x={px}
            y={py - ph}
            width={10}
            height={ph + buried}
            fill="none"
            stroke="#1f241c"
            strokeOpacity="0.55"
            strokeWidth="1.3"
          />
        );
      })}

      {(() => {
        const a = world.noses[0];
        const b = world.noses[NT - 1];
        const railY = (n: { y: number }) => toY(n.y + stone) - 900 * scale;
        return (
          <line
            x1={toX(a.x - 50)}
            y1={railY(a)}
            x2={toX(b.x + 90)}
            y2={railY(b)}
            stroke="#1f241c"
            strokeOpacity="0.45"
            strokeWidth="2.5"
          />
        );
      })()}

      {/* Height dimension */}
      <line
        x1="705"
        y1={toY(0)}
        x2="705"
        y2={toY(params.H)}
        stroke="#1f241c"
        strokeOpacity="0.3"
        strokeWidth="1"
      />
      <text x="716" y={(toY(0) + toY(params.H)) / 2} fill="#1f241c" fontSize="12">
        {params.H}
      </text>
      <text x="716" y={(toY(0) + toY(params.H)) / 2 + 16} fill="#5c6356" fontSize="11">
        {params.stoneBase > 0
          ? `${params.n}×${round1(r)}+${round1(stone)}`
          : `${params.n}×${round1(r)}`}
      </text>

      <text
        x={(toX(world.noses[0].x) + toX(world.xe)) / 2}
        y={toY(0) + 42}
        textAnchor="middle"
        fill="#1f241c"
        fontSize="12"
      >
        vannrett {round0(geo.horizontalSpan)} · diagonal A–F {round0(geo.diagonalAF)}
      </text>

      <text x="24" y="580" fill="#5c6356" fontSize="11">
        Endevange 48×198 · trinn 2×48×148 · sidekloss 48×73×200 · 8 mm luft
      </text>
      <text x="24" y="598" fill="#5c6356" fontSize="11">
        Rekkverk høyre side, 900 over nese · pæler Ø76 klasse A (ikke støp)
      </text>
      <text x="24" y="616" fill="#5c6356" fontSize="11">
        Målt: høyde 2110 · diagonal 4015 · beregnet {round0(geo.diagonalAF)}
      </text>
    </svg>
  );
}

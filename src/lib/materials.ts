import type { StairGeometry } from "./geometry";
import { round0 } from "./geometry";
import {
  BLOCK_MITER_DEG,
  blockDimsForStep,
  blockLengthForStep,
} from "./blocks";

export type CutItem = {
  part: string;
  dim: string;
  qty: number;
  lengthMm: number;
  note?: string;
  impregnation: "AB" | "A" | "—";
};

export type ShopItem = {
  item: string;
  qty: string;
  where?: string;
  note?: string;
};

export const SITE = {
  place: "Hage",
  widthOuter: 1276,
  widthInner: 1180,
  treadWidth: 1164,
  gap: 8,
  railHeight: 900,
  stockStringer: 3890,
  stores: [
    "Maxbo",
    "Montér",
    "Byggmax",
    "Byggmakker",
  ],
};

export function buildCutList(geo: StairGeometry): CutItem[] {
  const { params, NT, stringerLength, world } = geo;
  const stringer = round0(stringerLength);
  const treads = NT;
  const blocks = NT * 2;
  const handrail = world.handrailLength;
  const stoneNote =
    params.stoneBase > 0
      ? `Steinblokk/helle ${round0(params.stoneBase)} mm som første opptrinn`
      : undefined;

  const treadDepth = params.d;
  const rearDim = treadDepth >= 300 ? "48×148" : "48×98";
  const rearNote =
    treadDepth >= 300
      ? "2 × 48×148 = 300 dybde med 4 mm fuge"
      : `48×148 + 48×98 = ${treadDepth} dybde (passer 48×198 ved ${round0(geo.angleDeg)}°)`;

  const items: CutItem[] = [
    {
      part: "Endevange",
      dim: "48×198",
      qty: 2,
      lengthMm: stringer,
      impregnation: "AB",
      note:
        stringer > SITE.stockStringer
          ? `Krever planke ≥ ${Math.ceil(stringer / 100) * 100} mm (korteste på lager ${SITE.stockStringer})`
          : `Passer 3,89 m-planke (margin ${SITE.stockStringer - stringer} mm)`,
    },
    {
      part: "Trinnbord fremre",
      dim: "48×148",
      qty: treads,
      lengthMm: SITE.treadWidth,
      impregnation: "AB",
    },
    {
      part: "Trinnbord bakre",
      dim: rearDim,
      qty: treads,
      lengthMm: SITE.treadWidth,
      impregnation: "AB",
      note: rearNote,
    },
    {
      part: "Sidekloss",
      dim: "48×73",
      qty: blocks,
      lengthMm: blockLengthForStep(geo, 0),
      impregnation: "AB",
      note: (() => {
        const b = blockDimsForStep(geo, 0);
        return `Kapp ferdig før montering: topp ${Math.round(b.topMm)} / bunn ${Math.round(b.bottomMm)}, bak ${BLOCK_MITER_DEG}° oppe. Forside ved nese, vater på topp, skru.`;
      })(),
    },
    {
      part: "Stolpe 1 og 3 (rekkverk + pæl)",
      dim: "Ø76 klasse A",
      qty: 2,
      lengthMm: 1740,
      impregnation: "A",
    },
    {
      part: "Stolpe 2 (kun rekkverk)",
      dim: "Ø76",
      qty: 1,
      lengthMm: 1073,
      impregnation: "AB",
      note: "Kappes, ikke i bakken",
    },
    {
      part: "Venstre pæler",
      dim: "Ø76 klasse A",
      qty: 2,
      lengthMm: 1000,
      impregnation: "A",
      note: "Avsluttes i flukt med vangens overkant",
    },
    {
      part: "Håndlist",
      dim: "48×148",
      qty: 1,
      lengthMm: handrail,
      impregnation: "AB",
      note: "Rundet overside, ca. 300 forbi første og siste nese",
    },
    {
      part: "Lekt under håndlist",
      dim: "48×48",
      qty: 1,
      lengthMm: handrail,
      impregnation: "AB",
    },
  ];

  if (stoneNote) {
    items.unshift({
      part: "Nederste opptrinn (stein)",
      dim: "helle/stein",
      qty: 1,
      lengthMm: round0(params.stoneBase),
      impregnation: "—",
      note: stoneNote + " – bruk eksisterende heller, ikke kjøp nye",
    });
  }

  return items;
}

export function buildShopList(geo: StairGeometry): ShopItem[] {
  const stringer = round0(geo.stringerLength);
  const needLong = stringer > SITE.stockStringer;
  const treads = geo.NT;

  return [
    {
      item: needLong
        ? stringer > 4200
          ? `Vangeplanke 48×198 CU-imp C24, 4,8 m`
          : `Vangeplanke 48×198 CU-imp C24, 4,2 m eller 4,8 m`
        : `Vangeplanke 48×198 CU-imp C24, 3,89 m`,
      qty: "2 stk",
      where: "Bergene Holm / Maxbo",
      note: needLong
        ? `Kapp til ${stringer} mm – den korte 3,89 m er for kort`
        : `Kapp til ${stringer} mm`,
    },
    {
      item: "Trinnbord 48×148 AB (fremre)",
      qty: `${treads} × ${SITE.treadWidth} mm (kjøp med margin)`,
      where: "Maxbo",
    },
    {
      item:
        geo.params.d >= 300
          ? "Trinnbord 48×148 AB (bakre)"
          : "Trinnbord 48×98 AB (bakre)",
      qty: `${treads} × ${SITE.treadWidth} mm (kjøp med margin)`,
      where: "Maxbo",
      note:
        geo.params.d >= 300
          ? "Samme dimensjon som fremre — totalt 300 dybde"
          : `Smalere bakre bord — totalt ${geo.params.d} dybde (plass i vangen ved 33,4°)`,
    },
    {
      item: "Sideklossemateriale 48×73 eller 48×98 (kappes)",
      qty: `${treads * 2} × ca. ${geo.params.KL} mm (topp)`,
      where: "Maxbo",
      note: `Kapp bak ${BLOCK_MITER_DEG}° — topp ${geo.params.KL} mm, bunn ca. ${geo.params.KL - 48} mm`,
    },
    {
      item: "Runde gjerdestolper Ø76, 1,74 m, klasse A",
      qty: "5 stk",
      where: "Maxbo",
      note: "2 rekkverk+pæl, 1 mellomstolpe, 2 venstre pæler",
    },
    {
      item: "Håndlist 48×148 + lekt 48×48",
      qty: `ca. ${geo.world.handrailLength} mm`,
      where: "Maxbo",
    },
    {
      item: "Terrasseskrue A4 5×90",
      qty: "1 eske",
      note: "2 per bordende, forbor",
    },
    {
      item: "Treskrue A4 5×100 (eller konstruksjon 6×100)",
      qty: "1 eske",
      note: "4 per sidekloss fra utsiden gjennom vangen",
    },
    {
      item: "Treskrue A4 6×140",
      qty: "1 eske",
      note: "Håndlist og lekt",
    },
    {
      item: "Låseskrue M10×140 varmforsinket + stor skive + mutter",
      qty: "8–10 stk",
      where: "Montér 2-pk / Byggmakker ESSVE / Maxbo 160 mm kappes",
      note: "Ikke elforsinket. Hode på innsiden av vangen.",
    },
    {
      item: "Pukk til stamp rundt pæler",
      qty: "etter behov",
    },
  ];
}

export const ASSEMBLY_STEPS = [
  "Lag trekantmal (277 × 182). Merk neser langs overkant: første u 212, deretter hver 332 mm.",
  "Kapp klosser ferdige: topp 244 / bunn 196, bak 45° (lang flate oppe).",
  "Ved hver nese: forside av kloss ved nesa, vater på toppen, skru fra utsiden (4× A4 5×100). Prøv ett trinn — nesa 5 mm under overkant.",
  "Kapp og prøv én vange (fot nederst, vannrett ende øverst i toppflatehøyde). Bruk den som mal for den andre.",
  "Sett foten på hellen, vannrett topp mot stampet pukk/stein. Vangene 1180 fra hverandre, like diagonaler.",
  "Pæler ved stolpe 1 og 3 (+ venstre). Bolt 2× M10 hver.",
  "Legg trinn (8 mm luft, forbor). Stolpe 2 og håndlist. Olje kappflater.",
];

export const DECISIONS = [
  "Lukkede endevanger (ikke sagtann), ingen midtvange",
  "13 tre-opptrinn — kjøp 4,8 m vange, ikke steinblokk nederst",
  "Vange 48×198, trinn 48×148 + 48×98 (dybde 250), 8 mm luft mot vange",
  "Sidekloss topp 244 / bunn 196 mm, bak 45° (lang flate oppe) for støtte til bakbord",
  "Fot vannrett nederst; topp vannrett kapp i toppflatehøyde (rett over øverste trinn, ingen fuglenebb)",
  "Pæler Ø76 klasse A i stedet for støp/nye heller",
  "Rekkverk kun høyre side (sett oppover)",
  "Impregnering: AB over mark, A i jordkontakt",
];

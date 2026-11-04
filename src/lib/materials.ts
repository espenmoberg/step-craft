import type { StairGeometry } from "./geometry";
import { round0 } from "./geometry";
import { STANDARD_BLOCK_MM, blockLengthForStep } from "./blocks";

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
      dim: "48×148",
      qty: treads,
      lengthMm: SITE.treadWidth,
      impregnation: "AB",
      note: "2 × 48×148 = 300 dybde med 4 mm fuge",
    },
    {
      part: "Sidekloss",
      dim: "48×73",
      qty: Math.max(0, blocks - 2),
      lengthMm: STANDARD_BLOCK_MM,
      impregnation: "AB",
      note: "Flatt, 48 høy, fra nesa og bakover",
    },
    {
      part: "Sidekloss øverst (forkortet)",
      dim: "48×73",
      qty: 2,
      lengthMm: blockLengthForStep(geo, geo.NT - 1),
      impregnation: "AB",
      note: `Stopper før setekapp (H). Ikke ${STANDARD_BLOCK_MM} mm.`,
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
        ? `Vangeplanke 48×198 CU-imp C24, 4,2 m eller 4,8 m`
        : `Vangeplanke 48×198 CU-imp C24, 3,89 m`,
      qty: "2 stk",
      where: "Bergene Holm / Maxbo",
      note: needLong
        ? `Kapp til ${stringer} mm – den korte 3,89 m er for kort`
        : `Kapp til ${stringer} mm`,
    },
    {
      item: "Trinnbord 48×148 AB",
      qty: `${treads * 2} × ${SITE.treadWidth} mm (kjøp med margin)`,
      where: "Maxbo",
    },
    {
      item: "Sideklossemateriale 48×73 eller 48×98 (kappes)",
      qty: `${treads * 2} × ${geo.params.KL} mm`,
      where: "Maxbo",
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
  "Kontroller høyde, diagonal A–F og vannrett span mot mål på stedet.",
  "Lag mal: rettvinklet trekant inntrinn × opptrinn (hypotenus = steg langs vange).",
  "Kapp og prøv én vange (fot, sete, hjørner med stikksag/håndsirkelsag). Bruk den som mal for den andre.",
  "Skru sideklosser fra utsiden gjennom vangen (A4 5×100, 4 per kloss).",
  "Sett foten på hellen, setet på stampet pukk eller flat stein. Vangene 1180 fra hverandre, like diagonaler.",
  "Grav og sett pæler rett utenfor vangene ved stolpe 1 og 3 (og venstre side). Bolt med 2× M10 låseskruer hver.",
  "Legg trinn med 8 mm luft mot vange. Forbor. Valgfritt: Ø6–8 drenhull over hver kloss.",
  "Monter stolpe 2 og håndlist (900 loddrett over nesene). Olje alle kappflater.",
];

export const DECISIONS = [
  "Lukkede endevanger (ikke sagtann), ingen midtvange",
  "Vange 48×198, trinn 2×48×148 (dybde 300), 8 mm luft mot vange",
  "Fot og sete vannrett kappet – vekt går rett ned",
  "Pæler Ø76 klasse A i stedet for støp/nye heller",
  "Rekkverk kun høyre side (sett oppover)",
  "Impregnering: AB over mark, A i jordkontakt",
];

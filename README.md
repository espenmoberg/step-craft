# Utetrapp (Nesøya)

Planleggingsverktøy for ny utetrapp med lukkede endevanger i hagen på Nesøya, Asker.

Appen tar utgangspunkt i overføringen fra tidligere arbeid: mål på stedet (høyde 2110 mm, diagonal A–F 4015 mm), åpen beslutning om vangelengde, og full geometri/kappliste.

## Kjør lokalt

```bash
npm install
npm run dev -- -p 3847
```

Åpne [http://localhost:3847](http://localhost:3847).

## Hva appen gjør

1. **Velg vangeløsning**
   - **A:** 13 tre-opptrinn — kjøp lengre vangeplanke (4,2/4,8 m)
   - **B:** Steinblokk som første opptrinn — beholde 3,89 m-planken
2. Genererer **sidetegning**, **vangetegning med kappmål**, **kappliste**, **innkjøpsliste** og **monteringsrekkefølge**
3. Husker valget i `localStorage`

## Geometri

Kilde: `docs/trappegeometri.py` (også portet til `src/lib/geometry.ts`).

```bash
python3 docs/trappegeometri.py
```

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui.

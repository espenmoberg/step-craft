# Utetrapp

Planleggingsverktøy for ny utetrapp med lukkede endevanger.

Appen tar utgangspunkt i målt stigning **33,4°** og **3800 mm** fra punkt B til nese på øverste trinn → **13 opptrinn**, inntrinn 277 mm, trinndybde 250 mm (148+98), vange ca. 4,16 m (kjøp 4,2/4,8 m), og full geometri/kappliste.

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://localhost:3847](http://localhost:3847).

## Deploy på GitHub Pages (telefon / deling)

Appen bygges som statiske filer (`output: "export"`).

1. Opprett et GitHub-repo og push `main` dit (f.eks. via **Create repo** i Cursor, eller speil dette prosjektet til GitHub).
2. I repoet: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push til `main` (eller kjør workflowen manuelt under **Actions**).
4. Etter et par minutter: `https://<brukernavn>.github.io/<repo>/`

Workflow: `.github/workflows/pages.yml`.

## Hva appen gjør

1. Viser geometri for **13 tre-opptrinn** (lengre vangeplanke 4,2/4,8 m)
2. Genererer **sidetegning**, **vangetegning med kappmål**, **kappliste**, **innkjøpsliste** og **monteringsrekkefølge**

## Geometri

Kilde: `docs/trappegeometri.py` (også portet til `src/lib/geometry.ts`).

```bash
python3 docs/trappegeometri.py
```

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui.

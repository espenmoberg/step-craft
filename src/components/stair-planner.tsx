"use client";

import { useEffect, useMemo, useState } from "react";
import {
  OPTION_LONG_STRINGER,
  OPTION_STONE_BASE,
  STOCK_STRINGER_MM,
  computeGeometry,
  fitsStock,
  round0,
  round1,
  shortfall,
  type StairParams,
} from "@/lib/geometry";
import {
  ASSEMBLY_STEPS,
  DECISIONS,
  SITE,
  buildCutList,
  buildShopList,
} from "@/lib/materials";
import { SideDrawing } from "@/components/side-drawing";
import { StringerDrawing } from "@/components/stringer-drawing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Choice = "long" | "stone" | null;

const STORAGE_KEY = "utetrapp-valg";

export function StairPlanner() {
  const [choice, setChoice] = useState<Choice>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Choice | null;
    if (saved === "long" || saved === "stone") setChoice(saved);
    setHydrated(true);
  }, []);

  const params: StairParams = useMemo(() => {
    if (choice === "stone") return OPTION_STONE_BASE;
    return OPTION_LONG_STRINGER;
  }, [choice]);

  const geo = useMemo(() => computeGeometry(params), [params]);
  const cutList = useMemo(() => buildCutList(geo), [geo]);
  const shopList = useMemo(() => buildShopList(geo), [geo]);
  const okStock = fitsStock(geo.stringerLength);
  const missing = shortfall(geo.stringerLength);

  function select(next: Choice) {
    setChoice(next);
    if (next) window.localStorage.setItem(STORAGE_KEY, next);
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  const longGeo = useMemo(() => computeGeometry(OPTION_LONG_STRINGER), []);
  const stoneGeo = useMemo(() => computeGeometry(OPTION_STONE_BASE), []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-moss">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8dfc8] via-[#d5c7a8] to-[#b9c4a8] opacity-90" />
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-cedar/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-[22rem] w-[22rem] rounded-full bg-forest/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] bg-[length:48px_48px] bg-[linear-gradient(to_right,rgba(40,32,20,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,32,20,0.2)_1px,transparent_1px)]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-5 pb-2 pt-8 sm:px-8 sm:pt-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-forest/70">
            Utendørs · lukkede endevanger
          </p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-forest sm:text-7xl">
            Utetrapp
          </h1>
          <p className="mt-3 max-w-xl text-base text-forest/80 sm:text-lg">
            Plan, tegninger og kappliste for ny utetrapp med lukkede endevanger.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-xs text-forest/60">mål på stedet</p>
          <p className="font-mono text-sm text-forest">H 2110 · diag. 4015</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        {/* Decision */}
        <section className="animate-rise rounded-2xl border border-forest/15 bg-cream/80 p-5 shadow-[0_20px_60px_-40px_rgba(30,40,25,0.55)] backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl text-forest sm:text-3xl">
              Velg vangeløsning
            </h2>
            {!choice && hydrated && (
              <Badge className="bg-amber text-ink hover:bg-amber">
                Åpen beslutning
              </Badge>
            )}
            {choice && (
              <Badge variant="secondary" className="bg-forest text-cream">
                Valgt: {choice === "long" ? "lengre planke" : "steinblokk nederst"}
              </Badge>
            )}
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-forest/75 sm:text-base">
            13 opptrinn passer høyde og diagonal, men vangen blir ca.{" "}
            {round0(longGeo.stringerLength)} mm — den korteste innkjøpte planken er{" "}
            {STOCK_STRINGER_MM} mm. Skjøting frarådes. Velg én vei; tegninger og
            lister oppdateres med en gang.
          </p>

          <RadioGroup
            value={choice ?? ""}
            onValueChange={(v) => select(v as Choice)}
            className="grid gap-4 md:grid-cols-2"
          >
            <label
              htmlFor="opt-long"
              className={`group cursor-pointer rounded-xl border p-5 transition duration-300 ${
                choice === "long"
                  ? "border-forest bg-forest text-cream shadow-lg"
                  : "border-forest/20 bg-cream/60 hover:border-forest/40"
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                <RadioGroupItem value="long" id="opt-long" className="mt-1" />
                <div>
                  <Label
                    htmlFor="opt-long"
                    className={`font-display text-xl ${choice === "long" ? "text-cream" : "text-forest"}`}
                  >
                    A · Kjøp lengre vange
                  </Label>
                  <p
                    className={`mt-1 text-sm ${choice === "long" ? "text-cream/80" : "text-forest/70"}`}
                  >
                    13 tre-opptrinn à {round1(longGeo.r)} mm. Best match mot målt
                    diagonal. Bytt 3,89 m-planken til 4,2 eller 4,8 m.
                  </p>
                </div>
              </div>
              <dl
                className={`mt-4 grid grid-cols-2 gap-2 font-mono text-xs ${choice === "long" ? "text-cream/85" : "text-forest/75"}`}
              >
                <div>
                  <dt>Vange</dt>
                  <dd className="text-sm font-semibold">
                    {round0(longGeo.stringerLength)} mm
                  </dd>
                </div>
                <div>
                  <dt>Mangler på lager</dt>
                  <dd className="text-sm font-semibold">
                    +{round0(shortfall(longGeo.stringerLength))} mm
                  </dd>
                </div>
                <div>
                  <dt>Stigning</dt>
                  <dd>{round1(longGeo.angleDeg)}° · formel {round0(longGeo.formula)}</dd>
                </div>
                <div>
                  <dt>Trinnbord</dt>
                  <dd>12 × 2 × 48×148</dd>
                </div>
              </dl>
            </label>

            <label
              htmlFor="opt-stone"
              className={`group cursor-pointer rounded-xl border p-5 transition duration-300 ${
                choice === "stone"
                  ? "border-forest bg-forest text-cream shadow-lg"
                  : "border-forest/20 bg-cream/60 hover:border-forest/40"
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                <RadioGroupItem value="stone" id="opt-stone" className="mt-1" />
                <div>
                  <Label
                    htmlFor="opt-stone"
                    className={`font-display text-xl ${choice === "stone" ? "text-cream" : "text-forest"}`}
                  >
                    B · Steinblokk nederst
                  </Label>
                  <p
                    className={`mt-1 text-sm ${choice === "stone" ? "text-cream/80" : "text-forest/70"}`}
                  >
                    Første opptrinn ({round1(OPTION_STONE_BASE.stoneBase)} mm) som
                    helle/stein på gangveien. Tretrappa starter der — vange passer
                    3,89 m.
                  </p>
                </div>
              </div>
              <dl
                className={`mt-4 grid grid-cols-2 gap-2 font-mono text-xs ${choice === "stone" ? "text-cream/85" : "text-forest/75"}`}
              >
                <div>
                  <dt>Vange</dt>
                  <dd className="text-sm font-semibold">
                    {round0(stoneGeo.stringerLength)} mm
                  </dd>
                </div>
                <div>
                  <dt>Margin på lager</dt>
                  <dd className="text-sm font-semibold">
                    {STOCK_STRINGER_MM - round0(stoneGeo.stringerLength)} mm
                  </dd>
                </div>
                <div>
                  <dt>Stigning</dt>
                  <dd>
                    {round1(stoneGeo.angleDeg)}° · formel {round0(stoneGeo.formula)}
                  </dd>
                </div>
                <div>
                  <dt>Trinnbord</dt>
                  <dd>11 × 2 × 48×148</dd>
                </div>
              </dl>
            </label>
          </RadioGroup>

          {choice && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => select(null)}
                className="border-forest/30 text-forest"
              >
                Nullstill valg
              </Button>
              <p className="font-mono text-xs text-forest/60">
                {okStock
                  ? `Vange ${round0(geo.stringerLength)} mm passer lagerplanken`
                  : `Vange ${round0(geo.stringerLength)} mm — mangler ${round0(missing)} mm på 3,89 m`}
              </p>
            </div>
          )}
        </section>

        {/* Summary metrics */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Opptrinn", value: `${params.n} × ${round1(geo.r)}` },
            { label: "Inntrinn", value: `${geo.NT} × ${params.g}` },
            { label: "Trappeformel", value: `${round0(geo.formula)}` },
            { label: "Vangelengde", value: `${round0(geo.stringerLength)}` },
          ].map((m, i) => (
            <div
              key={m.label}
              className="animate-rise rounded-xl border border-forest/10 bg-cream/70 px-4 py-3 backdrop-blur-sm"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-forest/55">
                {m.label}
              </p>
              <p className="font-display text-2xl text-forest">{m.value}</p>
            </div>
          ))}
        </section>

        <Tabs defaultValue="tegninger" className="w-full">
          <TabsList className="mb-4 h-auto flex-wrap bg-forest/10 p-1">
            <TabsTrigger value="tegninger">Tegninger</TabsTrigger>
            <TabsTrigger value="kappliste">Kappliste</TabsTrigger>
            <TabsTrigger value="innkjop">Innkjøp</TabsTrigger>
            <TabsTrigger value="montering">Montering</TabsTrigger>
            <TabsTrigger value="beslutninger">Beslutninger</TabsTrigger>
          </TabsList>

          <TabsContent value="tegninger" className="space-y-4">
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl text-forest">
                  Sidetegning
                </CardTitle>
                <CardDescription>
                  Oppdatert for valgt løsning. Mål i mm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white">
                  <SideDrawing geo={geo} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl text-forest">
                  Vangetegning
                </CardTitle>
                <CardDescription>
                  Kappunkter A–E og trinnesemerker fra rett ende.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white">
                  <StringerDrawing geo={geo} />
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-left font-mono text-xs text-forest">
                    <thead>
                      <tr className="border-b border-forest/15 text-forest/60">
                        <th className="py-2 pr-3">Pkt</th>
                        <th className="py-2 pr-3">u</th>
                        <th className="py-2">v</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["A", "B", "C", "H", "G", "F", "E"] as const).map((k) => (
                        <tr key={k} className="border-b border-forest/8">
                          <td className="py-1.5 pr-3 font-semibold">{k}</td>
                          <td className="py-1.5 pr-3">{round0(geo.points[k].u)}</td>
                          <td className="py-1.5">{round0(geo.points[k].v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 font-mono text-xs text-forest/65">
                  Neser: {geo.noses.map(round0).join(", ")}
                </p>
                <p className="mt-1 font-mono text-xs text-forest/65">
                  Stolpesenter (u): {geo.world.posts.map(round0).join(", ")} ·
                  håndlist ca. {geo.world.handrailLength} mm
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kappliste">
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader>
                <CardTitle className="font-display text-xl text-forest">
                  Kappliste
                </CardTitle>
                <CardDescription>
                  Bredde utvendig {SITE.widthOuter}, mellom vanger {SITE.widthInner},
                  trinn {SITE.treadWidth} (8 mm luft).
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-forest/20 font-mono text-[11px] uppercase tracking-wide text-forest/55">
                      <th className="py-2 pr-3">Del</th>
                      <th className="py-2 pr-3">Dim</th>
                      <th className="py-2 pr-3">Ant</th>
                      <th className="py-2 pr-3">Lengde</th>
                      <th className="py-2 pr-3">Imp</th>
                      <th className="py-2">Merknad</th>
                    </tr>
                  </thead>
                  <tbody className="text-forest">
                    {cutList.map((row) => (
                      <tr key={row.part} className="border-b border-forest/10">
                        <td className="py-2.5 pr-3 font-medium">{row.part}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">{row.dim}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">{row.qty}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {row.lengthMm}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {row.impregnation}
                        </td>
                        <td className="py-2.5 text-xs text-forest/70">
                          {row.note ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innkjop">
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader>
                <CardTitle className="font-display text-xl text-forest">
                  Innkjøpsliste
                </CardTitle>
                <CardDescription>
                  Butikker: {SITE.stores.join(" · ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {shopList.map((item) => (
                  <div
                    key={item.item}
                    className="rounded-lg border border-forest/10 bg-white/50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-forest">{item.item}</p>
                      <p className="font-mono text-xs text-forest/70">{item.qty}</p>
                    </div>
                    {(item.where || item.note) && (
                      <p className="mt-1 text-xs text-forest/60">
                        {[item.where, item.note].filter(Boolean).join(" — ")}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="montering">
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader>
                <CardTitle className="font-display text-xl text-forest">
                  Montering
                </CardTitle>
                <CardDescription>
                  Kort rekkefølge. Vangekapp (fot, sete, hjørner) tas med stikksag /
                  håndsirkelsag — ikke kappsag.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {ASSEMBLY_STEPS.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-sm text-cedar">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-forest/85">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beslutninger">
            <Card className="border-forest/15 bg-cream/90">
              <CardHeader>
                <CardTitle className="font-display text-xl text-forest">
                  Beslutninger som er tatt
                </CardTitle>
                <CardDescription>
                  Fra overføringen. Ferdigvanger forkastet (for korte).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DECISIONS.map((d) => (
                  <div
                    key={d}
                    className="flex gap-3 border-b border-forest/10 py-2 text-sm text-forest/85"
                  >
                    <span className="text-cedar">▸</span>
                    <span>{d}</span>
                  </div>
                ))}
                <Separator className="my-4 bg-forest/10" />
                <p className="text-sm text-forest/70">
                  Festemidler: terrasseskrue A4 5×90 i trinn, A4 5×100 i klosser,
                  A4 6×140 i håndlist, låseskrue M10×140 VF for stolper/pæler (hode
                  på innsiden). Ikke elforsinket.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-12 pt-4 text-xs text-forest/50 sm:px-8">
        Alle mål i mm. Geometri fra trappegeometri.py.
      </footer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  DEFAULT_PARAMS,
  STOCK_STRINGER_MM,
  computeGeometry,
  round0,
  round1,
  shortfall,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StairPlanner() {
  const params = DEFAULT_PARAMS;
  const geo = useMemo(() => computeGeometry(params), []);
  const cutList = useMemo(() => buildCutList(geo), [geo]);
  const shopList = useMemo(() => buildShopList(geo), [geo]);
  const missing = shortfall(geo.stringerLength);

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
          <p className="font-mono text-sm text-forest">33,4° · B→nese 3800</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        <section className="animate-rise rounded-2xl border border-forest/15 bg-cream/80 p-5 shadow-[0_20px_60px_-40px_rgba(30,40,25,0.55)] backdrop-blur-sm sm:p-8">
          <h2 className="font-display text-2xl text-forest sm:text-3xl">
            Vangeløsning
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-forest/75 sm:text-base">
            33,4° og 3800 mm fra punkt B til øverste nese → 13 opptrinn à{" "}
            {round1(geo.r)} / inntrinn {params.g}, trinndybde {params.d}{" "}
            (148+98). Vange {round0(geo.stringerLength)} mm — kjøp 4,2 eller 4,8
            m (lagerplanken {STOCK_STRINGER_MM} mm er {round0(missing)} mm for
            kort). Skjøting frarådes.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs text-forest/75 sm:grid-cols-4">
            <div>
              <dt>Vange</dt>
              <dd className="text-sm font-semibold text-forest">
                {round0(geo.stringerLength)} mm
              </dd>
            </div>
            <div>
              <dt>Mangler på 3,89 m</dt>
              <dd className="text-sm font-semibold text-forest">
                +{round0(missing)} mm
              </dd>
            </div>
            <div>
              <dt>Stigning</dt>
              <dd className="text-sm text-forest">
                {round1(geo.angleDeg)}° · formel {round0(geo.formula)}
              </dd>
            </div>
            <div>
              <dt>Trinnbord</dt>
              <dd className="text-sm text-forest">12 × (148+98)</dd>
            </div>
          </dl>
        </section>

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
                <CardDescription>Mål i mm.</CardDescription>
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
                      {(["A", "B", "C", "H", "G", "F", "E"] as const).map(
                        (k) => (
                          <tr key={k} className="border-b border-forest/8">
                            <td className="py-1.5 pr-3 font-semibold">{k}</td>
                            <td className="py-1.5 pr-3">
                              {round0(geo.points[k].u)}
                            </td>
                            <td className="py-1.5">
                              {round0(geo.points[k].v)}
                            </td>
                          </tr>
                        )
                      )}
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
                  Bredde utvendig {SITE.widthOuter}, mellom vanger{" "}
                  {SITE.widthInner}, trinn {SITE.treadWidth} (8 mm luft).
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
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {row.dim}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {row.qty}
                        </td>
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
                      <p className="font-mono text-xs text-forest/70">
                        {item.qty}
                      </p>
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
                  Kort rekkefølge. Vangekapp (fot, sete, hjørner) tas med
                  stikksag / håndsirkelsag — ikke kappsag.
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
                  A4 6×140 i håndlist, låseskrue M10×140 VF for stolper/pæler
                  (hode på innsiden). Ikke elforsinket.
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

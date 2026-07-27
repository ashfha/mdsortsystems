import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  BadgeCheck,
  BarChart3,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Compass,
  Heart,
  Hotel,
  MapPin,
  MoonStar,
  Plane,
  Search,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchLiveWeather } from "@/lib/live-weather";
import {
  destinationKey,
  formatEuro,
  monthLabel,
  recommendDestinations,
  worldDestinations,
  type Region,
  type TravelBundle,
  type TravelRecommendation,
} from "@/lib/globalTravel";

type SavedItem = { key: string; rec: TravelRecommendation };

const PRESETS = [
  "Warm beach week, max 2200€, from Stuttgart, no party",
  "City + food + nightlife for 4 days, under 1200€",
  "Long-haul luxury honeymoon, 10 days, from Frankfurt",
  "Nature trip with hiking and good hotels, flexible timing",
  "Winter sun, relaxed, good value, from Germany",
  "Family holiday with easy flights and calm hotels",
];

const BUDGETS = [
  { label: "bis 800€", value: 800 },
  { label: "800–1500€", value: 1500 },
  { label: "1500–2500€", value: 2500 },
  { label: "2500–5000€", value: 5000 },
  { label: "5000€+", value: 9000 },
];

const REGIONS: Array<{ label: string; value: Region | "All" }> = [
  { label: "All", value: "All" },
  { label: "Europe", value: "Europe" },
  { label: "Middle East", value: "Middle East" },
  { label: "Africa", value: "Africa" },
  { label: "Asia", value: "Asia" },
  { label: "Americas", value: "Americas" },
  { label: "Oceania", value: "Oceania" },
];

const SCENES: Record<Region, string[]> = {
  Europe: [
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
  ],
  "Middle East": [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
  ],
  Africa: [
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80",
  ],
  Asia: [
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80",
  ],
  Americas: [
    "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=80",
  ],
  Oceania: [
    "https://images.unsplash.com/photo-1506973035872-a4f23e90f596?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1500043357865-c6b8827edf78?auto=format&fit=crop&w=1400&q=80",
  ],
};

const AIRPORTS: Record<string, { lat: number; lng: number; label: string }> = {
  stuttgart: { lat: 48.69, lng: 9.22, label: "Stuttgart" },
  str: { lat: 48.69, lng: 9.22, label: "Stuttgart" },
  frankfurt: { lat: 50.05, lng: 8.57, label: "Frankfurt" },
  fra: { lat: 50.05, lng: 8.57, label: "Frankfurt" },
  munich: { lat: 48.35, lng: 11.79, label: "Munich" },
  muc: { lat: 48.35, lng: 11.79, label: "Munich" },
  berlin: { lat: 52.52, lng: 13.40, label: "Berlin" },
  ber: { lat: 52.52, lng: 13.40, label: "Berlin" },
  hamburg: { lat: 53.55, lng: 10.00, label: "Hamburg" },
  ham: { lat: 53.55, lng: 10.00, label: "Hamburg" },
  zurich: { lat: 47.45, lng: 8.56, label: "Zürich" },
  zrh: { lat: 47.45, lng: 8.56, label: "Zürich" },
  vienna: { lat: 48.21, lng: 16.37, label: "Vienna" },
  vie: { lat: 48.21, lng: 16.37, label: "Vienna" },
  london: { lat: 51.47, lng: -0.45, label: "London" },
  lhr: { lat: 51.47, lng: -0.45, label: "London" },
  paris: { lat: 49.01, lng: 2.55, label: "Paris" },
  amsterdam: { lat: 52.31, lng: 4.76, label: "Amsterdam" },
  madrid: { lat: 40.47, lng: -3.56, label: "Madrid" },
  rome: { lat: 41.80, lng: 12.25, label: "Rome" },
  newyork: { lat: 40.64, lng: -73.78, label: "New York" },
  nyc: { lat: 40.64, lng: -73.78, label: "New York" },
  losangeles: { lat: 33.94, lng: -118.40, label: "Los Angeles" },
  la: { lat: 33.94, lng: -118.40, label: "Los Angeles" },
  dubai: { lat: 25.25, lng: 55.37, label: "Dubai" },
  doha: { lat: 25.27, lng: 51.61, label: "Doha" },
  singapore: { lat: 1.36, lng: 103.99, label: "Singapore" },
};

export default function GlobalTravelPage() {
  const [prompt, setPrompt] = useState("Warm weather, good hotel, 7 days, from Stuttgart, max 2200€, no party");
  const [budgetCap, setBudgetCap] = useState(2200);
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [bundle, setBundle] = useState<TravelBundle>(() => recommendDestinations(`${prompt} max ${budgetCap}€`));
  const [selectedId, setSelectedId] = useState(bundle.recommendations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<SavedItem[]>(() => loadFavorites());
  const [history, setHistory] = useState<string[]>(() => loadHistory());

  const recommendations = useMemo(() => {
    const filtered = activeRegion === "All" ? bundle.recommendations : bundle.recommendations.filter((rec) => rec.region === activeRegion);
    return filtered.sort((a, b) => b.matchScore - a.matchScore);
  }, [bundle.recommendations, activeRegion]);

  const selected = recommendations.find((rec) => rec.id === selectedId) ?? recommendations[0];
  const selectedSaved = selected ? favorites.some((item) => item.key === destinationKey(selected.name, selected.country)) : false;

  useEffect(() => {
    const nextSelected = recommendations[0]?.id ?? "";
    if (!recommendations.some((r) => r.id === selectedId)) setSelectedId(nextSelected);
  }, [recommendations, selectedId]);

  async function runSearch(nextPrompt = prompt) {
    const applied = `${nextPrompt.trim()} max ${budgetCap}€`;
    setLoading(true);
    try {
      const next = recommendDestinations(applied);
      const hydrated = await Promise.all(next.recommendations.map(async (rec) => ({
        ...rec,
        weather: await liveWeather(rec),
      })));
      const nextBundle: TravelBundle = { parsed: next.parsed, recommendations: hydrated as TravelRecommendation[] };
      setBundle(nextBundle);
      setSelectedId(nextBundle.recommendations[0]?.id ?? "");
      saveHistory(applied);
      setHistory(loadHistory());
    } finally {
      setLoading(false);
    }
  }

  async function liveWeather(rec: TravelRecommendation) {
    try {
      const result = await fetchLiveWeather({
        destinationName: rec.name,
        country: rec.country,
        fallback: rec.weather,
      });
      return {
        period: result.period,
        highC: result.highC,
        lowC: result.lowC,
        rain: result.rain,
        summary: result.source === "live" ? result.summary : rec.weather.summary,
      };
    } catch {
      return rec.weather;
    }
  }

  function toggleFavorite(rec: TravelRecommendation) {
    const key = destinationKey(rec.name, rec.country);
    const exists = favorites.some((item) => item.key === key);
    const next = exists ? favorites.filter((item) => item.key !== key) : [{ key, rec }, ...favorites];
    setFavorites(next);
    writeFavorites(next);
    toast(exists ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt");
  }

  function flightSearchUrl(from: string, to: string) {
    return `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(from)}%20to%20${encodeURIComponent(to)}`;
  }

  function hotelUrl(destination: string, travelers = 2) {
    const url = new URL("https://www.booking.com/searchresults.html");
    url.searchParams.set("ss", destination);
    url.searchParams.set("group_adults", String(Math.max(1, travelers)));
    return url.toString();
  }

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: worldDestinations().length, Europe: 0, "Middle East": 0, Africa: 0, Asia: 0, Americas: 0, Oceania: 0 };
    for (const d of worldDestinations()) counts[d.region] += 1;
    return counts;
  }, []);

  const gallery = selected ? buildGallery(selected) : [];
  const origin = detectOrigin(bundle.parsed.departure);
  const duration = selected ? estimateFlightDuration(origin, selected.lat, selected.lng) : 0;
  const stops = selected ? estimateStops(origin, selected.lat, selected.lng) : 0;
  const cheapestFlight = selected ? Math.max(0, Math.round(selected.flightEur * 0.9)) : 0;
  const fastestFlight = selected ? Math.round(selected.flightEur * 1.1) : 0;
  const valueHotel = selected ? Math.max(50, Math.round(selected.hotelNightlyEur * 0.85)) : 0;
  const premiumHotel = selected ? Math.round(selected.hotelNightlyEur * 1.35) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant"><Compass className="h-5 w-5" /></span>
            <div>
              <div className="font-display text-lg font-semibold leading-none tracking-tight">TravelMatch</div>
              <div className="text-xs text-muted-foreground">Search-led travel planning</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="secondary" className="rounded-full px-3 py-2">{worldDestinations().length} Ziele weltweit</Badge>
            <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20">
        <section className="grid gap-8 pb-10 pt-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:pt-16">
          <div className="space-y-6 fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              KAYAK-/Booking-Style Search, aber mit persönlicherem Matching
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Finde dein Reiseziel.
              <br />
              Nicht nur irgendein Hotel.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Reiseideen mit echten Fotos, realistischeren Flugzeiten, Preisrahmen, Hoteloptionen und weltweiter Auswahl — ohne dass es nach KI-Demo aussieht.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, "Matching", "Wunschtext oder Stichpunkte reichen."],
                [Plane, "Weltweit", "Europa, Asien, Amerika, Afrika, Ozeanien."],
                [BarChart3, "Preisrahmen", "Budget filtert die Ergebnisse direkt."],
              ].map(([Icon, title, body]) => (
                <Card key={title as string} className="rounded-3xl p-5 shadow-soft">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></div>
                  <div className="font-display text-lg font-semibold">{title as string}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{body as string}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border-border/60 bg-card p-5 shadow-elegant md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Suche</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Wohin soll es gehen?</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Budget + Region</div>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none rounded-3xl border-border/70 bg-background/80 p-4 text-base shadow-none focus-visible:ring-2"
                placeholder="z. B. warm, 7 Tage, gutes Hotel, Essen, max. 2200€, ab Stuttgart"
              />

              <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preisrahmen</div>
                    <div className="mt-1 font-medium">Bis {formatEuro(budgetCap)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Direkt in die Suche übernommen</div>
                </div>
                <input
                  type="range"
                  min={600}
                  max={9000}
                  step={100}
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                />
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setBudgetCap(item.value)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {REGIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveRegion(item.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${activeRegion === item.value ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                  >
                    {item.label} {item.value === "All" ? `(${regionCounts.All})` : `(${regionCounts[item.value]})`}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => void runSearch()} disabled={loading}>
                  <Search className="h-4 w-4" />
                  Reisen finden
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setPrompt(PRESETS[0])}>
                  Beispiel laden
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-background/60 p-3">
                <MiniStat label="Treffer" value={recommendations.length.toString()} />
                <MiniStat label="Favoriten" value={favorites.length.toString()} />
                <MiniStat label="Region" value={activeRegion} />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-4 md:grid-cols-3">
          <InfoPanel icon={Compass} title="Du beschreibst die Reise" body="Stichpunkte, Budget und Abflugort reichen. Die Seite baut daraus automatisch Vorschläge." />
          <InfoPanel icon={Plane} title="Realistischere Flüge" body="Flugdauer und Preis werden aus Distanz und Region abgeleitet. Stuttgart → Mallorca landet also bei einer kurzen Strecke, nicht bei 13 Stunden." />
          <InfoPanel icon={Bookmark} title="Hotel-Optionen statt nur ein Treffer" body="Zu jedem Ziel gibt es mehrere Hotels und Flugvarianten mit passenden Preisstufen." />
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vorgeschlagene Ziele</p>
                <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Deine Shortlist</h2>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{bundle.parsed.month ? monthLabel(bundle.parsed.month) : "Flexible Zeit"}</Badge>
            </div>

            {loading && <Card className="rounded-3xl p-6 shadow-soft"><div className="flex items-center gap-3"><Search className="h-5 w-5 animate-pulse text-primary" /><div><div className="font-medium">Suche läuft</div><div className="text-sm text-muted-foreground">Vergleiche Ziele, Preise und Wetter…</div></div></div></Card>}

            <div className="grid gap-4">
              {recommendations.map((rec) => {
                const isFav = favorites.some((item) => item.key === destinationKey(rec.name, rec.country));
                return (
                  <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="text-left">
                    <Card className={`group overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:shadow-elegant ${selected?.id === rec.id ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card"}`}>
                      <div className="grid gap-4 p-4 sm:grid-cols-[190px_1fr]">
                        <div className="relative overflow-hidden rounded-2xl">
                          <img src={rec.image} alt={rec.name} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-full" />
                          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-soft backdrop-blur">{rec.region}</div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-display text-2xl font-semibold">{rec.name}</h3>
                              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{rec.tagline}</p>
                            </div>
                            <ScoreCircle score={rec.matchScore} />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full">{formatEuro(rec.estimatedTotalEur)} total</Badge>
                            <Badge variant="secondary" className="rounded-full">Value {rec.valueScore}/100</Badge>
                            <Badge variant="secondary" className="rounded-full">{rec.weather.highC}° / {rec.weather.lowC}°</Badge>
                            {isFav && <Badge variant="secondary" className="rounded-full"><Heart className="mr-1 h-3 w-3 fill-current" /> Gespeichert</Badge>}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {rec.reasons.slice(0, 2).map((reason) => (
                              <div key={reason} className="flex gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); toggleFavorite(rec); }}>
                              <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                              {isFav ? "Gespeichert" : "Speichern"}
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-2xl">
                              Mehr Details <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-elegant">
              {selected ? (
                <>
                  <div className="relative">
                    <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium"><MapPin className="h-3.5 w-3.5" /> {selected.country}</div>
                    <div className="absolute right-5 top-5 rounded-full bg-background/90 px-4 py-2 text-sm font-semibold">Match {selected.matchScore}</div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-display text-3xl font-semibold text-white">{selected.name}</h3>
                      <p className="mt-1 max-w-lg text-sm text-white/85">{selected.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatBox icon={Plane} label="Flug" value={formatEuro(selected.flightEur)} />
                      <StatBox icon={Hotel} label="Hotel / Nacht" value={formatEuro(selected.hotelNightlyEur)} />
                      <StatBox icon={CloudSun} label="Gesamt" value={formatEuro(selected.estimatedTotalEur)} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="overflow-hidden rounded-2xl border border-border/60 sm:col-span-2"><img src={gallery[0]} alt={selected.name} className="h-32 w-full object-cover" /></div>
                      <div className="overflow-hidden rounded-2xl border border-border/60"><img src={gallery[1]} alt={`${selected.region} scene`} className="h-32 w-full object-cover" /></div>
                      <div className="overflow-hidden rounded-2xl border border-border/60"><img src={gallery[2]} alt={`${selected.region} scene 2`} className="h-32 w-full object-cover" /></div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Warum passt es?</div>
                          <div className="mt-1 font-display text-xl font-semibold">Kurz erklärt</div>
                        </div>
                        <MoonStar className="h-5 w-5 text-accent" />
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {selected.reasons.map((reason) => <li key={reason} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></li>)}
                      </ul>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">Wetter für {selected.weather.period}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.weather.summary}. Etwa {selected.weather.highC}°C / {selected.weather.lowC}°C.</p>
                      </div>
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">Score Breakdown</div>
                        <div className="mt-3 space-y-2 text-sm">
                          <Metric label="Climate" value={selected.scoreBreakdown.climate} />
                          <Metric label="Vibe" value={selected.scoreBreakdown.vibe} />
                          <Metric label="Budget" value={selected.scoreBreakdown.budget} />
                          <Metric label="Ease" value={selected.scoreBreakdown.ease} />
                          <Metric label="Value" value={selected.scoreBreakdown.value} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Aktivitäten</h4>
                        <div className="mt-2 flex flex-wrap gap-2">{selected.activities.map((item) => <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>)}</div>
                      </div>
                      <div>
                        <h4 className="font-medium">Tipps</h4>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{selected.tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <ChoiceCard
                        title="Flug"
                        subtitle={`${origin.label} → ${selected.iata}`}
                        source={selected.region}
                        primary={formatEuro(selected.flightEur)}
                        detail={`${duration}h · ${stops} Stop(s)`}
                        extras={[`${formatEuro(cheapestFlight)} günstig`, `${formatEuro(fastestFlight)} schnell`, selected.matchScore > 80 ? "Top Match" : "Guter Deal"]}
                        actions={[
                          { label: "Flüge vergleichen", onClick: () => window.open(flightSearchUrl(origin.label, selected.iata), "_blank", "noopener,noreferrer") },
                          { label: "Buchen", onClick: () => window.open(flightSearchUrl(origin.label, selected.iata), "_blank", "noopener,noreferrer") },
                        ]}
                      />
                      <ChoiceCard
                        title="Hotel"
                        subtitle={selected.name}
                        source={selected.region}
                        primary={formatEuro(selected.hotelNightlyEur) + " / Nacht"}
                        detail={`ab ${formatEuro(valueHotel)} · premium ${formatEuro(premiumHotel)}`}
                        extras={[
                          `${selected.hotelNightlyEur}/Nacht ausgewogen`,
                          `${selected.valueScore}/100 Preis-Leistung`,
                          selected.region,
                        ]}
                        actions={[
                          { label: "Hotels ansehen", onClick: () => window.open(hotelUrl(selected.name, 2), "_blank", "noopener,noreferrer") },
                          { label: "Buchen", onClick: () => window.open(hotelUrl(selected.name, 2), "_blank", "noopener,noreferrer") },
                        ]}
                      />
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Speichern</div>
                          <div className="mt-1 font-display text-xl font-semibold">Merk dir dieses Ziel</div>
                        </div>
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="rounded-2xl" onClick={() => toggleFavorite(selected)}>
                          <Heart className={`h-4 w-4 ${selectedSaved ? "fill-current" : ""}`} />
                          {selectedSaved ? "Gespeichert" : "Favorit speichern"}
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => window.open(hotelUrl(selected.name, 2), "_blank", "noopener,noreferrer")}>Weitere Hotels</Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Starte eine Suche, um die Details zu sehen.</div>
              )}
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weltweit stöbern</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Alle Regionen</h2>
            </div>
            <div className="text-sm text-muted-foreground">{worldDestinations().length} Vorschläge</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {worldDestinations().map((dest) => (
              <button key={dest.id} onClick={() => setSelectedId(dest.id)} className="text-left">
                <Card className="overflow-hidden rounded-[1.75rem] border-border/70 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
                  <img src={dest.image} alt={dest.name} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-xl font-semibold">{dest.name}</div>
                        <div className="text-sm text-muted-foreground">{dest.country}</div>
                      </div>
                      <Badge variant="secondary" className="rounded-full">{dest.region}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">{dest.tagline}</div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Zuletzt gesucht</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Verlauf</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {history.length ? history.map((item) => (
              <button key={item} onClick={() => { setPrompt(item.replace(/ max \d+€/i, "")); void runSearch(item.replace(/ max \d+€/i, "")); }} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                {item}
              </button>
            )) : <div className="text-sm text-muted-foreground">Deine letzten Suchen erscheinen hier.</div>}
          </div>
        </section>

        <section className="pt-8">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weniger KI, mehr Reisegefühl</p>
                <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Klare Suche, echte Bilder, sinnvolle Preisstufen.</h2>
                <p className="mt-3 text-muted-foreground">Das Layout ist bewusst ruhiger gehalten und orientiert sich an der Logik von großen Reise-Suchseiten: kräftige Suche, Filter, Karten, echte Fotos und direkte Buchungswege.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => void runSearch()} className="rounded-2xl"><Zap className="h-4 w-4" />Suche neu laden</Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Nach oben</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ChoiceCard({ title, subtitle, source, primary, detail, extras, actions }: { title: string; subtitle: string; source: string; primary: string; detail: string; extras: string[]; actions: Array<{ label: string; onClick: () => void }> }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
          <div className="mt-1 font-medium">{subtitle}</div>
        </div>
        <Badge variant="secondary" className="rounded-full">{source}</Badge>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{primary}</div>
      <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
      <div className="mt-3 flex flex-wrap gap-2">{extras.map((item) => <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>)}</div>
      <div className="mt-4 flex gap-2">
        {actions.map((action) => (
          <Button key={action.label} size="sm" variant={action.label === "Buchen" ? "default" : "outline"} className="rounded-2xl" onClick={action.onClick}>{action.label}</Button>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-xl font-semibold">{value}</div></div>;
}

function ScoreCircle({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background text-center shadow-soft"><div><div className="font-display text-lg font-semibold leading-none">{s}</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</div></div></div>;
}

function InfoPanel({ icon: Icon, title, body }: { icon: ElementType; title: string; body: string }) {
  return <Card className="rounded-3xl p-6 shadow-soft"><Icon className="h-5 w-5 text-accent" /><h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></Card>;
}

function StatBox({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center"><Icon className="mx-auto h-4 w-4 text-accent" /><div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-base font-semibold">{value}</div></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}/100</span></div>;
}

function loadHistory() {
  if (typeof window === "undefined") return [] as string[];
  try { return JSON.parse(window.localStorage.getItem("travelmatch:history") ?? "[]") as string[]; } catch { return []; }
}
function saveHistory(value: string) {
  if (typeof window === "undefined") return;
  const current = loadHistory().filter((item) => item !== value);
  window.localStorage.setItem("travelmatch:history", JSON.stringify([value, ...current].slice(0, 10)));
}
function loadFavorites(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("travelmatch:favorites");
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}
function writeFavorites(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("travelmatch:favorites", JSON.stringify(items));
}

function buildGallery(rec: TravelRecommendation) {
  const scenes = SCENES[rec.region];
  return [rec.image, scenes[0], scenes[1]];
}

function detectOrigin(departure: string | null | undefined) {
  if (!departure) return AIRPORTS.fra;
  const key = departure.toLowerCase().replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ä/g, "ae").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "");
  return AIRPORTS[key] ?? AIRPORTS.fra;
}

function estimateFlightDuration(origin: { lat: number; lng: number; label: string }, destLat: number, destLng: number) {
  const km = haversineKm(origin.lat, origin.lng, destLat, destLng);
  return Math.max(1.4, Math.round((km / 780 + 0.55) * 10) / 10);
}

function estimateStops(origin: { lat: number; lng: number; label: string }, destLat: number, destLng: number) {
  const km = haversineKm(origin.lat, origin.lng, destLat, destLng);
  if (km < 1200) return 0;
  if (km < 3000) return 0;
  if (km < 8500) return 1;
  return km < 12000 ? 1 : 2;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function deg2rad(deg: number) { return deg * (Math.PI / 180); }

function regionColor(region: Region) {
  return region;
}

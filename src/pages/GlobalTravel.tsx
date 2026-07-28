import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
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
  Loader2,
  MapPin,
  MoonStar,
  Plane,
  Search,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  type Region,
  type TravelBundle,
  type TravelRecommendation,
} from "@/lib/globalTravel";

type SavedItem = { key: string; rec: TravelRecommendation };
type AirportResult = { source: "live" | "fallback"; iata: string; name: string; city: string; countryCode?: string; latitude?: number; longitude?: number };
type FlightOffer = { source: "live" | "fallback"; provider: string; route: string; priceEur: number; durationHours: number; stops: number; departureDate: string; returnDate?: string | null; airline: string; bookingUrl: string; note: string };
type HotelOffer = { source: "live" | "fallback"; provider: string; name: string; nightlyEur: number; totalEur: number; rating: number; neighborhood: string; bookingUrl: string; note: string };
type TravelStyle = { key: string; label: string; description: string; prompt: string; priorities: string[]; icon: ElementType };

const TRAVEL_STYLES: TravelStyle[] = [
  { key: "honeymoon", label: "Honeymoon", description: "Private beaches, sunset dinners, calm suites, a little luxury and zero stress. Focus on romance, views and very good hotels.", prompt: "honeymoon, romantic, private, calm, beautiful hotel, sunset dinners", priorities: ["Romance", "Privacy", "Good hotel", "Relax"], icon: Heart },
  { key: "party", label: "Partyurlaub", description: "Short distances, nightlife, beach clubs, late check-ins and a lively vibe. Good if you want going out, music and easy logistics.", prompt: "partyurlaub, nightlife, clubs, beach clubs, central hotel, easy flights", priorities: ["Nightlife", "Central", "Short flight", "Lively"], icon: Star },
  { key: "family", label: "Familienurlaub", description: "Calm hotels, easy transfers, beach or pool, family rooms, and low-stress planning for everyone.", prompt: "familienurlaub, calm hotel, family friendly, easy transfer, beach or pool", priorities: ["Family room", "Easy transfer", "Pool", "Calm"], icon: Users },
  { key: "wellness", label: "Wellness", description: "Spas, quiet resorts, clean design, good food and a slow pace. Best if you want to recover rather than rush around.", prompt: "wellness, spa hotel, calm, quiet, good food, slow pace", priorities: ["Spa", "Quiet", "Comfort", "Food"], icon: MoonStar },
  { key: "culture", label: "Kulturtrip", description: "Museums, old towns, design, architecture and neighborhoods that feel alive. Great for a city with substance.", prompt: "culture trip, museums, old town, architecture, good restaurants, walkable", priorities: ["Museums", "City", "Walkable", "Food"], icon: Compass },
  { key: "adventure", label: "Adventure", description: "Hikes, surf, nature, viewpoints and activity-packed days. Good when the trip should feel like an experience, not only a stay.", prompt: "adventure trip, hiking, surf, nature, active, viewpoints", priorities: ["Nature", "Active", "Outdoor", "Variety"], icon: Sparkles },
  { key: "budget", label: "Budget", description: "Best price-performance, cheaper flights, good-value hotels and a clean shortlist that respects your limit.", prompt: "budget trip, best value, cheap flight, good hotel, price-performance", priorities: ["Value", "Cheaper", "Good deals", "Simple"], icon: BarChart3 },
  { key: "luxury", label: "Luxury", description: "High-end hotels, nicer rooms, premium transfer, polished service and the destinations where upgrading really makes sense.", prompt: "luxury travel, premium hotel, nicer service, private, polished", priorities: ["Premium", "Service", "Comfort", "Style"], icon: Star },
  { key: "roadtrip", label: "Roadtrip", description: "Places that work well with a car, scenic routes, multiple stops and flexible planning across a region.", prompt: "roadtrip, scenic drives, multiple stops, car friendly, flexible", priorities: ["Car friendly", "Scenic", "Flexible", "Multiple stops"], icon: MapPin },
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
  Europe: ["https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80"],
  "Middle East": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80"],
  Africa: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80"],
  Asia: ["https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80"],
  Americas: ["https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=80"],
  Oceania: ["https://images.unsplash.com/photo-1506973035872-a4f23e90f596?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1500043357865-c6b8827edf78?auto=format&fit=crop&w=1400&q=80"],
};

const DEFAULT_AIRPORT: AirportResult = { source: "fallback", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", countryCode: "DE", latitude: 50.0379, longitude: 8.5622 };
const DEFAULT_SEARCH_TEXT = "Warm beach week, max 2200€, from Stuttgart, no party";

export default function GlobalTravelPage() {
  const [prompt, setPrompt] = useState(DEFAULT_SEARCH_TEXT);
  const [budgetCap, setBudgetCap] = useState(2200);
  const [durationDays, setDurationDays] = useState(7);
  const [adults, setAdults] = useState(2);
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [selectedStyle, setSelectedStyle] = useState<string>("beach");
  const [departureDate, setDepartureDate] = useState(todayISO(28));
  const [returnDate, setReturnDate] = useState(todayISO(35));
  const [departureQuery, setDepartureQuery] = useState("Stuttgart");
  const [airportResults, setAirportResults] = useState<AirportResult[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<AirportResult>(DEFAULT_AIRPORT);
  const [airportLoading, setAirportLoading] = useState(false);
  const [bundle, setBundle] = useState<TravelBundle>(() => recommendDestinations(augmentPrompt(DEFAULT_SEARCH_TEXT, budgetCap, durationDays, TRAVEL_STYLES[0].prompt, DEFAULT_AIRPORT, departureDate, returnDate)));
  const [selectedId, setSelectedId] = useState(bundle.recommendations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [hotelOffers, setHotelOffers] = useState<HotelOffer[]>([]);
  const [favorites, setFavorites] = useState<SavedItem[]>(() => loadFavorites());
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const airportDebounce = useRef<number | null>(null);

  const recommendations = useMemo(() => {
    const filtered = activeRegion === "All" ? bundle.recommendations : bundle.recommendations.filter((rec) => rec.region === activeRegion);
    return [...filtered].sort((a, b) => b.matchScore - a.matchScore);
  }, [bundle.recommendations, activeRegion]);

  const selected = recommendations.find((rec) => rec.id === selectedId) ?? recommendations[0];
  const selectedSaved = selected ? favorites.some((item) => item.key === destinationKey(selected.name, selected.country)) : false;
  const style = TRAVEL_STYLES.find((item) => item.key === selectedStyle) ?? TRAVEL_STYLES[0];
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0, Europe: 0, "Middle East": 0, Africa: 0, Asia: 0, Americas: 0, Oceania: 0 };
    for (const d of worldDestinations()) counts[d.region] += 1;
    counts.All = worldDestinations().length;
    return counts;
  }, []);
  const gallery = selected ? buildGallery(selected) : [];

  useEffect(() => {
    if (!recommendations.some((r) => r.id === selectedId)) setSelectedId(recommendations[0]?.id ?? "");
  }, [recommendations, selectedId]);

  useEffect(() => {
    if (airportDebounce.current) window.clearTimeout(airportDebounce.current);
    if (departureQuery.trim().length < 2) {
      setAirportResults([]);
      return;
    }
    airportDebounce.current = window.setTimeout(() => void searchAirports(departureQuery), 250);
    return () => {
      if (airportDebounce.current) window.clearTimeout(airportDebounce.current);
    };
  }, [departureQuery]);

  useEffect(() => {
    if (selected) void loadSelectedOffers(selected);
  }, [selected?.id, departureDate, returnDate, selectedAirport.iata, adults, budgetCap, selectedStyle]);

  async function searchAirports(keyword: string) {
    setAirportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("airport-search", { body: { keyword, max: 8 } });
      if (error || !data) throw error ?? new Error("airport search failed");
      const airports = Array.isArray(data) ? (data as AirportResult[]) : [];
      setAirportResults(airports);
      if (!selectedAirport.iata && airports[0]) setSelectedAirport(airports[0]);
    } catch {
      setAirportResults([DEFAULT_AIRPORT]);
    } finally {
      setAirportLoading(false);
    }
  }

  async function runSearch(nextPrompt = prompt) {
    const stylePrompt = style.prompt;
    const applied = augmentPrompt(nextPrompt, budgetCap, durationDays, stylePrompt, selectedAirport, departureDate, returnDate);
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
      const result = await fetchLiveWeather({ destinationName: rec.name, country: rec.country, fallback: rec.weather });
      return { period: result.period, highC: result.highC, lowC: result.lowC, rain: result.rain, summary: result.source === "live" ? result.summary : rec.weather.summary };
    } catch {
      return rec.weather;
    }
  }

  async function loadSelectedOffers(rec: TravelRecommendation) {
    setOffersLoading(true);
    try {
      const [flightResult, hotelResult] = await Promise.all([
        supabase.functions.invoke("travel-flight-search", { body: { destinationIata: rec.iata, departureIata: selectedAirport.iata, departureDate, returnDate, travelers: adults, budgetMax: budgetCap } }),
        supabase.functions.invoke("travel-hotel-search", { body: { destinationIata: rec.iata, destinationName: rec.name, checkInDate: departureDate, checkOutDate: returnDate, adults, luxuryLevel: selectedStyle === "luxury" ? "luxury" : selectedStyle === "budget" ? "budget" : selectedStyle === "honeymoon" ? "premium" : "midrange" } }),
      ]);
      const flightOffers = Array.isArray(flightResult.data?.offers) ? (flightResult.data.offers as FlightOffer[]) : [];
      const hotelOffers = Array.isArray(hotelResult.data?.offers) ? (hotelResult.data.offers as HotelOffer[]) : [];
      setFlightOffers(flightOffers);
      setHotelOffers(hotelOffers);
    } catch {
      setFlightOffers(generateFlightFallback(rec));
      setHotelOffers(generateHotelFallback(rec));
    } finally {
      setOffersLoading(false);
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

  function selectStyle(styleKey: string) {
    const next = TRAVEL_STYLES.find((item) => item.key === styleKey) ?? TRAVEL_STYLES[0];
    setSelectedStyle(next.key);
    setPrompt((prev) => mergePrompt(prev, next.prompt));
  }

  function selectAirport(airport: AirportResult) {
    setSelectedAirport(airport);
    setDepartureQuery(`${airport.city} (${airport.iata})`);
    setAirportResults([]);
  }

  function flightSearchUrl(from: string, to: string, departure = departureDate, ret = returnDate) {
    const q = ret ? `Flights from ${from} to ${to} on ${departure} returning ${ret}` : `Flights from ${from} to ${to} on ${departure}`;
    const url = new URL("https://www.google.com/travel/flights");
    url.searchParams.set("q", q);
    return url.toString();
  }

  function hotelUrl(destination: string, travelers = adults) {
    const url = new URL("https://www.booking.com/searchresults.html");
    url.searchParams.set("ss", destination);
    url.searchParams.set("group_adults", String(Math.max(1, travelers)));
    return url.toString();
  }

  const tripPreview = useMemo(() => augmentPrompt(prompt, budgetCap, durationDays, style.prompt, selectedAirport, departureDate, returnDate), [prompt, budgetCap, durationDays, style.prompt, selectedAirport, departureDate, returnDate]);

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
            <Badge variant="secondary" className="rounded-full px-3 py-2">{worldDestinations().length} Reiseziele</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-2">{regionCounts.All} Optionen weltweit</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20">
        <section className="grid gap-8 pb-10 pt-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:pt-16">
          <div className="space-y-6 fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Reiseideen mit Stiltypen, Budget, Datum und weltweiten Flughäfen
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Finde deinen Urlaub.
              <br />
              Nicht irgendeinen.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Schreib ein paar Stichpunkte rein, wähle deinen Urlaubstyp und wir schlagen passende Ziele, echte Bilder, Flugoptionen und Hotels vor.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[[BadgeCheck, "Typen", "Honeymoon, Party, Familie, Wellness."], [Plane, "Weltweit", "Viele Flughäfen, viele Reiseziele."], [BarChart3, "Preislisten", "Flug und Hotel nach Budget sortiert."]].map(([Icon, title, body]) => (
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
                  <h2 className="mt-1 font-display text-2xl font-semibold">Wie soll sich der Urlaub anfühlen?</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Budget + Datum</div>
              </div>

              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-28 resize-none rounded-3xl border-border/70 bg-background/80 p-4 text-base shadow-none focus-visible:ring-2" placeholder="z. B. warm, gutes Hotel, 7 Tage, max 2200€, keine Party, ab Stuttgart" />

              <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preisrahmen</div>
                    <div className="mt-1 font-medium">Bis {formatEuro(budgetCap)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Alles wird damit abgestimmt</div>
                </div>
                <input type="range" min={600} max={9000} step={100} value={budgetCap} onChange={(e) => setBudgetCap(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
                <div className="flex flex-wrap gap-2">{BUDGETS.map((item) => <button key={item.label} type="button" onClick={() => setBudgetCap(item.value)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{item.label}</button>)}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Abflug</div>
                  <Input value={departureQuery} onChange={(e) => setDepartureQuery(e.target.value)} placeholder="Flughafen / Stadt" className="mt-2 h-12 rounded-2xl" />
                  <div className="mt-2 text-xs text-muted-foreground">{selectedAirport.iata ? `${selectedAirport.city} · ${selectedAirport.iata}` : "Suche weltweit nach Flughäfen"}</div>
                  <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                    {airportLoading && <div className="text-xs text-muted-foreground">Suche Flughäfen…</div>}
                    {airportResults.map((airport) => (
                      <button key={`${airport.iata}-${airport.city}`} onClick={() => selectAirport(airport)} className="w-full rounded-2xl border border-border/60 bg-card px-3 py-2 text-left text-sm transition hover:border-primary/40">
                        <div className="font-medium">{airport.city}</div>
                        <div className="text-xs text-muted-foreground">{airport.name} · {airport.iata}</div>
                      </button>
                    ))}
                    {!airportResults.length && !airportLoading && <div className="text-xs text-muted-foreground">Tippe einen Flughafennamen oder eine Stadt ein.</div>}
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hinflug</div>
                  <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="mt-2 h-12 rounded-2xl" />
                  <div className="mt-2 text-xs text-muted-foreground">Wann willst du los?</div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rückflug</div>
                  <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="mt-2 h-12 rounded-2xl" />
                  <div className="mt-2 text-xs text-muted-foreground">Wie lange bleibst du?</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reisedauer</div>
                  <div className="mt-3 flex items-center gap-3">
                    <input type="range" min={3} max={21} step={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{durationDays} Tage</div>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reisende</div>
                  <div className="mt-3 flex items-center gap-3">
                    <button className="rounded-full border px-3 py-1" onClick={() => setAdults((v) => Math.max(1, v - 1))}>−</button>
                    <div className="min-w-8 text-center font-semibold">{adults}</div>
                    <button className="rounded-full border px-3 py-1" onClick={() => setAdults((v) => Math.min(8, v + 1))}>+</button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Erwachsene</div>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ziel-Region</div>
                  <div className="mt-3 text-sm text-muted-foreground">Filtere die Ergebnisse nach Region, wenn du schon grob weißt wohin.</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {REGIONS.map((item) => (
                  <button key={item.label} type="button" onClick={() => setActiveRegion(item.value)} className={`rounded-full border px-3 py-1.5 text-xs transition ${activeRegion === item.value ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                    {item.label} ({item.value === "All" ? regionCounts.All : regionCounts[item.value]})
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => void runSearch()} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Reisen finden</Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setPrompt(mergePrompt(prompt, style.prompt))}>Typ hinzufügen</Button>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-background/60 p-3">
                <MiniStat label="Ziele" value={recommendations.length.toString()} />
                <MiniStat label="Favoriten" value={favorites.length.toString()} />
                <MiniStat label="Typ" value={style.label} />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-4 md:grid-cols-3">
          <InfoPanel icon={Compass} title="Stichpunkte reichen" body="Die Suche nimmt einfache Sätze, Urlaubsarten, Budget und Datum und baut daraus eine passende Shortlist." />
          <InfoPanel icon={Plane} title="Weltweite Flughäfen" body="Die Autovervollständigung kann über sehr viele Flughäfen und Städte suchen – viel mehr als nur ein paar Standardziele." />
          <InfoPanel icon={Bookmark} title="Preislisten statt Bauchgefühl" body="Zu jedem Ziel werden Flug- und Hotelangebote in mehreren Preisstufen nebeneinander dargestellt." />
        </section>

        <section className="py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {TRAVEL_STYLES.map((item) => {
              const active = item.key === selectedStyle;
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => selectStyle(item.key)} className="text-left">
                  <Card className={`h-full rounded-[2rem] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-elegant ${active ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-soft"><Icon className="h-5 w-5 text-accent" /></div>
                      {active && <Badge className="rounded-full">Ausgewählt</Badge>}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold">{item.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{item.priorities.map((p) => <Badge key={p} variant="secondary" className="rounded-full">{p}</Badge>)}</div>
                  </Card>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reiseziele</p>
                <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Deine Shortlist</h2>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{bundle.parsed.month ? monthLabel(bundle.parsed.month) : "Flexible Zeit"}</Badge>
            </div>

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
                          <div className="grid gap-2 sm:grid-cols-2">{rec.reasons.slice(0, 2).map((reason) => <div key={reason} className="flex gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></div>)}</div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); toggleFavorite(rec); }}><Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />{isFav ? "Gespeichert" : "Speichern"}</Button>
                            <Button variant="outline" size="sm" className="rounded-2xl">Mehr Details <ChevronRight className="h-4 w-4" /></Button>
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
                    <div className="absolute bottom-5 left-5 right-5"><h3 className="font-display text-3xl font-semibold text-white">{selected.name}</h3><p className="mt-1 max-w-lg text-sm text-white/85">{selected.tagline}</p></div>
                  </div>
                  <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-3"><StatBox icon={Plane} label="Flug" value={formatEuro(selected.flightEur)} /><StatBox icon={Hotel} label="Hotel / Nacht" value={formatEuro(selected.hotelNightlyEur)} /><StatBox icon={CloudSun} label="Gesamt" value={formatEuro(selected.estimatedTotalEur)} /></div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="overflow-hidden rounded-2xl border border-border/60 sm:col-span-2"><img src={gallery[0]} alt={selected.name} className="h-32 w-full object-cover" /></div>
                      <div className="overflow-hidden rounded-2xl border border-border/60"><img src={gallery[1]} alt={`${selected.region} scene`} className="h-32 w-full object-cover" /></div>
                      <div className="overflow-hidden rounded-2xl border border-border/60"><img src={gallery[2]} alt={`${selected.region} scene 2`} className="h-32 w-full object-cover" /></div>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Warum passt es?</div><div className="mt-1 font-display text-xl font-semibold">Kurz erklärt</div></div><MoonStar className="h-5 w-5 text-accent" /></div><ul className="mt-4 space-y-2 text-sm text-muted-foreground">{selected.reasons.map((reason) => <li key={reason} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></li>)}</ul></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Wetter für {selected.weather.period}</div><p className="mt-2 text-sm text-muted-foreground">{selected.weather.summary}. Etwa {selected.weather.highC}°C / {selected.weather.lowC}°C.</p></div>
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Score Breakdown</div><div className="mt-3 space-y-2 text-sm"><Metric label="Climate" value={selected.scoreBreakdown.climate} /><Metric label="Vibe" value={selected.scoreBreakdown.vibe} /><Metric label="Budget" value={selected.scoreBreakdown.budget} /><Metric label="Ease" value={selected.scoreBreakdown.ease} /><Metric label="Value" value={selected.scoreBreakdown.value} /></div></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><h4 className="font-medium">Aktivitäten</h4><div className="mt-2 flex flex-wrap gap-2">{selected.activities.map((item) => <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>)}</div></div>
                      <div><h4 className="font-medium">Tipps</h4><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{selected.tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul></div>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flugangebote</div><div className="mt-1 font-display text-xl font-semibold">Preisübersicht</div></div><Plane className="h-5 w-5 text-accent" /></div>
                      <div className="mt-4 grid gap-3">
                        {(flightOffers.length ? flightOffers : generateFlightFallback(selected)).map((offer) => <OfferCard key={`${offer.provider}-${offer.priceEur}-${offer.airline}`} type="flight" offer={offer} onOpen={() => window.open(offer.bookingUrl, "_blank", "noopener,noreferrer")} />)}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotelangebote</div><div className="mt-1 font-display text-xl font-semibold">Preisübersicht</div></div><Hotel className="h-5 w-5 text-accent" /></div>
                      <div className="mt-4 grid gap-3">
                        {(hotelOffers.length ? hotelOffers : generateHotelFallback(selected)).map((offer) => <HotelCard key={`${offer.provider}-${offer.totalEur}-${offer.name}`} offer={offer} onOpen={() => window.open(offer.bookingUrl, "_blank", "noopener,noreferrer")} />)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-2xl" onClick={() => toggleFavorite(selected)}><Heart className={`h-4 w-4 ${selectedSaved ? "fill-current" : ""}`} />{selectedSaved ? "Gespeichert" : "Favorit speichern"}</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open(hotelUrl(selected.name, adults), "_blank", "noopener,noreferrer")}>Weitere Hotels</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open(flightSearchUrl(selectedAirport.label, selected.iata), "_blank", "noopener,noreferrer")}>Flüge vergleichen</Button>
                    </div>
                    {offersLoading && <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Live-Angebote werden geladen…</div>}
                  </div>
                </>
              ) : <div className="p-8 text-center text-muted-foreground">Starte eine Suche, um die Details zu sehen.</div>}
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weltweit stöbern</p><h2 className="mt-1 font-display text-3xl font-semibold">Alle Reiseziele</h2></div><div className="text-sm text-muted-foreground">{worldDestinations().length} Vorschläge</div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{worldDestinations().map((dest) => <button key={dest.id} onClick={() => setSelectedId(dest.id)} className="text-left"><Card className="overflow-hidden rounded-[1.75rem] border-border/70 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"><img src={dest.image} alt={dest.name} className="h-40 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-display text-xl font-semibold">{dest.name}</div><div className="text-sm text-muted-foreground">{dest.country}</div></div><Badge variant="secondary" className="rounded-full">{dest.region}</Badge></div><div className="mt-3 text-sm text-muted-foreground">{dest.tagline}</div></div></Card></button>)}
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verlauf</p><h2 className="mt-1 font-display text-3xl font-semibold">Letzte Suchen</h2></div></div>
          <div className="mt-5 flex flex-wrap gap-2">{history.length ? history.map((item) => <button key={item} onClick={() => { setPrompt(stripPromptMeta(item)); void runSearch(stripPromptMeta(item)); }} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{item}</button>) : <div className="text-sm text-muted-foreground">Deine letzten Suchen erscheinen hier.</div>}</div>
        </section>

        <section className="pt-8">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mehr wie ein echtes Reiseportal</p><h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Klare Suche, echte Auswahl, bessere Vorschläge.</h2><p className="mt-3 text-muted-foreground">Urlaubstypen, Budget, Datum und Abflugort steuern die Vorschläge. Die Angebote für Flüge und Hotels kommen als Preislisten mit direkten Links.</p></div>
              <div className="flex gap-3"><Button onClick={() => void runSearch()} className="rounded-2xl"><Zap className="h-4 w-4" />Suche neu laden</Button><Button variant="outline" className="rounded-2xl" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Nach oben</Button></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function OfferCard({ type, offer, onOpen }: { type: "flight"; offer: FlightOffer; onOpen: () => void }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{type}</div>
          <div className="mt-1 font-medium">{offer.airline}</div>
        </div>
        <Badge variant={offer.source === "live" ? "default" : "secondary"} className="rounded-full">{offer.source}</Badge>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{formatEuro(offer.priceEur)}</div>
      <div className="mt-1 text-sm text-muted-foreground">{offer.route} · {offer.durationHours}h · {offer.stops} Stop(s)</div>
      <div className="mt-1 text-sm text-muted-foreground">Hinflug: {offer.departureDate}{offer.returnDate ? ` · Rückflug: ${offer.returnDate}` : ""}</div>
      <p className="mt-2 text-sm text-muted-foreground">{offer.note}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="rounded-2xl" onClick={onOpen}>Ansehen</Button>
        <Button size="sm" className="rounded-2xl" onClick={onOpen}>Buchen</Button>
      </div>
    </div>
  );
}

function HotelCard({ offer, onOpen }: { offer: HotelOffer; onOpen: () => void }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">hotel</div>
          <div className="mt-1 font-medium">{offer.name}</div>
        </div>
        <Badge variant={offer.source === "live" ? "default" : "secondary"} className="rounded-full">{offer.source}</Badge>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{formatEuro(offer.nightlyEur)} / Nacht</div>
      <div className="mt-1 text-sm text-muted-foreground">Gesamt: {formatEuro(offer.totalEur)} · {offer.rating}/5 · {offer.neighborhood}</div>
      <p className="mt-2 text-sm text-muted-foreground">{offer.note}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="rounded-2xl" onClick={onOpen}>Ansehen</Button>
        <Button size="sm" className="rounded-2xl" onClick={onOpen}>Buchen</Button>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center"><Icon className="mx-auto h-4 w-4 text-accent" /><div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-base font-semibold">{value}</div></div>;
}

function InfoPanel({ icon: Icon, title, body }: { icon: ElementType; title: string; body: string }) {
  return <Card className="rounded-3xl p-6 shadow-soft"><Icon className="h-5 w-5 text-accent" /><h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></Card>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}/100</span></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-xl font-semibold">{value}</div></div>; }
function ScoreCircle({ score }: { score: number }) { const s = Math.max(0, Math.min(100, Math.round(score))); return <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background text-center shadow-soft"><div><div className="font-display text-lg font-semibold leading-none">{s}</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</div></div></div>; }
function loadHistory() { if (typeof window === "undefined") return [] as string[]; try { return JSON.parse(window.localStorage.getItem("travelmatch:history") ?? "[]") as string[]; } catch { return []; } }
function saveHistory(value: string) { if (typeof window === "undefined") return; const current = loadHistory().filter((item) => item !== value); window.localStorage.setItem("travelmatch:history", JSON.stringify([value, ...current].slice(0, 12))); }
function loadFavorites(): SavedItem[] { if (typeof window === "undefined") return []; try { const raw = window.localStorage.getItem("travelmatch:favorites"); return raw ? (JSON.parse(raw) as SavedItem[]) : []; } catch { return []; } }
function writeFavorites(items: SavedItem[]) { if (typeof window === "undefined") return; window.localStorage.setItem("travelmatch:favorites", JSON.stringify(items)); }
function buildGallery(rec: TravelRecommendation) { return [rec.image, ...(SCENES[rec.region] ?? SCENES.Europe)]; }
function mergePrompt(base: string, addition: string) { const merged = `${base}`.trim(); return merged.toLowerCase().includes(addition.split(",")[0].toLowerCase()) ? merged : `${merged} ${addition}`.trim(); }
function augmentPrompt(base: string, budgetCap: number, durationDays: number, stylePrompt: string, airport: AirportResult, departureDate: string, returnDate: string) { return `${base} Budget max ${budgetCap}€. Dauer ${durationDays} Tage. ${stylePrompt}. Abflug ab ${airport.city} (${airport.iata}). Hinflug ${departureDate}. Rückflug ${returnDate}.`; }
function stripPromptMeta(prompt: string) { return prompt.replace(/Budget max \d+€.*/i, "").trim(); }
function todayISO(offsetDays = 0) { const d = new Date(); d.setDate(d.getDate() + offsetDays); return d.toISOString().slice(0, 10); }
function generateFlightFallback(rec: TravelRecommendation): FlightOffer[] { return [ { source: "fallback", provider: "Best Value", route: `FRA → ${rec.iata}`, priceEur: Math.round(rec.flightEur), durationHours: 0, stops: 0, departureDate: todayISO(28), returnDate: todayISO(35), airline: "Estimated", bookingUrl: googleFlightsUrl("FRA", rec.iata, todayISO(28), todayISO(35)), note: "Fallback ohne API-Key." }, { source: "fallback", provider: "Cheapest", route: `FRA → ${rec.iata}`, priceEur: Math.round(rec.flightEur * 0.9), durationHours: 0, stops: 1, departureDate: todayISO(28), returnDate: todayISO(35), airline: "Estimated", bookingUrl: googleFlightsUrl("FRA", rec.iata, todayISO(28), todayISO(35)), note: "Günstigere Variante." }, { source: "fallback", provider: "Fastest", route: `FRA → ${rec.iata}`, priceEur: Math.round(rec.flightEur * 1.15), durationHours: 0, stops: 0, departureDate: todayISO(28), returnDate: todayISO(35), airline: "Estimated", bookingUrl: googleFlightsUrl("FRA", rec.iata, todayISO(28), todayISO(35)), note: "Schnellste Variante." }, ]; }
function generateHotelFallback(rec: TravelRecommendation): HotelOffer[] { return [ { source: "fallback", provider: "Best Value", name: `${rec.name} Value Stay`, nightlyEur: Math.max(50, Math.round(rec.hotelNightlyEur * 0.82)), totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * 7 * 0.82)), rating: 4.1, neighborhood: "Central area", bookingUrl: googleHotelUrl(rec.name, 2), note: "Fallback ohne API-Key." }, { source: "fallback", provider: "Balanced", name: `${rec.name} Balanced Stay`, nightlyEur: rec.hotelNightlyEur, totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * 7)), rating: 4.4, neighborhood: "Good location", bookingUrl: googleHotelUrl(rec.name, 2), note: "Ausgewogene Option." }, { source: "fallback", provider: "Premium", name: `${rec.name} Premium Stay`, nightlyEur: Math.round(rec.hotelNightlyEur * 1.35), totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * 7 * 1.35)), rating: 4.7, neighborhood: "Prime area", bookingUrl: googleHotelUrl(rec.name, 2), note: "Komfort-Option." }, ]; }
function googleFlightsUrl(from: string, to: string, departureDate: string, returnDate: string) { const url = new URL("https://www.google.com/travel/flights"); url.searchParams.set("q", `Flights from ${from} to ${to} on ${departureDate} returning ${returnDate}`); return url.toString(); }
function googleHotelUrl(destination: string, adults = 2) { const url = new URL("https://www.booking.com/searchresults.html"); url.searchParams.set("ss", destination); url.searchParams.set("group_adults", String(adults)); return url.toString(); }
function airportLabel(airport?: AirportResult | null) { return airport ? `${airport.city} (${airport.iata})` : "FRA"; }

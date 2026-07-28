import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import {
  BadgeCheck,
  BarChart3,
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
import { destinationKey, formatEuro, monthLabel, recommendDestinations, worldDestinations, type TravelRecommendation } from "@/lib/globalTravel";

type Airport = { source: "live" | "fallback"; iata: string; name: string; city: string; countryCode?: string; latitude?: number; longitude?: number };
type FlightOffer = { source: "live" | "fallback"; provider: string; route: string; priceEur: number; durationHours: number; stops: number; departureDate: string; returnDate?: string | null; airline: string; bookingUrl: string; note: string };
type HotelOffer = { source: "live" | "fallback"; provider: string; name: string; nightlyEur: number; totalEur: number; rating: number; neighborhood: string; bookingUrl: string; note: string };
type Saved = { key: string; rec: TravelRecommendation };

type TravelType = { key: string; label: string; prompt: string; description: string; icon: ElementType };

const TRAVEL_TYPES: TravelType[] = [
  { key: "honeymoon", label: "Honeymoon", prompt: "honeymoon, romantic, private beach, sunset dinners, calm luxury", description: "Romantik, Privatsphäre, ruhige Hotels und schöne Aussichten.", icon: Heart },
  { key: "party", label: "Partyurlaub", prompt: "partyurlaub, nightlife, clubs, beach clubs, central hotel", description: "Kurze Wege, Clubs, Beach Clubs und spätes Check-in.", icon: Star },
  { key: "family", label: "Familienurlaub", prompt: "familienurlaub, family friendly, pool, easy transfer, calm hotel", description: "Familienzimmer, Pool, einfache Transfers und wenig Stress.", icon: Users },
  { key: "wellness", label: "Wellness", prompt: "wellness, spa hotel, quiet, good food, slow pace", description: "Spa, Ruhe, gutes Essen und entspanntes Tempo.", icon: MoonStar },
  { key: "culture", label: "Kulturtrip", prompt: "culture trip, museums, old town, architecture, walkable", description: "Museen, Altstadt, Architektur und gute Viertel.", icon: Compass },
  { key: "adventure", label: "Adventure", prompt: "adventure trip, hiking, surf, nature, viewpoints", description: "Aktiv, Natur, Wanderungen und Erlebnisse.", icon: Sparkles },
  { key: "budget", label: "Budget", prompt: "budget trip, best value, cheap flight, good hotel", description: "Preis-Leistung, günstiger Flug und gute Hotels.", icon: BarChart3 },
  { key: "luxury", label: "Luxury", prompt: "luxury travel, premium hotel, polished service, private", description: "Premium, komfortabel, hochwertig und stilvoll.", icon: Star },
  { key: "roadtrip", label: "Roadtrip", prompt: "roadtrip, scenic drives, car friendly, multiple stops", description: "Flexibel, mehrere Stops und schöne Routen.", icon: MapPin },
];

const FLIGHT_CHECKS = ["Direktflug", "Max. 1 Zwischenstopp", "Gepäck inklusive", "Frühflug", "Nachtflug", "Premium Economy", "Business Class", "Flexible Daten"] as const;
const HOTEL_CHECKS = ["Adults Only", "All Inclusive", "Frühstück", "Halbpension", "Spa", "Pool", "Familienhotel", "Boutique Hotel", "Eigener Strand", "5 Sterne"] as const;
const TRIP_CHECKS = ["Strand", "Stadt", "Kultur", "Wellness", "Abenteuer", "Romantik", "Luxus", "Preis-Leistung"] as const;

const DEFAULT_AIRPORT: Airport = { source: "fallback", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", countryCode: "DE", latitude: 50.0379, longitude: 8.5622 };
const DEFAULT_TEXT = "Warm beach week, max 2200€, from Stuttgart, no party, good hotel, 7 days";

export default function TravelPlannerPro() {
  const [prompt, setPrompt] = useState(DEFAULT_TEXT);
  const [budgetCap, setBudgetCap] = useState(2200);
  const [durationDays, setDurationDays] = useState(7);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [pets, setPets] = useState(0);
  const [selectedType, setSelectedType] = useState<TravelType>(TRAVEL_TYPES[6]);
  const [flightChecks, setFlightChecks] = useState<string[]>(["Direktflug"]);
  const [hotelChecks, setHotelChecks] = useState<string[]>(["Frühstück"]);
  const [tripChecks, setTripChecks] = useState<string[]>(["Strand"]);
  const [departureDate, setDepartureDate] = useState(todayISO(28));
  const [returnDate, setReturnDate] = useState(todayISO(35));
  const [airportQuery, setAirportQuery] = useState("Stuttgart");
  const [airportResults, setAirportResults] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport>(DEFAULT_AIRPORT);
  const [airportLoading, setAirportLoading] = useState(false);
  const [bundle, setBundle] = useState(() => recommendDestinations(buildSearchText(DEFAULT_TEXT, budgetCap, durationDays, DEFAULT_AIRPORT, departureDate, returnDate, peopleCount(adults, children, babies), selectedType.label, flightChecks, hotelChecks, tripChecks)));
  const [selectedId, setSelectedId] = useState(bundle.recommendations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [hotelOffers, setHotelOffers] = useState<HotelOffer[]>([]);
  const [flightIndex, setFlightIndex] = useState(0);
  const [hotelIndex, setHotelIndex] = useState(0);
  const [saved, setSaved] = useState<Saved[]>(() => loadSaved());
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const airportTimer = useRef<number | null>(null);

  const selected = useMemo(() => bundle.recommendations.find((item) => item.id === selectedId) ?? bundle.recommendations[0], [bundle.recommendations, selectedId]);
  const selectedFlight = flightOffers[flightIndex] ?? flightOffers[0];
  const selectedHotel = hotelOffers[hotelIndex] ?? hotelOffers[0];
  const selectedSaved = selected ? saved.some((item) => item.key === destinationKey(selected.name, selected.country)) : false;
  const people = peopleCount(adults, children, babies);
  const previewText = buildSearchText(prompt, budgetCap, durationDays, selectedAirport, departureDate, returnDate, people, selectedType.label, flightChecks, hotelChecks, tripChecks);
  const itinerary = buildItinerary(selected, selectedFlight, selectedHotel, durationDays, adults, children, babies, pets);
  const monthText = bundle.parsed.month ? monthLabel(bundle.parsed.month) : "Flexible Zeit";
  const regionCounts = useMemo(() => countRegions(), []);

  useEffect(() => {
    if (!bundle.recommendations.some((r) => r.id === selectedId)) setSelectedId(bundle.recommendations[0]?.id ?? "");
  }, [bundle.recommendations, selectedId]);

  useEffect(() => {
    if (airportTimer.current) window.clearTimeout(airportTimer.current);
    if (airportQuery.trim().length < 2) {
      setAirportResults([]);
      return;
    }
    airportTimer.current = window.setTimeout(() => void lookupAirports(airportQuery), 250);
    return () => {
      if (airportTimer.current) window.clearTimeout(airportTimer.current);
    };
  }, [airportQuery]);

  useEffect(() => {
    if (selected) void loadOffers(selected);
  }, [selected?.id, selectedAirport.iata, departureDate, returnDate, budgetCap, adults, children, babies, selectedType.key, flightChecks.join("|"), hotelChecks.join("|"), tripChecks.join("|")]);

  async function lookupAirports(query: string) {
    setAirportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("airport-search", { body: { keyword: query, max: 10 } });
      if (error || !data) throw error ?? new Error("airport search failed");
      setAirportResults(Array.isArray(data) ? (data as Airport[]) : []);
    } catch {
      setAirportResults([DEFAULT_AIRPORT]);
    } finally {
      setAirportLoading(false);
    }
  }

  async function runSearch(nextText = prompt) {
    setLoading(true);
    try {
      const text = buildSearchText(nextText, budgetCap, durationDays, selectedAirport, departureDate, returnDate, people, selectedType.label, flightChecks, hotelChecks, tripChecks);
      const next = recommendDestinations(text);
      const hydrated = await Promise.all(next.recommendations.map(async (rec) => ({ ...rec, weather: await liveWeather(rec) })));
      setBundle({ parsed: next.parsed, recommendations: hydrated as TravelRecommendation[] });
      setSelectedId(hydrated[0]?.id ?? "");
      pushHistory(text);
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

  async function loadOffers(rec: TravelRecommendation) {
    setOffersLoading(true);
    const travelers = peopleCount(adults, children, babies);
    try {
      const [flightResp, hotelResp] = await Promise.all([
        supabase.functions.invoke("travel-flight-search", { body: { destinationIata: rec.iata, departureIata: selectedAirport.iata, departureDate, returnDate, travelers, budgetMax: budgetCap } }),
        supabase.functions.invoke("travel-hotel-search", { body: { destinationIata: rec.iata, destinationName: rec.name, checkInDate: departureDate, checkOutDate: returnDate, adults: Math.max(1, adults), luxuryLevel: selectedType.key === "luxury" ? "luxury" : selectedType.key === "budget" ? "budget" : selectedType.key === "honeymoon" ? "premium" : "midrange" } }),
      ]);
      const flights = Array.isArray(flightResp.data?.offers) ? (flightResp.data.offers as FlightOffer[]) : [];
      const hotels = Array.isArray(hotelResp.data?.offers) ? (hotelResp.data.offers as HotelOffer[]) : [];
      setFlightOffers(flights.length ? flights : fallbackFlights(rec, selectedAirport.iata, departureDate, returnDate));
      setHotelOffers(hotels.length ? hotels : fallbackHotels(rec, durationDays, adults));
      setFlightIndex(0);
      setHotelIndex(0);
    } catch {
      setFlightOffers(fallbackFlights(rec, selectedAirport.iata, departureDate, returnDate));
      setHotelOffers(fallbackHotels(rec, durationDays, adults));
    } finally {
      setOffersLoading(false);
    }
  }

  function toggle<T extends string>(list: T[], item: T, setter: (next: T[]) => void) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function selectType(type: TravelType) {
    setSelectedType(type);
    setPrompt((current) => mergePrompt(current, type.prompt));
  }

  function selectAirport(airport: Airport) {
    setSelectedAirport(airport);
    setAirportQuery(`${airport.city} (${airport.iata})`);
    setAirportResults([]);
  }

  function saveDestination(rec: TravelRecommendation) {
    const key = destinationKey(rec.name, rec.country);
    const exists = saved.some((item) => item.key === key);
    const next = exists ? saved.filter((item) => item.key !== key) : [{ key, rec }, ...saved];
    setSaved(next);
    saveSaved(next);
    toast(exists ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt");
  }

  const destinationCount = worldDestinations().length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant"><Compass className="h-5 w-5" /></span>
            <div>
              <div className="font-display text-lg font-semibold leading-none tracking-tight">TravelMatch</div>
              <div className="text-xs text-muted-foreground">Kompletter Urlaubsplaner</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="secondary" className="rounded-full px-3 py-2">{destinationCount} Reiseziele</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-2">{regionCounts} Regionen</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20">
        <section className="grid gap-8 pb-10 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-16">
          <div className="space-y-6 fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Urlaubstypen, Personen, Kriterien, Datum und weltweite Flughäfen
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Finde deinen Urlaub.
              <br />
              Und plane ihn direkt mit.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Schreib ein paar Stichpunkte rein, wähle Reiseart, Personen und Kriterien. Die Seite schlägt passende Ziele, Hotels, Flüge und einen kompletten Reiseplan vor.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, "Typen", "Honeymoon, Party, Familie, Wellness."],
                [Plane, "Weltweit", "Viele Flughäfen, viele Ziele."],
                [BarChart3, "Preislisten", "Flug und Hotel nach Budget."],
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
                  <h2 className="mt-1 font-display text-2xl font-semibold">Wie soll sich der Urlaub anfühlen?</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Budget + Datum</div>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-28 resize-none rounded-3xl border-border/70 bg-background/80 p-4 text-base shadow-none focus-visible:ring-2"
                placeholder="z. B. warm, gutes Hotel, 7 Tage, max 2200€, keine Party, ab Stuttgart"
              />

              <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preisrahmen</div>
                    <div className="mt-1 font-medium">Bis {formatEuro(budgetCap)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Wird direkt in der Suche berücksichtigt</div>
                </div>
                <input type="range" min={600} max={9000} step={100} value={budgetCap} onChange={(e) => setBudgetCap(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
                <div className="flex flex-wrap gap-2">
                  {[800, 1500, 2500, 5000, 9000].map((value) => (
                    <button key={value} type="button" onClick={() => setBudgetCap(value)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                      {value === 9000 ? "5000€+" : value < 1000 ? `bis ${value}€` : value === 1500 ? "800–1500€" : value === 2500 ? "1500–2500€" : "2500–5000€"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Abflug</div>
                  <Input value={airportQuery} onChange={(e) => setAirportQuery(e.target.value)} placeholder="Flughafen / Stadt" className="mt-2 h-12 rounded-2xl" />
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

              <div className="grid gap-3 sm:grid-cols-4">
                <CounterCard label="Erwachsene" value={adults} onMinus={() => setAdults((value) => Math.max(1, value - 1))} onPlus={() => setAdults((value) => Math.min(10, value + 1))} />
                <CounterCard label="Kinder" value={children} onMinus={() => setChildren((value) => Math.max(0, value - 1))} onPlus={() => setChildren((value) => Math.min(10, value + 1))} />
                <CounterCard label="Babys" value={babies} onMinus={() => setBabies((value) => Math.max(0, value - 1))} onPlus={() => setBabies((value) => Math.min(4, value + 1))} />
                <CounterCard label="Haustiere" value={pets} onMinus={() => setPets((value) => Math.max(0, value - 1))} onPlus={() => setPets((value) => Math.min(4, value + 1))} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reisedauer</div>
                  <div className="mt-3 flex items-center gap-3"><input type="range" min={3} max={21} step={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" /></div>
                  <div className="mt-2 text-sm text-muted-foreground">{durationDays} Tage</div>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ziel-Region</div>
                  <div className="mt-3 text-sm text-muted-foreground">Filtere die Ergebnisse nach Region, wenn du schon grob weißt wohin.</div>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kurzinfo</div>
                  <div className="mt-3 text-sm text-muted-foreground">{people} Personen · {selectedType.label}</div>
                </div>
              </div>

              <FilterGrid title="Reisearten" items={TRIP_CHECKS as readonly string[]} selected={tripChecks} onToggle={(item) => toggle(tripChecks, item, setTripChecks)} />
              <FilterGrid title="Flug-Kriterien" items={FLIGHT_CHECKS as readonly string[]} selected={flightChecks} onToggle={(item) => toggle(flightChecks, item, setFlightChecks)} />
              <FilterGrid title="Hotel-Kriterien" items={HOTEL_CHECKS as readonly string[]} selected={hotelChecks} onToggle={(item) => toggle(hotelChecks, item, setHotelChecks)} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => void runSearch()} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Reisen finden</Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setPrompt((current) => mergePrompt(current, selectedType.prompt))}>Typ hinzufügen</Button>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">{previewText}</div>
              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-background/60 p-3">
                <MiniStat label="Ziele" value={bundle.recommendations.length.toString()} />
                <MiniStat label="Favoriten" value={saved.length.toString()} />
                <MiniStat label="Typ" value={selectedType.label} />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-4 md:grid-cols-3">
          <InfoPanel icon={Compass} title="Stichpunkte reichen" body="Die Suche nimmt einfache Sätze, Reiseart, Budget, Datum und Personen auf und baut daraus eine komplette Planung." />
          <InfoPanel icon={Plane} title="Weltweite Flughäfen" body="Die Autovervollständigung sucht weltweit nach Flughäfen und Städten statt nur nach wenigen Standardzielen." />
          <InfoPanel icon={Bookmark} title="Preislisten statt Bauchgefühl" body="Flüge und Hotels werden mit mehreren Preisstufen nebeneinander dargestellt und direkt auswählbar gemacht." />
        </section>

        <section className="py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {TRAVEL_TYPES.map((type) => {
              const active = type.key === selectedType.key;
              const Icon = type.icon;
              return (
                <button key={type.key} onClick={() => selectType(type)} className="text-left">
                  <Card className={`h-full rounded-[2rem] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-elegant ${active ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-soft"><Icon className="h-5 w-5 text-accent" /></div>
                      {active && <Badge className="rounded-full">Ausgewählt</Badge>}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold">{type.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{type.description}</p>
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
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{monthText}</Badge>
            </div>

            <div className="grid gap-4">
              {bundle.recommendations.map((rec) => {
                const isFav = saved.some((item) => item.key === destinationKey(rec.name, rec.country));
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
                            <ScoreBubble score={rec.matchScore} />
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
                            <Button size="sm" className="rounded-2xl" onClick={(event) => { event.stopPropagation(); saveDestination(rec); }}><Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />{isFav ? "Gespeichert" : "Speichern"}</Button>
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
                <div className="space-y-5 p-0">
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

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flugangebote</div>
                          <div className="mt-1 font-display text-xl font-semibold">Preisübersicht</div>
                        </div>
                        <Plane className="h-5 w-5 text-accent" />
                      </div>
                      <div className="mt-4 grid gap-3">
                        {flightOffers.map((offer, index) => <OfferCard key={`${offer.provider}-${index}`} offer={offer} active={index === flightIndex} onChoose={() => setFlightIndex(index)} onOpen={() => window.open(offer.bookingUrl, "_blank", "noopener,noreferrer")} />)}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotelangebote</div>
                          <div className="mt-1 font-display text-xl font-semibold">Preisübersicht</div>
                        </div>
                        <Hotel className="h-5 w-5 text-accent" />
                      </div>
                      <div className="mt-4 grid gap-3">
                        {hotelOffers.map((offer, index) => <HotelCard key={`${offer.provider}-${index}`} offer={offer} active={index === hotelIndex} onChoose={() => setHotelIndex(index)} onOpen={() => window.open(offer.bookingUrl, "_blank", "noopener,noreferrer")} />)}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kompletter Plan</div>
                          <div className="mt-1 font-display text-xl font-semibold">Urlaub von A bis Z</div>
                        </div>
                        <Zap className="h-5 w-5 text-accent" />
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <PlanStat label="Flug gesamt" value={formatEuro(selectedFlight?.priceEur ?? selected.flightEur)} />
                        <PlanStat label="Hotel gesamt" value={formatEuro(selectedHotel?.totalEur ?? selected.hotelNightlyEur * itinerary.nights)} />
                        <PlanStat label="Transfer" value={formatEuro(itinerary.transferEur)} />
                        <PlanStat label="Puffer" value={formatEuro(itinerary.bufferEur)} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground">{itinerary.summary}</div>
                      <div className="mt-4 grid gap-3">
                        {itinerary.days.map((day) => <div key={day.day} className="rounded-2xl border border-border/60 bg-background/60 p-3"><div className="font-medium">Tag {day.day} · {day.title}</div><div className="mt-1 text-sm text-muted-foreground">{day.body}</div></div>)}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Wetter & Reisezeit</div><p className="mt-2 text-sm text-muted-foreground">{selected.weather.summary}. Reisezeitraum: {departureDate} bis {returnDate}.</p></div>
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Gesamtpreis</div><p className="mt-2 text-sm text-muted-foreground">{formatEuro(itinerary.totalEur)} für die Gruppe, basierend auf dem ausgewählten Flug, Hotel und den Extras.</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-2xl" onClick={() => saveDestination(selected)}><Heart className={`h-4 w-4 ${selectedSaved ? "fill-current" : ""}`} />{selectedSaved ? "Gespeichert" : "Favorit speichern"}</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open(selectedHotel?.bookingUrl ?? "https://www.booking.com", "_blank", "noopener,noreferrer")}>Weitere Hotels</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open(selectedFlight?.bookingUrl ?? "https://www.google.com/travel/flights", "_blank", "noopener,noreferrer")}>Flüge vergleichen</Button>
                    </div>

                    {offersLoading && <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Live-Angebote werden geladen…</div>}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Starte eine Suche, um die Details zu sehen.</div>
              )}
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weltweit stöbern</p><h2 className="mt-1 font-display text-3xl font-semibold">Alle Reiseziele</h2></div><div className="text-sm text-muted-foreground">{destinationCount} Vorschläge</div></div>
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

        <section className="pt-8">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mehr wie ein echtes Reiseportal</p>
                <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Klare Suche, echte Auswahl, bessere Vorschläge.</h2>
                <p className="mt-3 text-muted-foreground">Urlaubstypen, Budget, Datum, Personen und Checklisten steuern die Vorschläge. Die Angebote für Flüge und Hotels werden als Preislisten mit direkten Links dargestellt, dazu gibt es einen kompletten Tagesplan.</p>
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

function OfferCard({ offer, active, onChoose, onOpen }: { offer: FlightOffer; active: boolean; onChoose: () => void; onOpen: () => void }) {
  return (
    <div className={`rounded-3xl border p-4 ${active ? "border-primary bg-primary/5" : "border-border/60 bg-background/70"}`}>
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flug</div><div className="mt-1 font-medium">{offer.airline}</div></div>
        <Badge variant={offer.source === "live" ? "default" : "secondary"} className="rounded-full">{offer.source}</Badge>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{formatEuro(offer.priceEur)}</div>
      <div className="mt-1 text-sm text-muted-foreground">{offer.route} · {offer.durationHours}h · {offer.stops} Stop(s)</div>
      <div className="mt-1 text-sm text-muted-foreground">Hinflug: {offer.departureDate}{offer.returnDate ? ` · Rückflug: ${offer.returnDate}` : ""}</div>
      <p className="mt-2 text-sm text-muted-foreground">{offer.note}</p>
      <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" className="rounded-2xl" onClick={onChoose}>Auswählen</Button><Button size="sm" className="rounded-2xl" onClick={onOpen}>Buchen</Button></div>
    </div>
  );
}

function HotelCard({ offer, active, onChoose, onOpen }: { offer: HotelOffer; active: boolean; onChoose: () => void; onOpen: () => void }) {
  return (
    <div className={`rounded-3xl border p-4 ${active ? "border-primary bg-primary/5" : "border-border/60 bg-background/70"}`}>
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotel</div><div className="mt-1 font-medium">{offer.name}</div></div>
        <Badge variant={offer.source === "live" ? "default" : "secondary"} className="rounded-full">{offer.source}</Badge>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{formatEuro(offer.nightlyEur)} / Nacht</div>
      <div className="mt-1 text-sm text-muted-foreground">Gesamt: {formatEuro(offer.totalEur)} · {offer.rating}/5 · {offer.neighborhood}</div>
      <p className="mt-2 text-sm text-muted-foreground">{offer.note}</p>
      <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" className="rounded-2xl" onClick={onChoose}>Auswählen</Button><Button size="sm" className="rounded-2xl" onClick={onOpen}>Buchen</Button></div>
    </div>
  );
}

function FilterGrid({ title, items, selected, onToggle }: { title: string; items: readonly string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2 text-sm transition hover:border-primary/40">
            <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} className="h-4 w-4 rounded border-border text-primary" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CounterCard({ label, value, onMinus, onPlus }: { label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-center gap-3">
        <button className="rounded-full border px-3 py-1" onClick={onMinus}>−</button>
        <div className="min-w-8 text-center font-semibold">{value}</div>
        <button className="rounded-full border px-3 py-1" onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-3 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function ScoreBubble({ score }: { score: number }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background text-center shadow-soft"><div><div className="font-display text-lg font-semibold leading-none">{value}</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</div></div></div>;
}

function StatBox({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center"><Icon className="mx-auto h-4 w-4 text-accent" /><div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-base font-semibold">{value}</div></div>;
}

function InfoPanel({ icon: Icon, title, body }: { icon: ElementType; title: string; body: string }) {
  return <Card className="rounded-3xl p-6 shadow-soft"><Icon className="h-5 w-5 text-accent" /><h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></Card>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-xl font-semibold">{value}</div></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}/100</span></div>;
}

function TravelPlanShell() {
  return null;
}

function buildSearchText(base: string, budgetCap: number, durationDays: number, airport: Airport, departureDate: string, returnDate: string, people: number, travelType: string, flightChecks: string[], hotelChecks: string[], tripChecks: string[]) {
  return [
    base,
    `Budget max ${budgetCap}€`,
    `Dauer ${durationDays} Tage`,
    `Abflug ${airport.city} (${airport.iata})`,
    `Hinflug ${departureDate}`,
    `Rückflug ${returnDate}`,
    `${people} Personen`,
    `Urlaubstyp ${travelType}`,
    tripChecks.length ? `Reiseart: ${tripChecks.join(", ")}` : "",
    flightChecks.length ? `Flug: ${flightChecks.join(", ")}` : "",
    hotelChecks.length ? `Hotel: ${hotelChecks.join(", ")}` : "",
  ].filter(Boolean).join(". ");
}

function buildItinerary(rec?: TravelRecommendation, flight?: FlightOffer, hotel?: HotelOffer, nights = 7, adults = 2, children = 0, babies = 0, pets = 0) {
  const people = Math.max(1, adults + children + babies);
  const flightCost = flight?.priceEur ?? (rec ? rec.flightEur : 0);
  const hotelCost = hotel?.totalEur ?? (rec ? rec.hotelNightlyEur * nights : 0);
  const transferEur = rec ? Math.round((rec.region === "Europe" ? 45 : rec.region === "Middle East" ? 35 : 65) + people * 8) : 0;
  const bufferEur = Math.round((flightCost + hotelCost) * 0.08);
  const totalEur = Math.round(flightCost + hotelCost + transferEur + bufferEur);
  const summary = rec
    ? `${rec.name}: ${formatEuro(totalEur)} Gesamtbudget für ${people} Personen${pets ? ` · ${pets} Haustier(e)` : ""}. Hotel: ${hotel?.name ?? "passendes Hotel"}. Flug: ${flight?.airline ?? "passender Flug"}.`
    : "Wähle ein Ziel, damit der komplette Plan erscheint.";
  const days = rec
    ? Array.from({ length: Math.min(7, Math.max(3, nights + 1)) }).map((_, index) => ({
        day: index + 1,
        title: index === 0 ? "Anreise & Check-in" : index === 1 ? rec.activities[0] ?? "Erkunden" : index === 2 ? rec.activities[1] ?? "Ausflug" : index === 3 ? "Free day" : index === 4 ? "Food & Sunset" : index === 5 ? "Relax & Spa" : "Abreise vorbereiten",
        body: index === 0 ? `Flug, Transfer und Check-in im ${hotel?.name ?? "gewählten Hotel"}.` : `Mach ${rec.activities[index % rec.activities.length] ?? rec.tagline.toLowerCase()}.`,
        cost: Math.round(totalEur / Math.max(3, nights)),
      }))
    : [];
  return { nights, flightCost, hotelCost, transferEur, bufferEur, totalEur, summary, days };
}

function peopleCount(adults: number, children: number, babies: number) {
  return adults + children + babies;
}

function countRegions() {
  return new Set(worldDestinations().map((d) => d.region)).size;
}

function todayISO(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function loadHistory() {
  if (typeof window === "undefined") return [] as string[];
  try {
    return JSON.parse(window.localStorage.getItem("travelmatch:history") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function pushHistory(value: string) {
  if (typeof window === "undefined") return;
  const current = loadHistory().filter((item) => item !== value);
  window.localStorage.setItem("travelmatch:history", JSON.stringify([value, ...current].slice(0, 12)));
}

function loadSaved(): Saved[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("travelmatch:saved");
    return raw ? (JSON.parse(raw) as Saved[]) : [];
  } catch {
    return [];
  }
}

function saveSaved(items: Saved[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("travelmatch:saved", JSON.stringify(items));
}

function mergePrompt(base: string, addition: string) {
  const clean = base.trim();
  return clean.toLowerCase().includes(addition.split(",")[0].toLowerCase()) ? clean : `${clean} ${addition}`.trim();
}

function fallbackFlights(rec: TravelRecommendation, originIata: string, departureDate: string, returnDate: string): FlightOffer[] {
  return [
    { source: "fallback", provider: "Best Value", route: `${originIata} → ${rec.iata}`, priceEur: Math.round(rec.flightEur), durationHours: Math.max(1.4, rec.flightEur > 800 ? 8 : 2.5), stops: rec.flightEur > 800 ? 1 : 0, departureDate, returnDate, airline: "Estimated", bookingUrl: googleFlightsUrl(originIata, rec.iata, departureDate, returnDate), note: "Fallback ohne Live-API." },
    { source: "fallback", provider: "Cheapest", route: `${originIata} → ${rec.iata}`, priceEur: Math.round(rec.flightEur * 0.9), durationHours: Math.max(1.6, rec.flightEur > 800 ? 8.5 : 3.1), stops: 1, departureDate, returnDate, airline: "Estimated", bookingUrl: googleFlightsUrl(originIata, rec.iata, departureDate, returnDate), note: "Günstiger, etwas flexibler." },
    { source: "fallback", provider: "Fastest", route: `${originIata} → ${rec.iata}`, priceEur: Math.round(rec.flightEur * 1.15), durationHours: Math.max(1.2, rec.flightEur > 800 ? 7.2 : 2.0), stops: 0, departureDate, returnDate, airline: "Estimated", bookingUrl: googleFlightsUrl(originIata, rec.iata, departureDate, returnDate), note: "Schnellste Variante." },
  ];
}

function fallbackHotels(rec: TravelRecommendation, nights: number, adults: number): HotelOffer[] {
  return [
    { source: "fallback", provider: "Best Value", name: `${rec.name} Value Stay`, nightlyEur: Math.max(50, Math.round(rec.hotelNightlyEur * 0.82)), totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * nights * 0.82)), rating: 4.1, neighborhood: "Central area", bookingUrl: googleHotelUrl(rec.name, adults), note: "Fallback ohne Live-API." },
    { source: "fallback", provider: "Balanced", name: `${rec.name} Balanced Stay`, nightlyEur: rec.hotelNightlyEur, totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * nights)), rating: 4.4, neighborhood: "Good location", bookingUrl: googleHotelUrl(rec.name, adults), note: "Ausgewogene Option." },
    { source: "fallback", provider: "Premium", name: `${rec.name} Premium Stay`, nightlyEur: Math.round(rec.hotelNightlyEur * 1.35), totalEur: Math.max(120, Math.round(rec.hotelNightlyEur * nights * 1.35)), rating: 4.7, neighborhood: "Prime area", bookingUrl: googleHotelUrl(rec.name, adults), note: "Komfort-Option." },
  ];
}

function googleFlightsUrl(from: string, to: string, departure: string, ret: string) {
  const url = new URL("https://www.google.com/travel/flights");
  url.searchParams.set("q", `Flights from ${from} to ${to} on ${departure} returning ${ret}`);
  return url.toString();
}

function googleHotelUrl(destination: string, adults = 2) {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", destination);
  url.searchParams.set("group_adults", String(adults));
  return url.toString();
}

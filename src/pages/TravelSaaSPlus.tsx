import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Heart,
  Hotel,
  ListChecks,
  MapPin,
  Plane,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildAccountPreview,
  buildLiveHooks,
  parseTravelBrief,
  rankDestinations,
  type LiveHook,
  type RankedDestination,
  type TravelDestination,
} from "@/lib/travelConcierge";

type HotelTier = "Budget" | "Comfort" | "Luxury";

type Draft = {
  brief: string;
  budget: number;
  people: number;
  days: number;
  departureDate: string;
  airport: string;
  selectedType: string;
  hotelTier: HotelTier;
  maxFlightHours: number;
  controls: string[];
};

const TYPE_OPTIONS = [
  { label: "Honeymoon", tone: "Romantic, private, premium" },
  { label: "Partyurlaub", tone: "Nightlife, clubs, central" },
  { label: "Familienurlaub", tone: "Easy, calm, practical" },
  { label: "Wellness", tone: "Spa, quiet, recovery" },
  { label: "Kulturtrip", tone: "City, museums, food" },
  { label: "Adventure", tone: "Nature, action, movement" },
  { label: "Budget", tone: "Value, deal focus, smart picks" },
  { label: "Luxury", tone: "High-end, polished, smooth" },
] as const;

const HOTEL_TIERS: { key: HotelTier; title: string; text: string }[] = [
  { key: "Budget", title: "Budget", text: "Sauber, günstig, gute Lage" },
  { key: "Comfort", title: "Comfort", text: "Ausgewogen, modern, beliebt" },
  { key: "Luxury", title: "Luxury", text: "Premium, ruhig, hochwertig" },
];

const CONTROL_OPTIONS = [
  "Direktflug",
  "1 Stopp max.",
  "Gepäck inklusive",
  "Adults Only",
  "All Inclusive",
  "Spa",
  "Pool",
  "Strand nah",
  "Flexibles Datum",
  "Bestes Preis-Leistungs-Verhältnis",
] as const;

const DESTINATIONS: TravelDestination[] = [
  {
    name: "Mallorca",
    country: "Spain",
    region: "Europe",
    score: 96,
    price: 860,
    flight: 218,
    hotel: 642,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    summary: "Short flight, easy beach vibe, strong hotel selection.",
    tags: ["Beach", "Short flight", "Easy trip"],
  },
  {
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    score: 90,
    price: 1320,
    flight: 430,
    hotel: 890,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
    summary: "Premium service, winter sun and big-hotel comfort.",
    tags: ["Luxury", "Sun", "Service"],
  },
  {
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    score: 94,
    price: 1180,
    flight: 520,
    hotel: 660,
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80",
    summary: "Strong food scene, culture and very good value.",
    tags: ["Food", "Culture", "Value"],
  },
  {
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    score: 88,
    price: 1490,
    flight: 740,
    hotel: 750,
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=80",
    summary: "Nature, ocean and a real outdoors trip feeling.",
    tags: ["Nature", "Views", "Adventure"],
  },
];

const ROADMAP = [
  { icon: Brain, title: "AI profile", text: "Free text becomes a structured travel profile." },
  { icon: Plane, title: "Flights", text: "Compare price, duration, stops and baggage." },
  { icon: Hotel, title: "Hotels", text: "Match by vibe, location and value." },
  { icon: Clock3, title: "Itinerary", text: "Plan the stay day by day." },
  { icon: ListChecks, title: "Packing", text: "Generate a useful packing list." },
  { icon: ShieldCheck, title: "Travel rules", text: "Entry, visa, safety and weather." },
] as const;

const ACCOUNT_FEATURES = [
  "Favoriten speichern",
  "Suchverlauf behalten",
  "Eigene Reisen anlegen",
  "Budget pro Reise setzen",
  "Reise mit Freunden teilen",
  "Bewertungen und Notizen",
];

const HERO_FEATURES = [
  { icon: BadgeCheck, title: "Was die Website kann", text: "Reiseziele verstehen, Flüge und Hotels vergleichen, Budget ausrechnen und einen kompletten Plan bauen." },
  { icon: Search, title: "Buchen und suchen", text: "Oben auf Buchen klicken, alle Daten eintragen, dann mit Suchen sofort Ergebnisse bekommen." },
  { icon: Heart, title: "Destination wählen", text: "Nach dem Suchlauf ein Reiseziel öffnen und Hotel-Luxus sowie Kriterien anpassen." },
  { icon: Wallet, title: "Transparentes Budget", text: "Flug, Hotel und Puffer werden zusammen gerechnet, damit du sofort siehst, was es kostet." },
];

const initialDraft: Draft = {
  brief: "Warm weather, good food, no party, max 2200€, from Stuttgart, 7 days",
  budget: 2200,
  people: 2,
  days: 7,
  departureDate: "2026-09-10",
  airport: "Stuttgart",
  selectedType: "Budget",
  hotelTier: "Comfort",
  maxFlightHours: 8,
  controls: ["Direktflug", "Bestes Preis-Leistungs-Verhältnis"],
};

export default function TravelSaaSPlus() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [submitted, setSubmitted] = useState<Draft>(initialDraft);
  const [selectedName, setSelectedName] = useState<string>(DESTINATIONS[0].name);
  const [hasSearched, setHasSearched] = useState(false);

  const bookingRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const destinationRef = useRef<HTMLElement>(null);

  const previewProfile = useMemo(
    () =>
      parseTravelBrief({
        brief: composeBrief(draft),
        budget: draft.budget,
        people: draft.people,
        days: draft.days,
        departureDate: draft.departureDate,
        selectedType: draft.selectedType,
        controls: draft.controls,
      }),
    [draft],
  );

  const activeProfile = useMemo(
    () =>
      parseTravelBrief({
        brief: composeBrief(submitted),
        budget: submitted.budget,
        people: submitted.people,
        days: submitted.days,
        departureDate: submitted.departureDate,
        selectedType: submitted.selectedType,
        controls: submitted.controls,
      }),
    [submitted],
  );

  const ranked = useMemo(() => rankDestinations(DESTINATIONS, activeProfile), [activeProfile]);
  const active = useMemo<RankedDestination | undefined>(() => ranked.find((item) => item.name === selectedName) ?? ranked[0], [ranked, selectedName]);
  const account = useMemo(() => buildAccountPreview(activeProfile, ranked.length), [activeProfile, ranked.length]);
  const liveHooks = useMemo(() => buildLiveHooks(active, activeProfile), [active, activeProfile]);

  useEffect(() => {
    if (hasSearched) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hasSearched]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function composeAndSearch(nextDraft: Draft = draft, keepSelected = false) {
    setDraft(nextDraft);
    setSubmitted(nextDraft);
    const nextProfile = parseTravelBrief({
      brief: composeBrief(nextDraft),
      budget: nextDraft.budget,
      people: nextDraft.people,
      days: nextDraft.days,
      departureDate: nextDraft.departureDate,
      selectedType: nextDraft.selectedType,
      controls: nextDraft.controls,
    });
    const nextRanked = rankDestinations(DESTINATIONS, nextProfile);
    const nextName = keepSelected && nextRanked.some((item) => item.name === selectedName) ? selectedName : nextRanked[0]?.name ?? DESTINATIONS[0].name;
    setSelectedName(nextName);
    setHasSearched(true);
    window.requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleControl(control: string) {
    const nextControls = draft.controls.includes(control) ? draft.controls.filter((item) => item !== control) : [...draft.controls, control];
    composeAndSearch({ ...draft, controls: nextControls }, true);
  }

  function selectHotelTier(tier: HotelTier) {
    composeAndSearch({ ...draft, hotelTier: tier }, true);
  }

  function selectDestination(name: string) {
    setSelectedName(name);
    destinationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const topThree = hasSearched ? ranked.slice(0, 3) : ranked.slice(0, 3);
  const selectedResult = active ?? ranked[0];
  const totalEstimate = selectedResult?.totalPrice ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">TravelMatch</div>
              <div className="text-xs text-muted-foreground">Premium travel SaaS</div>
            </div>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => scrollTo(bookingRef)}>
              Buchen
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => scrollTo(resultsRef)}>
              Suchen
            </Button>
            <Button size="sm" className="rounded-full" onClick={() => scrollTo(destinationRef)}>
              Ziel ansehen
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Alles, was ein moderner Reiseplaner kann
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Finde den Urlaub.
                <br />
                Lass die Website den Rest machen.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Erst sehen, was die Website kann. Dann auf Buchen klicken, alle Angaben eintragen, auf Suchen gehen und direkt ein Reiseziel mit passenden Hotels, Flügen und Kriterien bekommen.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {HERO_FEATURES.map((item) => (
                <Card key={item.title} className="rounded-3xl p-5 shadow-soft">
                  <item.icon className="h-5 w-5 text-accent" />
                  <div className="mt-4 font-display text-lg font-semibold">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Was die Website kann</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Ein echter Reiseablauf</h2>
              </div>
              <Badge variant="secondary" className="rounded-full">Startup UI</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Reiseziele nach deinen Worten verstehen",
                "Flüge, Hotels und Budget zusammenrechnen",
                "Ein Reiseziel mit guter Passung auswählen",
                "Hotel-Luxus und Kriterien im Ziel anpassen",
                "Account-ready mit Favoriten und Verlauf",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroStat icon={Plane} label="Search" value="Buchen → Suchen" />
              <HeroStat icon={Hotel} label="Hotels" value="Luxus & Kriterien" />
              <HeroStat icon={Wallet} label="Budget" value="Alles ausgerechnet" />
            </div>
          </Card>
        </section>

        <section className="section-spacer grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Feature icon={Search} title="Natural language search" text="Schreibe einfach, was du willst: warm, ruhig, gutes Essen, wenig Touristen." />
          <Feature icon={MapPin} title="Worldwide coverage" text="Ziele, Flughäfen, Wetter und Reiseinfos können später weltweit angebunden werden." />
          <Feature icon={Hotel} title="Hotel intelligence" text="Lage, Luxus, Preis und Fit werden in einem klaren Vergleich dargestellt." />
          <Feature icon={CalendarDays} title="Vacation plan" text="Flug, Hotel, Tagesplan und Budget erscheinen zusammen als kompletter Urlaub." />
        </section>

        <section ref={bookingRef} className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Buchen</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">Alle Angaben eintragen</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Step 1</Badge>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Beschreibe deine Reise</div>
                <Textarea value={draft.brief} onChange={(e) => setField("brief", e.target.value)} className="mt-2 min-h-28 rounded-3xl border-border/70 bg-background/80 p-4 text-base" placeholder="Warm, gutes Essen, kein Partyurlaub, max 2200€, 7 Tage, ab Stuttgart" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <RangeCard label="Budget" value={draft.budget} min={500} max={9000} step={100} onChange={(value) => setField("budget", value)} formatter={currency} />
                <CounterCard label="Personen" value={draft.people} onMinus={() => setField("people", Math.max(1, draft.people - 1))} onPlus={() => setField("people", Math.min(12, draft.people + 1))} />
                <CounterCard label="Tage" value={draft.days} onMinus={() => setField("days", Math.max(3, draft.days - 1))} onPlus={() => setField("days", Math.min(21, draft.days + 1))} />
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Abflugdatum</div>
                  <Input type="date" value={draft.departureDate} onChange={(e) => setField("departureDate", e.target.value)} className="mt-3 h-12 rounded-2xl" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Abflugort</div>
                  <Input value={draft.airport} onChange={(e) => setField("airport", e.target.value)} className="mt-3 h-12 rounded-2xl" placeholder="Stuttgart, München, Frankfurt ..." />
                </div>
                <RangeCard label="Max. Flugzeit" value={draft.maxFlightHours} min={2} max={15} step={1} onChange={(value) => setField("maxFlightHours", value)} formatter={(n) => `${n}h`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {TYPE_OPTIONS.map((item) => {
                  const activeType = item.label === draft.selectedType;
                  return (
                    <button key={item.label} onClick={() => setField("selectedType", item.label)} className="text-left">
                      <div className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-soft ${activeType ? "border-primary bg-primary/5" : "border-border/70 bg-background/60"}`}>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Compass className="h-4 w-4" /></div>
                        <div className="mt-3 font-medium">{item.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.tone}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {HOTEL_TIERS.map((tier) => {
                  const activeTier = tier.key === draft.hotelTier;
                  return (
                    <button key={tier.key} onClick={() => selectHotelTier(tier.key)} className="text-left">
                      <div className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-soft ${activeTier ? "border-primary bg-primary/5" : "border-border/70 bg-background/60"}`}>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotel-Luxus</div>
                        <div className="mt-2 font-display text-xl font-semibold">{tier.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{tier.text}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotel-Kriterien</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {CONTROL_OPTIONS.map((control) => {
                    const active = draft.controls.includes(control);
                    return (
                      <button key={control} onClick={() => toggleControl(control)} className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${active ? "border-primary bg-primary/5 text-foreground" : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          {control}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => composeAndSearch(draft)}>
                  <Search className="h-4 w-4" />
                  Suchen
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => scrollTo(resultsRef)}>
                  Ergebnisse ansehen
                </Button>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                {previewSummary(previewProfile)}
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flow</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">So funktioniert die Seite</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Step 2</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "1. Du siehst zuerst, was die Website kann.",
                "2. Dann klickst du auf Buchen und füllst alles ein.",
                "3. Mit Suchen bekommst du passende Reiseziele berechnet.",
                "4. Danach öffnest du ein Ziel und passt Hotel-Luxus und Kriterien an.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-border/70">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80" alt="Travel" className="h-72 w-full object-cover" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroStat icon={Plane} label="Live" value="Flights soon" />
              <HeroStat icon={Hotel} label="Live" value="Hotels soon" />
              <HeroStat icon={Wallet} label="Live" value="Budget calc" />
            </div>
          </Card>
        </section>

        <section ref={resultsRef} className="section-spacer">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Suchen</p>
              <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Berechnete Reiseziele</h2>
            </div>
            <div className="text-sm text-muted-foreground">{hasSearched ? "Basierend auf deinen Angaben" : "Noch nicht gesucht"}</div>
          </div>

          {!hasSearched ? (
            <Card className="mt-5 rounded-[2rem] border-border/70 bg-card p-8 shadow-soft">
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <div className="font-display text-2xl font-semibold">Noch keine Suche gestartet</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">Fülle oben alles ein und klicke auf Suchen. Danach werden dir Reiseziele, Hotels und der passende Urlaub berechnet.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topThree.map((item) => <ResultCard key={item.name} destination={item} selected={false} onSelect={() => selectDestination(item.name)} />)}
                </div>
              </div>
            </Card>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {topThree.map((item, index) => (
                <button key={item.name} onClick={() => selectDestination(item.name)} className="text-left">
                  <ResultCard destination={item} selected={item.name === selectedName} rank={index + 1} onSelect={() => selectDestination(item.name)} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section ref={destinationRef} className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-elegant">
            <div className="relative">
              <img src={selectedResult?.image ?? DESTINATIONS[0].image} alt={selectedResult?.name ?? DESTINATIONS[0].name} className="h-80 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                {selectedResult?.country ?? DESTINATIONS[0].country}
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="font-display text-4xl font-semibold text-white">{selectedResult?.name ?? DESTINATIONS[0].name}</h3>
                <p className="mt-2 max-w-2xl text-sm text-white/85">{selectedResult?.summary ?? DESTINATIONS[0].summary}</p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatBox icon={Search} label="Match" value={`${selectedResult?.fitScore ?? 0}/100`} />
                <StatBox icon={Plane} label="Flug" value={currency(selectedResult?.flight ?? 0)} />
                <StatBox icon={Hotel} label="Hotel" value={currency(selectedResult?.hotel ?? 0)} />
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Warum passt es?</div>
                    <div className="mt-1 font-display text-2xl font-semibold">Kurz erklärt</div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">{selectedResult?.region}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {(selectedResult?.reasons ?? []).map((reason) => (
                    <div key={reason} className="flex items-start gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MiniInfo label="Gesamtpreis" value={currency(totalEstimate)} />
                <MiniInfo label="Budget" value={currency(submitted.budget)} />
                <MiniInfo label="Flugzeit" value={`${submitted.maxFlightHours}h max`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <PlanStat label="Flug + Hotel" value={currency((selectedResult?.flight ?? 0) + (selectedResult?.hotel ?? 0))} />
                <PlanStat label="Puffer" value={currency(Math.round(submitted.budget * 0.12))} />
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Optionen</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">Hotel-Luxus und Kriterien</h3>
                </div>
                <Badge variant="secondary" className="rounded-full">Step 3</Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {HOTEL_TIERS.map((tier) => {
                  const activeTier = tier.key === draft.hotelTier;
                  return (
                    <button key={tier.key} onClick={() => selectHotelTier(tier.key)} className="text-left">
                      <div className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-soft ${activeTier ? "border-primary bg-primary/5" : "border-border/70 bg-background/60"}`}>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotel-Luxus</div>
                        <div className="mt-2 font-display text-xl font-semibold">{tier.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{tier.text}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-border/70 bg-background/55 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kriterien wählen</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {CONTROL_OPTIONS.map((control) => {
                    const active = draft.controls.includes(control);
                    return (
                      <button key={control} onClick={() => toggleControl(control)} className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${active ? "border-primary bg-primary/5 text-foreground" : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          {control}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-border/70 bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ab jetzt ausgewertet</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Hotel-Luxus: <strong>{draft.hotelTier}</strong> · Kriterien: <strong>{draft.controls.join(", ")}</strong>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Was passiert nach dem Suchlauf</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">Auswahl, Rechnung und Plan</h3>
                </div>
                <Badge variant="secondary" className="rounded-full">Step 4</Badge>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Du klickst ein Reiseziel an und siehst die Details.",
                  "Du änderst Hotel-Luxus oder Kriterien direkt am Ziel.",
                  "Die Seite zeigt dir Flug, Hotel und den Gesamtpreis.",
                  "Später kommen Live-Flüge, Live-Hotels und Login dazu.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <HeroStat icon={Plane} label="Flight" value="Compare" />
                <HeroStat icon={Hotel} label="Hotel" value="Choose" />
                <HeroStat icon={CalendarDays} label="Plan" value="Generate" />
              </div>
            </Card>
          </div>
        </section>

        <section className="section-spacer grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accounts</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">Supabase-ready profile</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Ready</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <AccountStat label="Saved trips" value={String(account.savedTrips)} />
              <AccountStat label="Favorites" value={String(account.favorites)} />
              <AccountStat label="History" value={String(account.searchHistory)} />
              <AccountStat label="Shared" value={String(account.sharedTrips)} />
            </div>
            <div className="mt-5 rounded-3xl border border-border/60 bg-background/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next trip label</div>
              <div className="mt-2 font-display text-2xl font-semibold">{account.nextTripName}</div>
              <div className="mt-1 text-sm text-muted-foreground">Budget {account.budgetLabel} · Favoriten, Verlauf und Reisen später über Login.</div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live hooks</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">Was später live angehängt wird</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Backend</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {liveHooks.map((hook) => <HookCard key={hook.label} hook={hook} />)}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

function composeBrief(draft: Draft) {
  return [
    draft.brief,
    `Trip style ${draft.selectedType}`,
    `Hotel ${draft.hotelTier}`,
    `Flight under ${draft.maxFlightHours} hours`,
    draft.airport ? `from ${draft.airport}` : "",
    draft.controls.join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

function ResultCard({ destination, selected, rank, onSelect }: { destination: RankedDestination; selected: boolean; rank?: number; onSelect: () => void }) {
  return (
    <Card className={`overflow-hidden rounded-[1.75rem] border transition hover:-translate-y-1 hover:shadow-elegant ${selected ? "border-primary bg-primary/5" : "border-border/70 bg-card"}`}>
      <img src={destination.image} alt={destination.name} className="h-40 w-full object-cover" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-xl font-semibold">{rank ? `${rank}. ${destination.name}` : destination.name}</div>
            <div className="text-sm text-muted-foreground">{destination.country}</div>
          </div>
          <Badge variant="secondary" className="rounded-full">{destination.fitScore}/100</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{destination.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {destination.tags.map((tag) => <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Gesamt</div>
          <div className="font-display text-xl font-semibold">{currency(destination.totalPrice)}</div>
        </div>
        <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={onSelect}>
          Reiseziel öffnen
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function RangeCard({ label, value, min, max, step, formatter, onChange }: { label: string; value: number; min: number; max: number; step: number; formatter: (v: number) => string; onChange: (value: number) => void }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="font-medium">{formatter(value)}</div>
      </div>
      <input className="mt-4 w-full accent-[hsl(var(--primary))]" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
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

function HeroStat({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <Card className="rounded-3xl p-5 shadow-soft">
      <Icon className="h-5 w-5 text-accent" />
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </Card>
  );
}

function Feature({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <Card className="rounded-[1.75rem] border-border/70 bg-card p-5 shadow-soft">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 font-display text-2xl font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
    </Card>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold">{value}</div>
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

function StatBox({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-accent" />
      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-base font-semibold">{value}</div>
    </div>
  );
}

function AccountStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-4 text-center shadow-soft">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function HookCard({ hook }: { hook: LiveHook }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/60 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{hook.label}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{hook.method} · {hook.endpoint}</div>
        </div>
        <Badge variant="secondary" className="rounded-full">Ready</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{hook.note}</p>
      <div className="mt-3 rounded-2xl border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground">
        {JSON.stringify(hook.body, null, 2)}
      </div>
    </div>
  );
}

function previewSummary(profile: ReturnType<typeof parseTravelBrief>) {
  const first = profile.priorities[0] ? `Priority: ${profile.priorities[0]}.` : "Flexible profile.";
  return `${first} ${profile.vibe === "quiet" ? "Calm trip" : profile.vibe === "lively" ? "Livelier trip" : "Balanced trip"}. ` +
    `Flight target: ${profile.maxFlightHours ? `${profile.maxFlightHours}h max` : "open"}.`;
}

function currency(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

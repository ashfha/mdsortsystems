import { useMemo, useState, type ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Compass,
  Heart,
  Hotel,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  Waves,
  Clock3,
  Route,
  Search,
  Ticket,
  Globe,
  Loader2,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TYPES = [
  { label: "Honeymoon", tone: "Romantic, private, premium" },
  { label: "Partyurlaub", tone: "Nightlife, clubs, central" },
  { label: "Familienurlaub", tone: "Easy, calm, practical" },
  { label: "Wellness", tone: "Spa, quiet, recovery" },
  { label: "Kulturtrip", tone: "City, museums, food" },
  { label: "Adventure", tone: "Nature, action, movement" },
  { label: "Budget", tone: "Value, deal focus, smart picks" },
  { label: "Luxury", tone: "High-end, polished, smooth" },
] as const;

const CHECKS = [
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

const MOCK_DESTINATIONS = [
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
] as const;

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

export default function TravelSaaSPlus() {
  const [brief, setBrief] = useState("I want warm weather, good food, no party, max 2200€, from Stuttgart, 7 days");
  const [budget, setBudget] = useState(2200);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(7);
  const [departureDate, setDepartureDate] = useState("2026-09-10");
  const [selectedType, setSelectedType] = useState<(typeof TYPES)[number]>(TYPES[6]);
  const [selectedDestination, setSelectedDestination] = useState<(typeof MOCK_DESTINATIONS)[number]>(MOCK_DESTINATIONS[0]);
  const [controls, setControls] = useState<string[]>(["Direktflug", "Bestes Preis-Leistungs-Verhältnis"]);

  const summary = useMemo(() => {
    const total = selectedDestination.flight + selectedDestination.hotel + Math.round(budget * 0.12);
    return {
      total,
      flight: selectedDestination.flight,
      hotel: selectedDestination.hotel,
      fit: selectedDestination.score,
      label: selectedDestination.score >= 94 ? "Perfect fit" : selectedDestination.score >= 90 ? "Strong fit" : "Good fit",
    };
  }, [budget, selectedDestination]);

  const profileText = useMemo(
    () => `${people} Personen · ${days} Tage · ${currency(budget)} Budget · Abflug ${departureDate}`,
    [people, days, budget, departureDate],
  );

  function toggleControl(item: string) {
    setControls((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant"><Compass className="h-5 w-5" /></span>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">TravelMatch</div>
              <div className="text-xs text-muted-foreground">Premium travel SaaS</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="secondary" className="rounded-full px-3 py-2">Live search ready</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-2">Supabase ready</Badge>
            <Button size="sm" className="rounded-full">Get started</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Startup-grade travel concierge
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Find the trip.
                <br />
                Let the platform plan the rest.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                A calm, high-end travel experience with intelligent search, live offers, and a full vacation plan instead of endless tabs and guesswork.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat icon={BadgeCheck} label="Smart matching" value="Profile + preference" />
              <HeroStat icon={Plane} label="Live travel" value="Flights + hotels" />
              <HeroStat icon={Wallet} label="Budget first" value="Clear total cost" />
            </div>

            <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Travel brief</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Tell it in plain language</h2>
                </div>
                <Badge variant="secondary" className="rounded-full">AI profile</Badge>
              </div>

              <Textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="mt-4 min-h-28 rounded-3xl border-border/70 bg-background/80 p-4 text-base focus-visible:ring-2"
                placeholder="Warm weather, little tourists, great food, max 2000€, flight under 8 hours..."
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</div>
                    <div className="font-medium">{currency(budget)}</div>
                  </div>
                  <input className="mt-4 w-full accent-[hsl(var(--primary))]" type="range" min={500} max={9000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Travelers</div>
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</Button>
                    <div className="min-w-10 text-center text-lg font-semibold">{people}</div>
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setPeople((p) => Math.min(8, p + 1))}>+</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Departure date</div>
                  <Input value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="mt-3 h-12 rounded-2xl" />
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip length</div>
                  <div className="mt-3 flex items-center gap-3">
                    <input className="w-full accent-[hsl(var(--primary))]" type="range" min={3} max={21} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                    <div className="min-w-12 text-right font-semibold">{days}d</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {CHECKS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleControl(item)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${controls.includes(item) ? "border-primary bg-primary/5 text-foreground" : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${controls.includes(item) ? "text-primary" : "text-muted-foreground"}`} />
                      {item}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground">{profileText}</div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip design</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">A clean product feel</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Startup UI</div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {TYPES.map((item) => {
                  const active = item.label === selectedType.label;
                  return (
                    <button key={item.label} onClick={() => setSelectedType(item)} className="text-left">
                      <div className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-soft ${active ? "border-primary bg-primary/5" : "border-border/70 bg-background/60"}`}>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Compass className="h-4 w-4" /></div>
                        <div className="mt-3 font-medium">{item.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.tone}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-border/70 bg-card shadow-elegant">
              <div className="relative">
                <img src={selectedDestination.image} alt={selectedDestination.name} className="h-72 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                    <Waves className="h-3.5 w-3.5" />
                    Premium travel matching
                  </div>
                  <h3 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white">A modern travel assistant that feels like a product, not a demo.</h3>
                </div>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3">
                <MiniStat icon={Star} label="Curated" value="By preference" />
                <MiniStat icon={Users} label="Social" value="Friends / groups" />
                <MiniStat icon={Heart} label="Save" value="Favorites + history" />
              </div>
            </Card>
          </div>
        </section>

        <section className="section-spacer grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Feature icon={Search} title="Natural language search" text="Users write what they want in their own words." />
          <Feature icon={MapPin} title="Worldwide coverage" text="Cities, airports, weather, safety and entry rules." />
          <Feature icon={Hotel} title="Hotel intelligence" text="Location, rating, price, vibe and guest fit." />
          <Feature icon={CalendarDays} title="Vacation plan" text="Flights, hotels, daily plan and a clear budget." />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Concierge logic</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Why it feels like a real product</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <Line text="It explains why a destination fits the user." />
              <Line text="It compares flights, hotels and total cost." />
              <Line text="It creates an itinerary instead of only a recommendation." />
              <Line text="It keeps the interface calm, not template-like." />
            </div>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recommendation engine</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">What the system prepares next</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Roadmap</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ROADMAP.map((item) => (
                <div key={item.title} className="rounded-3xl border border-border/70 bg-background/60 p-4 shadow-soft">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h4 className="mt-4 font-display text-xl font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="pt-8">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destination spotlight</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">A curated shortlist with real travel language</h3>
              </div>
              <Button className="rounded-2xl">
                Explore more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {MOCK_DESTINATIONS.map((destination) => {
                const active = destination.name === selectedDestination.name;
                return (
                  <button key={destination.name} onClick={() => setSelectedDestination(destination)} className="text-left">
                    <div className={`overflow-hidden rounded-[1.75rem] border shadow-soft transition hover:-translate-y-1 hover:shadow-elegant ${active ? "border-primary bg-primary/5" : "border-border/70 bg-background/70"}`}>
                      <img src={destination.image} alt={destination.name} className="h-44 w-full object-cover" />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-display text-xl font-semibold">{destination.name}</div>
                            <div className="text-sm text-muted-foreground">{destination.country}</div>
                          </div>
                          <Badge variant="secondary" className="rounded-full">{destination.region}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{destination.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">{destination.tags.map((tag) => <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>)}</div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-sm text-muted-foreground">from</div>
                          <div className="font-display text-xl font-semibold">{currency(destination.price)}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="pt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected destination summary</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">{selectedDestination.name}</h3>
            <div className="mt-4 rounded-3xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">{selectedDestination.country} · {selectedDestination.region}</div>
                  <div className="mt-1 font-display text-2xl font-semibold">{matchLabel}</div>
                </div>
                <Badge variant="secondary" className="rounded-full">{summary.fit}/100</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat icon={Search} label="Match" value={`${summary.fit}/100`} />
                <MiniStat icon={Wallet} label="Flight" value={currency(summary.flight)} />
                <MiniStat icon={Hotel} label="Hotel" value={currency(summary.hotel)} />
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{selectedDestination.summary}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDestination.tags.map((tag) => <Badge key={tag} className="rounded-full">{tag}</Badge>)}
            </div>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vacation plan</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">What the platform will generate</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">Next step</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PlanBox icon={Plane} title="Flight choice" text="Best price, best value and fastest option." />
              <PlanBox icon={Hotel} title="Hotel shortlist" text="Matched by vibe, budget and location." />
              <PlanBox icon={Clock3} title="Day-by-day plan" text="A sensible itinerary for the whole stay." />
              <PlanBox icon={ListChecks} title="Packing list" text="Personalized essentials for the trip." />
              <PlanBox icon={Route} title="Map layer" text="Restaurants, beaches and sights on a map." />
              <PlanBox icon={ShieldCheck} title="Rules & safety" text="Entry, visa, weather and security context." />
            </div>

            <div className="mt-5 rounded-3xl border border-border/60 bg-background/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated total</div>
              <div className="mt-2 font-display text-3xl font-semibold">{currency(summary.total)}</div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                This combines flight, hotel and a small buffer so the plan feels like a real travel budget.
              </p>
            </div>
          </Card>
        </section>

        <section className="pt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account preview</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Supabase-ready user experience</h3>
            <div className="mt-5 space-y-3">
              {ACCOUNT_FEATURES.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-elegant">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Build phases</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">From concept to SaaS</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ROADMAP.map((item) => (
                <div key={item.title} className="rounded-3xl border border-border/60 bg-background/60 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><item.icon className="h-4 w-4" /></div>
                  <h4 className="mt-4 font-display text-xl font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
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

function MiniStat({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Icon className="h-3.5 w-3.5 text-accent" />{label}</div>
      <div className="mt-2 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function Line({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
      <BadgeCheck className="mt-0.5 h-4 w-4 text-accent" />
      <span>{text}</span>
    </div>
  );
}

function PlanBox({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/60 p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Icon className="h-4 w-4" /></div>
      <h4 className="mt-4 font-display text-xl font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function currency(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

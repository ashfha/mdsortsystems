import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Compass,
  Heart,
  Hotel,
  MapPin,
  Plane,
  Search,
  Sparkles,
  Star,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TYPE_CARDS = [
  { label: "Honeymoon", description: "Privat, ruhig, hochwertig, schöne Sonnenuntergänge." },
  { label: "Partyurlaub", description: "Kurze Wege, Nachtleben, Beach Clubs, zentrale Hotels." },
  { label: "Familienurlaub", description: "Ruhige Hotels, Pool, einfache Transfers, wenig Stress." },
  { label: "Wellness", description: "Spa, gutes Essen, langsames Tempo, gute Erholung." },
  { label: "Kulturtrip", description: "Altstadt, Museen, Architektur und gute Restaurants." },
  { label: "Adventure", description: "Natur, Aktivität, Ausflüge und besondere Erlebnisse." },
];

const CHECKLISTS = [
  "Direktflug",
  "1 Stopp maximal",
  "Gepäck inklusive",
  "Adults Only",
  "All Inclusive",
  "Spa",
  "Pool",
  "Strand nah",
  "Bester Preis",
  "Bestes Preis-Leistungs-Verhältnis",
];

export default function TravelSaaS() {
  const [brief, setBrief] = useState("I want warm weather, good food, no party, max 2200€, from Stuttgart, 7 days");
  const [budget, setBudget] = useState(2200);
  const [people, setPeople] = useState(2);

  const preview = useMemo(
    () => `${people} Personen · bis ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(budget)} · ${brief}`,
    [brief, budget, people],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Premium travel SaaS foundation
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
                    <div className="font-medium">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(budget)}</div>
                  </div>
                  <input
                    className="mt-4 w-full accent-[hsl(var(--primary))]"
                    type="range"
                    min={500}
                    max={9000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
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

              <div className="mt-4 rounded-3xl border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground">
                {preview}
              </div>
            </Card>
          </div>

          <Card className="rounded-[2rem] border-border/70 bg-card p-5 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip design</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">A clean product feel</h2>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Startup UI</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TYPE_CARDS.map((item) => (
                <div key={item.label} className="rounded-3xl border border-border/70 bg-background/60 p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Compass className="h-4 w-4" /></div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {CHECKLISTS.map((item) => (
                <label key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/55 px-4 py-3 text-sm transition hover:border-primary/40">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </Card>
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

          <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-elegant">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
                alt="Travel overview"
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
        </section>

        <section className="pt-8">
          <Card className="rounded-[2rem] border-border/70 bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Roadmap</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">From trip search to full concierge</h3>
              </div>
              <Button className="rounded-2xl">
                Continue build
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Live flights and hotels",
                "Weather and safety info",
                "Visa and entry checks",
                "AI itinerary generation",
                "Packing list and PDF export",
                "Supabase accounts and saved trips",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/60 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
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

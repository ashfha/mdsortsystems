import { useEffect, useMemo, useState } from "react";
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
  LogIn,
  LogOut,
  MapPin,
  MoonStar,
  Plane,
  Search,
  Sparkles,
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
  type TravelBundle,
  type TravelRecommendation,
} from "@/lib/travelMatch";

type SessionUser = { id: string; email: string | null };
type LiveFlightOffer = { source: "live" | "fallback"; provider: string; route: string; priceEur: number; durationHours: number; stops: number; departureDate: string; note: string };
type LiveHotelOffer = { source: "live" | "fallback"; provider: string; name: string; nightlyEur: number; rating: number; neighborhood: string; note: string };
type FlightChoice = { id: string; title: string; priceEur: number; durationHours: number; stops: number; tag: string; bookingUrl: string; note: string };
type HotelChoice = { id: string; title: string; nightlyEur: number; rating: number; tag: string; bookingUrl: string; image: string; note: string };
type RecView = TravelRecommendation & { liveFlight: LiveFlightOffer; liveHotel: LiveHotelOffer; flightChoices: FlightChoice[]; hotelChoices: HotelChoice[]; gallery: string[] };
type BundleView = { parsed: TravelBundle["parsed"]; recommendations: RecView[] };
type SavedCard = { key: string; rec: RecView };

const PRESETS = [
  "Beach + relaxation, 1 week in March, under 2500€, from Stuttgart, no partying",
  "Solo trip Europe in October, city + food + walkable, mid-range budget",
  "Family of 4 to somewhere tropical, spring break, nature and beach",
  "Couple honeymoon, luxury, private beach, 10 days from London",
  "Warm, good food, modern hotel, not too touristy, max 1800€",
  "Need a short city break with great nightlife and airport close by",
];

const STORAGE = { prompt: "travelmatch:lastPrompt", history: "travelmatch:history", favorites: "travelmatch:favorites" };
const INITIAL_PROMPT = "Beach, warm weather, nice hotels, good food, 7-10 days, max 2000€, from Germany";

const SCENES = {
  beach: [
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  ],
  city: [
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  ],
};

export default function TravelMatchPage() {
  const [prompt, setPrompt] = useState(() => readText(STORAGE.prompt, INITIAL_PROMPT));
  const [bundle, setBundle] = useState<BundleView>(() => toView(recommendDestinations(readText(STORAGE.prompt, INITIAL_PROMPT))));
  const [selectedId, setSelectedId] = useState<string>(() => toView(recommendDestinations(readText(STORAGE.prompt, INITIAL_PROMPT))).recommendations[0]?.id ?? "");
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(0);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [favorites, setFavorites] = useState<SavedCard[]>(() => readFavorites());
  const [history, setHistory] = useState<string[]>(() => readHistory());
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);

  const selected = useMemo(() => bundle.recommendations.find((r) => r.id === selectedId) ?? bundle.recommendations[0], [bundle.recommendations, selectedId]);
  const selectedFlight = selected?.flightChoices[selectedFlightIndex] ?? selected?.flightChoices[0];
  const selectedHotel = selected?.hotelChoices[selectedHotelIndex] ?? selected?.hotelChoices[0];
  const selectedSaved = selected ? favorites.some((item) => item.key === destinationKey(selected.name, selected.country)) : false;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSessionUser(user ? { id: user.id, email: user.email ?? null } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setSessionUser(user ? { id: user.id, email: user.email ?? null } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionUser) void syncCloudData(sessionUser.id);
  }, [sessionUser]);

  useEffect(() => {
    setSelectedFlightIndex(0);
    setSelectedHotelIndex(0);
  }, [selectedId]);

  async function syncCloudData(userId: string) {
    try {
      const { data: savedRows } = await supabase
        .from("saved_destinations")
        .select("destination_key,destination_name,country,image_url,match_score,snapshot,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (savedRows?.length) {
        const cloudFavorites: SavedCard[] = savedRows.map((row: any) => ({
          key: row.destination_key,
          rec: normalizeSnapshot(row.snapshot, {
            id: row.destination_key,
            name: row.destination_name,
            country: row.country ?? "",
            image: row.image_url ?? "",
            matchScore: Number(row.match_score ?? 0),
          }),
        }));
        setFavorites(cloudFavorites);
      }

      const { data: searches } = await supabase
        .from("searches")
        .select("raw_input,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (searches?.length) setHistory(searches.map((row: any) => row.raw_input).filter(Boolean));
      setCloudReady(true);
    } catch (error) {
      console.warn(error);
    }
  }

  async function generateTrip(value = prompt) {
    const clean = value.trim();
    if (!clean) return;
    setGenerating(true);
    setPrompt(clean);
    writeText(STORAGE.prompt, clean);
    writeText(STORAGE.history, JSON.stringify([clean, ...readHistory().filter((x) => x !== clean)].slice(0, 10)));
    setHistory(readHistory());

    try {
      const estimated = recommendDestinations(clean);
      const view = await enrichBundle(estimated);
      setBundle(view);
      setSelectedId(view.recommendations[0]?.id ?? "");
      if (sessionUser) void persistSearch(sessionUser.id, clean, view);
    } finally {
      setGenerating(false);
    }
  }

  async function enrichBundle(base: TravelBundle): Promise<BundleView> {
    const recommendations = await Promise.all(
      base.recommendations.map(async (rec) => {
        const [weather, liveFlight, liveHotel] = await Promise.all([
          fetchLiveWeather({
            destinationName: rec.name,
            country: rec.country,
            fallback: {
              source: "fallback",
              period: rec.weather.period,
              highC: rec.weather.highC,
              lowC: rec.weather.lowC,
              rain: rec.weather.rain,
              summary: rec.weather.summary,
            },
          }),
          fetchFlightOffer(rec, base.parsed),
          fetchHotelOffer(rec, base.parsed),
        ]);

        const gallery = makeGallery(rec);
        const flightChoices = makeFlightChoices(rec, base.parsed, liveFlight);
        const hotelChoices = makeHotelChoices(rec, base.parsed, liveHotel, gallery);

        return {
          ...rec,
          weather: {
            period: weather.period,
            highC: weather.highC,
            lowC: weather.lowC,
            rain: weather.rain,
            summary: weather.source === "live" ? weather.summary : rec.weather.summary,
          },
          liveFlight,
          liveHotel,
          flightChoices,
          hotelChoices,
          gallery,
        } satisfies RecView;
      }),
    );

    return { parsed: base.parsed, recommendations };
  }

  async function fetchFlightOffer(rec: TravelRecommendation, parsed: TravelBundle["parsed"]): Promise<LiveFlightOffer> {
    try {
      const { data, error } = await supabase.functions.invoke("travel-flight-search", {
        body: {
          destinationIata: rec.iata,
          departureIata: parsed.departure ?? undefined,
          travelers: parsed.travelers ?? 1,
          durationDays: parsed.durationDays ?? 7,
          budgetMax: parsed.budgetMax ?? null,
          month: parsed.month ?? null,
        },
      });
      if (error || !data) throw error ?? new Error("No flight data");
      return data as LiveFlightOffer;
    } catch {
      const seed = `${parsed.departure ?? "FRA"}:${rec.iata}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      return {
        source: "fallback",
        provider: "Estimated",
        route: `${parsed.departure ?? "FRA"} → ${rec.iata}`,
        priceEur: 120 + (seed % 680),
        durationHours: Math.round(2.5 + (seed % 14)),
        stops: seed % 3 === 0 ? 0 : 1,
        departureDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        note: "Fallback estimate used because a live flight provider is not available.",
      };
    }
  }

  async function fetchHotelOffer(rec: TravelRecommendation, parsed: TravelBundle["parsed"]): Promise<LiveHotelOffer> {
    try {
      const { data, error } = await supabase.functions.invoke("travel-hotel-search", {
        body: {
          destinationIata: rec.iata,
          destinationName: rec.name,
          luxuryLevel: parsed.luxury ?? "midrange",
          travelers: parsed.travelers ?? 1,
          durationDays: parsed.durationDays ?? 7,
        },
      });
      if (error || !data) throw error ?? new Error("No hotel data");
      return data as LiveHotelOffer;
    } catch {
      const seed = rec.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const tierMultiplier = { budget: 0.7, midrange: 1, premium: 1.6, luxury: 2.3 }[parsed.luxury ?? "midrange"];
      return {
        source: "fallback",
        provider: "Estimated",
        name: `Curated stay in ${rec.name}`,
        nightlyEur: Math.round((80 + (seed % 120)) * tierMultiplier),
        rating: Math.min(5, Math.round((3.8 + (seed % 13) / 10) * 10) / 10),
        neighborhood: "Central / premium area",
        note: "Fallback estimate used because a live hotel provider is not available.",
      };
    }
  }

  async function persistSearch(userId: string, rawInput: string, next: BundleView) {
    try {
      await supabase.from("searches").insert({
        user_id: userId,
        raw_input: rawInput,
        parsed_prefs: next.parsed as any,
      });
    } catch (error) {
      console.warn(error);
    }
  }

  async function toggleFavorite(rec: RecView) {
    const key = destinationKey(rec.name, rec.country);
    const exists = favorites.some((item) => item.key === key);

    if (exists) {
      const next = favorites.filter((item) => item.key !== key);
      setFavorites(next);
      writeFavorites(next);
      if (sessionUser) {
        await supabase.from("saved_destinations").delete().eq("user_id", sessionUser.id).eq("destination_key", key);
      }
      toast.message("Removed from saved trips");
      return;
    }

    const next = [{ key, rec }, ...favorites];
    setFavorites(next);
    writeFavorites(next);
    toast.success("Saved to favorites");

    if (sessionUser) {
      await supabase.from("saved_destinations").upsert({
        user_id: sessionUser.id,
        destination_key: key,
        destination_name: rec.name,
        country: rec.country,
        image_url: rec.image,
        match_score: rec.matchScore,
        snapshot: rec as any,
      });
    }
  }

  async function signInWithMagicLink() {
    const email = authEmail.trim();
    if (!email) return;
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success("Magic link sent");
      setAuthOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSessionUser(null);
    toast.success("Signed out");
  }

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant"><Compass className="h-5 w-5" /></span>
            <div>
              <div className="font-display text-lg font-semibold leading-none tracking-tight">TravelMatch AI</div>
              <div className="text-xs text-muted-foreground">Find the trip that fits you</div>
            </div>
          </a>
          <div className="hidden items-center gap-2 md:flex">
            {sessionUser ? (
              <>
                <div className="rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">{sessionUser.email ?? "Signed in"}</div>
                <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" />Sign out</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}><LogIn className="h-4 w-4" />Sign in</Button>
            )}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4">
        <section className="grid gap-10 pb-12 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div className="space-y-6 fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft"><Sparkles className="h-3.5 w-3.5 text-accent" />AI travel matching with live weather, flights and hotels</div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">Tell us your vibe.<br />We&apos;ll find where to go.</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">Paste a few bullet points and TravelMatch AI turns them into a destination shortlist with a clear match score, real images, hotel choices, and live booking links.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[[Sparkles, "Describe it", "Budget, dates, departure, mood."], [BadgeCheck, "Match score", "See why each place fits."], [BarChart3, "Value-first", "Price-performance over cheapest."]].map(([Icon, title, body]) => (
                <Card key={title as string} className="rounded-3xl p-5 shadow-soft">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></div>
                  <div className="font-display text-lg font-semibold">{title as string}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{body as string}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-card p-5 shadow-elegant md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip brief</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">One message is enough</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">Local + cloud sync</div>
              </div>

              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Warm weather, 7 days, max 2000€, from Germany, great hotel, good food, not too touristy…" className="min-h-36 resize-none rounded-3xl border-border/70 bg-background/80 p-4 text-base shadow-none focus-visible:ring-2" />
              <div className="flex flex-wrap gap-2">{PRESETS.map((preset) => (<button key={preset} type="button" onClick={() => setPrompt(preset)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{preset}</button>))}</div>
              <div className="flex flex-col gap-3 sm:flex-row"><Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => void generateTrip()} disabled={generating}>{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Find my trip</Button><Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setAuthOpen(true)}>Save cloud history</Button></div>
              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-background/60 p-3"><MiniStat label="Trips matched" value={bundle.recommendations.length.toString()} /><MiniStat label="Saved" value={favorites.length.toString()} /><MiniStat label="Cloud" value={cloudReady ? "Ready" : "Local"} /></div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-4 md:grid-cols-3">
          <InfoPanel icon={Compass} title="You write, we parse" body="The app extracts budget, month, duration, departure city, climate, and trip vibe from free text or bullet points." />
          <InfoPanel icon={Plane} title="We rank the destinations" body="Each recommendation gets a match score and a value score so the shortlist feels useful, not random." />
          <InfoPanel icon={Bookmark} title="Save the ones you like" body="Favorites and search history stay in your browser and sync to Supabase when you sign in." />
        </section>

        <section id="results" className="grid gap-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recommended places</p>
                <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Your shortlist</h2>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{bundle.parsed.month ? monthLabel(bundle.parsed.month) : "Flexible timing"}</Badge>
            </div>

            <div className="grid gap-4">
              {bundle.recommendations.map((rec) => {
                const active = rec.id === selected?.id;
                const isFav = favorites.some((item) => item.key === destinationKey(rec.name, rec.country));
                return (
                  <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="text-left">
                    <Card className={`group overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:shadow-elegant ${active ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card"}`}>
                      <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr]">
                        <div className="relative overflow-hidden rounded-2xl">
                          <img src={rec.image} alt={rec.name} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-full" />
                          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-soft backdrop-blur">{rec.country}</div>
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
                            <Badge className="rounded-full">Value {rec.valueScore}/100</Badge>
                            <Badge variant="secondary" className="rounded-full">{formatEuro(rec.estimatedTotalEur)} total</Badge>
                            <Badge variant="secondary" className="rounded-full">{rec.weather.highC}° / {rec.weather.lowC}°</Badge>
                            {isFav && <Badge variant="secondary" className="rounded-full"><Heart className="mr-1 h-3 w-3 fill-current" /> Saved</Badge>}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {rec.reasons.slice(0, 2).map((reason) => (
                              <div key={reason} className="flex gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); void toggleFavorite(rec); }}><Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />{isFav ? "Saved" : "Save"}</Button>
                            <Button variant="outline" size="sm" className="rounded-2xl">Details <ChevronRight className="h-4 w-4" /></Button>
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatBox icon={Plane} label="Flight" value={formatEuro(selectedFlight?.priceEur ?? selected.liveFlight.priceEur)} />
                      <StatBox icon={Hotel} label="Hotel / nt" value={formatEuro(selectedHotel?.nightlyEur ?? selected.liveHotel.nightlyEur)} />
                      <StatBox icon={CloudSun} label="Total" value={formatEuro(selected.estimatedTotalEur)} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {selected.gallery.map((image, index) => (
                        <div key={image} className={`overflow-hidden rounded-2xl border border-border/60 ${index === 0 ? "sm:col-span-2" : ""}`}><img src={image} alt={`${selected.name} scene ${index + 1}`} className="h-32 w-full object-cover" /></div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Why it fits</div><div className="mt-1 font-display text-xl font-semibold">Explanation</div></div><MoonStar className="h-5 w-5 text-accent" /></div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">{selected.reasons.map((reason) => (<li key={reason} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{reason}</span></li>))}</ul>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live flight</div>
                            <div className="mt-1 font-medium">{selected.liveFlight.provider}</div>
                          </div>
                          <Badge variant={selected.liveFlight.source === "live" ? "default" : "secondary"} className="rounded-full">{selected.liveFlight.source}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.liveFlight.route} · {selected.liveFlight.durationHours}h · {selected.liveFlight.stops} stop(s)</p>
                        <p className="mt-2 text-sm text-muted-foreground">Departure: {selected.liveFlight.departureDate}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.liveFlight.note}</p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => openUrl(flightSearchUrl(bundle.parsed.departure ?? "FRA", selected.iata))}>Open flight search</Button>
                          <Button size="sm" className="rounded-2xl" onClick={() => openUrl(flightSearchUrl(bundle.parsed.departure ?? "FRA", selected.iata))}>Book flight</Button>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live hotel</div>
                            <div className="mt-1 font-medium">{selected.liveHotel.name}</div>
                          </div>
                          <Badge variant={selected.liveHotel.source === "live" ? "default" : "secondary"} className="rounded-full">{selected.liveHotel.source}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.liveHotel.neighborhood}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.liveHotel.rating}/5 · {formatEuro(selected.liveHotel.nightlyEur)} / night</p>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.liveHotel.note}</p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => openUrl(hotelBookingUrl(selected.name, bundle.parsed.travelers ?? 2))}>View hotel deals</Button>
                          <Button size="sm" className="rounded-2xl" onClick={() => openUrl(selectedHotel?.bookingUrl ?? hotelBookingUrl(selected.name, bundle.parsed.travelers ?? 2))}>Book hotel</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Weather for {selected.weather.period}</div><p className="mt-2 text-sm text-muted-foreground">{selected.weather.summary}. Expect about {selected.weather.highC}°C / {selected.weather.lowC}°C.</p></div>
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4"><div className="font-medium">Score breakdown</div><div className="mt-3 space-y-2 text-sm"><Metric label="Climate" value={selected.scoreBreakdown.climate} /><Metric label="Vibe" value={selected.scoreBreakdown.vibe} /><Metric label="Budget" value={selected.scoreBreakdown.budget} /><Metric label="Ease" value={selected.scoreBreakdown.ease} /><Metric label="Value" value={selected.scoreBreakdown.value} /></div></div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Activities</h4>
                        <div className="mt-2 flex flex-wrap gap-2">{selected.activities.map((item) => (<Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>))}</div>
                      </div>
                      <div>
                        <h4 className="font-medium">Smart tips</h4>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{selected.tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Choose a flight</div><div className="mt-1 font-display text-xl font-semibold">Options</div></div><Plane className="h-5 w-5 text-accent" /></div>
                      <div className="mt-4 grid gap-3">
                        {selected.flightChoices.map((choice, index) => (
                          <button key={choice.id} onClick={() => setSelectedFlightIndex(index)} className={`rounded-2xl border p-4 text-left transition ${selectedFlightIndex === index ? "border-primary bg-primary/5" : "border-border/60 bg-background/50 hover:bg-background"}`}>
                            <div className="flex items-start justify-between gap-3"><div><div className="font-medium">{choice.title}</div><div className="mt-1 text-sm text-muted-foreground">{choice.tag}</div></div><Badge variant="secondary" className="rounded-full">{formatEuro(choice.priceEur)}</Badge></div>
                            <div className="mt-2 text-sm text-muted-foreground">{choice.durationHours}h · {choice.stops} stop(s) · {choice.note}</div>
                            <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); openUrl(choice.bookingUrl); }}>Search flights</Button><Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); setSelectedFlightIndex(index); openUrl(choice.bookingUrl); }}>Choose</Button></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Choose a hotel</div><div className="mt-1 font-display text-xl font-semibold">Options</div></div><Hotel className="h-5 w-5 text-accent" /></div>
                      <div className="mt-4 grid gap-3">
                        {selected.hotelChoices.map((choice, index) => (
                          <button key={choice.id} onClick={() => setSelectedHotelIndex(index)} className={`overflow-hidden rounded-2xl border text-left transition ${selectedHotelIndex === index ? "border-primary bg-primary/5" : "border-border/60 bg-background/50 hover:bg-background"}`}>
                            <div className="grid gap-0 sm:grid-cols-[132px_1fr]"><img src={choice.image} alt={choice.title} className="h-32 w-full object-cover sm:h-full" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-medium">{choice.title}</div><div className="mt-1 text-sm text-muted-foreground">{choice.tag}</div></div><Badge variant="secondary" className="rounded-full">{formatEuro(choice.nightlyEur)} / night</Badge></div><div className="mt-2 text-sm text-muted-foreground">{choice.rating}/5 · {choice.note}</div><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); openUrl(choice.bookingUrl); }}>View deals</Button><Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); setSelectedHotelIndex(index); openUrl(choice.bookingUrl); }}>Book hotel</Button></div></div></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-2xl" onClick={() => void toggleFavorite(selected)}><Heart className={`h-4 w-4 ${selectedSaved ? "fill-current" : ""}`} />{selectedSaved ? "Saved" : "Save destination"}</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => openUrl(hotelBookingUrl(selected.name, bundle.parsed.travelers ?? 2))}>Compare more hotels</Button>
                    </div>
                  </div>
                </>
              ) : <div className="p-8 text-center text-muted-foreground">Run a search to see destination details here.</div>}
            </Card>

            <Card id="account" className="rounded-[2rem] border-border/70 bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p><h3 className="mt-1 font-display text-2xl font-semibold">Cloud sync</h3></div><Users className="h-5 w-5 text-accent" /></div>
              <p className="mt-3 text-sm text-muted-foreground">Sign in once, then your saved trips and search history can be stored in Supabase. Local mode still works without an account.</p>
              <div className="mt-4 flex items-center gap-2">{sessionUser ? <Badge className="rounded-full px-3 py-2">{sessionUser.email ?? "Signed in"}</Badge> : <Button onClick={() => setAuthOpen(true)}>Enable cloud sync</Button>}</div>
            </Card>
          </div>
        </section>

        <section id="saved" className="py-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved trips</p><h2 className="mt-1 font-display text-3xl font-semibold">Favorites</h2></div><div className="text-sm text-muted-foreground">{favorites.length} saved</div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.length ? favorites.map((item) => (
              <Card key={item.key} className="overflow-hidden rounded-[1.75rem] border-border/70 bg-card shadow-soft">
                <img src={item.rec.image} alt={item.rec.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3"><div><div className="font-display text-xl font-semibold">{item.rec.name}</div><div className="text-sm text-muted-foreground">{item.rec.country}</div></div><Badge variant="secondary" className="rounded-full">{item.rec.matchScore}</Badge></div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" /> {formatEuro(item.rec.estimatedTotalEur)} total</div>
                </div>
              </Card>
            )) : <Card className="rounded-[1.75rem] border-dashed p-8 text-center text-muted-foreground md:col-span-2 xl:col-span-3">Save a destination to build your shortlist.</Card>}
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Search history</p><h2 className="mt-1 font-display text-3xl font-semibold">Recent prompts</h2></div></div>
          <div className="mt-5 flex flex-wrap gap-2">{history.length ? history.map((item) => (<button key={item} onClick={() => void generateTrip(item)} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{item}</button>)) : <div className="text-sm text-muted-foreground">Your recent searches will appear here.</div>}</div>
        </section>

        <section className="pb-20 pt-10">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built to decide faster</p><h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">No more tab chaos. One place, one shortlist.</h2><p className="mt-3 text-muted-foreground">TravelMatch AI now shows real images, hotel choices, and booking actions, while keeping the layout calm and editorial instead of AI-generic.</p></div>
              <div className="flex gap-3"><Button onClick={() => setAuthOpen(true)} className="rounded-2xl"><Zap className="h-4 w-4" />Save cloud history</Button><Button variant="outline" className="rounded-2xl" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</Button></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-background/70 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p>TravelMatch AI — travel recommendations that feel personal and believable.</p>
          <p>Local mode works immediately. Cloud sync activates after sign in.</p>
        </div>
      </footer>

      {authOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md rounded-[2rem] p-6 shadow-elegant">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Supabase</p><h3 className="mt-1 font-display text-2xl font-semibold">Enable cloud sync</h3></div><button onClick={() => setAuthOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div>
            <p className="mt-3 text-sm text-muted-foreground">Enter your email and we&apos;ll send a magic link. Search history and favorites can then sync to Supabase.</p>
            <div className="mt-5 space-y-3"><Input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-2xl" /><Button className="h-12 w-full rounded-2xl" onClick={() => void signInWithMagicLink()} disabled={authBusy}>{authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Send magic link</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}

function flightSearchUrl(from: string, to: string) {
  return `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(from)}%20to%20${encodeURIComponent(to)}`;
}

function hotelBookingUrl(destination: string, travelers = 2) {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", destination);
  url.searchParams.set("group_adults", String(Math.max(1, travelers)));
  return url.toString();
}

function makeGallery(rec: TravelRecommendation) {
  const key = rec.vibes.includes("city") ? "city" : rec.vibes.includes("nature") ? "nature" : "beach";
  return [rec.image, ...SCENES[key]];
}

function makeFlightChoices(rec: TravelRecommendation, parsed: TravelBundle["parsed"], liveFlight: LiveFlightOffer): FlightChoice[] {
  const from = parsed.departure ?? "FRA";
  const to = rec.iata ?? rec.name;
  return [
    { id: "best-value", title: "Best value", priceEur: liveFlight.priceEur, durationHours: liveFlight.durationHours, stops: liveFlight.stops, tag: "Balanced price and comfort", bookingUrl: flightSearchUrl(from, to), note: liveFlight.note },
    { id: "cheapest", title: "Cheapest", priceEur: Math.round(liveFlight.priceEur * 0.88), durationHours: Number((liveFlight.durationHours + 1).toFixed(1)), stops: Math.min(2, liveFlight.stops + 1), tag: "Lower fare, more connections", bookingUrl: flightSearchUrl(from, to), note: "Usually a bit slower but easier on budget." },
    { id: "fastest", title: "Fastest", priceEur: Math.round(liveFlight.priceEur * 1.14), durationHours: Math.max(1, Number((liveFlight.durationHours - 1).toFixed(1))), stops: 0, tag: "Less time in transit", bookingUrl: flightSearchUrl(from, to), note: "A smoother flight with fewer stops." },
  ];
}

function makeHotelChoices(rec: TravelRecommendation, parsed: TravelBundle["parsed"], liveHotel: LiveHotelOffer, gallery: string[]): HotelChoice[] {
  const destination = rec.name;
  const travelers = parsed.travelers ?? 2;
  return [
    { id: "value", title: `${destination} value stay`, nightlyEur: Math.max(50, Math.round(liveHotel.nightlyEur * 0.82)), rating: Math.min(5, Math.round((liveHotel.rating - 0.2) * 10) / 10), tag: "Best price-performance", bookingUrl: hotelBookingUrl(destination, travelers), image: gallery[1], note: "Good if you want to save budget for food and activities." },
    { id: "balanced", title: `${destination} balanced pick`, nightlyEur: liveHotel.nightlyEur, rating: liveHotel.rating, tag: "Most like your match score", bookingUrl: hotelBookingUrl(destination, travelers), image: gallery[0], note: liveHotel.note },
    { id: "premium", title: `${destination} premium stay`, nightlyEur: Math.round(liveHotel.nightlyEur * 1.38), rating: Math.min(5, Math.round((liveHotel.rating + 0.2) * 10) / 10), tag: "More comfort, nicer setting", bookingUrl: hotelBookingUrl(destination, travelers), image: gallery[2], note: "For travelers who prefer a more polished stay." },
  ];
}

function InfoPanel({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="rounded-3xl p-6 shadow-soft">
      <Icon className="h-5 w-5 text-accent" />
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}/100</span></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-xl font-semibold">{value}</div></div>;
}

function ScoreCircle({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background text-center shadow-soft"><div><div className="font-display text-lg font-semibold leading-none">{s}</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</div></div></div>;
}

function StatBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center"><Icon className="mx-auto h-4 w-4 text-accent" /><div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div><div className="mt-1 font-display text-base font-semibold">{value}</div></div>;
}

function readText(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function writeText(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function readHistory() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(STORAGE.history);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function readFavorites(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE.favorites);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: SavedCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE.favorites, JSON.stringify(favorites));
}

function normalizeSnapshot(
  snapshot: any,
  fallback: { id: string; name: string; country: string; image: string; matchScore: number },
): RecView {
  const flight = snapshot?.liveFlight ?? snapshot?.flight_summary ?? {};
  const hotel = snapshot?.liveHotel ?? snapshot?.hotel_summary ?? {};
  return {
    id: snapshot?.id ?? fallback.id,
    name: snapshot?.name ?? fallback.name,
    country: snapshot?.country ?? fallback.country,
    iata: snapshot?.iata ?? null,
    image: snapshot?.image ?? snapshot?.image_url ?? fallback.image,
    tagline: snapshot?.tagline ?? "Saved trip",
    matchScore: Number(snapshot?.matchScore ?? snapshot?.match_score ?? fallback.matchScore),
    valueScore: Number(snapshot?.valueScore ?? snapshot?.value_score ?? 0),
    estimatedTotalEur: Number(snapshot?.estimatedTotalEur ?? snapshot?.estimated_total_eur ?? 0),
    flightEur: Number(snapshot?.flightEur ?? snapshot?.flight_eur ?? 0),
    hotelNightlyEur: Number(snapshot?.hotelNightlyEur ?? snapshot?.hotel_nightly_eur ?? 0),
    weather: snapshot?.weather ?? { period: "saved", highC: 0, lowC: 0, rain: "low", summary: "Saved" },
    scoreBreakdown: snapshot?.scoreBreakdown ?? { climate: 0, vibe: 0, budget: 0, ease: 0, value: 0 },
    reasons: Array.isArray(snapshot?.reasons) ? snapshot.reasons : ["Saved trip"],
    activities: Array.isArray(snapshot?.activities) ? snapshot.activities : [],
    tips: Array.isArray(snapshot?.tips) ? snapshot.tips : [],
    liveFlight: { source: flight.source ?? "fallback", provider: flight.provider ?? "Saved", route: flight.route ?? "", priceEur: Number(flight.priceEur ?? flight.price_usd ?? 0), durationHours: Number(flight.durationHours ?? flight.duration_hours ?? 0), stops: Number(flight.stops ?? 0), departureDate: flight.departureDate ?? new Date().toISOString().slice(0, 10), note: flight.note ?? "Saved" },
    liveHotel: { source: hotel.source ?? "fallback", provider: hotel.provider ?? "Saved", name: hotel.name ?? fallback.name, nightlyEur: Number(hotel.nightlyEur ?? hotel.nightly_usd ?? 0), rating: Number(hotel.rating ?? 0), neighborhood: hotel.neighborhood ?? "", note: hotel.note ?? "Saved" },
    flightChoices: [],
    hotelChoices: [],
    gallery: [snapshot?.image ?? snapshot?.image_url ?? fallback.image],
  };
}

function toView(bundle: TravelBundle): BundleView {
  return {
    parsed: bundle.parsed,
    recommendations: bundle.recommendations.map((rec) => ({
      ...rec,
      liveFlight: { source: "fallback", provider: "Estimated", route: rec.iata ? `FRA → ${rec.iata}` : "Estimated route", priceEur: rec.flightEur, durationHours: 0, stops: 0, departureDate: new Date().toISOString().slice(0, 10), note: "Fallback estimate" },
      liveHotel: { source: "fallback", provider: "Estimated", name: `Stay in ${rec.name}`, nightlyEur: rec.hotelNightlyEur, rating: 4.4, neighborhood: "Central area", note: "Fallback estimate" },
      flightChoices: [],
      hotelChoices: [],
      gallery: makeGallery(rec),
    } satisfies RecView)),
  };
}

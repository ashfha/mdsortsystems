import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
import {
  destinationKey,
  formatEuro,
  monthLabel,
  parseTravelPrompt,
  recommendDestinations,
  type TravelBundle,
  type TravelRecommendation,
} from "@/lib/travelMatch";

type SavedCard = {
  key: string;
  rec: TravelRecommendation;
};

type SessionUser = {
  id: string;
  email: string | null;
};

const PRESETS = [
  "Beach + relaxation, 1 week in March, under 2500€, from Stuttgart, no partying",
  "Solo trip Europe in October, city + food + walkable, mid-range budget",
  "Family of 4 to somewhere tropical, spring break, nature and beach",
  "Couple honeymoon, luxury, private beach, 10 days from London",
  "Warm, good food, modern hotel, not too touristy, max 1800€",
  "Need a short city break with great nightlife and airport close by",
];

const STORAGE_KEYS = {
  prompt: "travelmatch:lastPrompt",
  history: "travelmatch:history",
  favorites: "travelmatch:favorites",
};

const INITIAL_PROMPT = "Beach, warm weather, nice hotels, good food, 7-10 days, max 2000€, from Germany";

export default function Index() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [prompt, setPrompt] = useState(() => loadStorage(STORAGE_KEYS.prompt, INITIAL_PROMPT));
  const [bundle, setBundle] = useState<TravelBundle>(() => recommendDestinations(loadStorage(STORAGE_KEYS.prompt, INITIAL_PROMPT)));
  const [selectedId, setSelectedId] = useState<string>(() => recommendDestinations(loadStorage(STORAGE_KEYS.prompt, INITIAL_PROMPT)).recommendations[0]?.id ?? "");
  const [favorites, setFavorites] = useState<SavedCard[]>(() => loadFavorites());
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);

  const selected = useMemo(
    () => bundle.recommendations.find((rec) => rec.id === selectedId) ?? bundle.recommendations[0],
    [bundle.recommendations, selectedId],
  );

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
    if (!sessionUser) return;
    void syncCloudData(sessionUser.id);
  }, [sessionUser]);

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
        .select("id,raw_input,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (searches?.length) {
        setHistory(searches.map((row: any) => row.raw_input).filter(Boolean));
      }
      setCloudReady(true);
    } catch (error) {
      console.warn(error);
    }
  }

  async function generateTrip(nextPrompt = prompt) {
    const clean = nextPrompt.trim();
    if (!clean) return;
    setIsGenerating(true);
    setPrompt(clean);
    writeStorage(STORAGE_KEYS.prompt, clean);

    window.setTimeout(async () => {
      const next = recommendDestinations(clean);
      setBundle(next);
      setSelectedId(next.recommendations[0]?.id ?? "");
      upsertHistory(clean);
      setHistory(loadHistory());
      if (sessionUser) {
        await persistSearch(sessionUser.id, clean, next);
      }
      setIsGenerating(false);
    }, 650);
  }

  async function persistSearch(userId: string, rawInput: string, next: TravelBundle) {
    try {
      const { data: searchRow, error: searchErr } = await supabase
        .from("searches")
        .insert({
          user_id: userId,
          raw_input: rawInput,
          parsed_prefs: next.parsed as any,
        })
        .select("id")
        .single();
      if (searchErr || !searchRow) return;

      await supabase.from("recommendations").insert(
        next.recommendations.map((rec) => ({
          search_id: searchRow.id,
          user_id: userId,
          rank: rec.matchScore,
          destination_name: rec.name,
          country: rec.country,
          iata: rec.iata,
          lat: null,
          lng: null,
          image_url: rec.image,
          match_score: rec.matchScore,
          price_performance_score: rec.valueScore,
          reasons: rec.reasons as any,
          estimated_total_cost_usd: rec.estimatedTotalEur,
          flight_summary: {
            provider: "Estimated",
            price_usd: rec.flightEur,
            duration_hours: null,
            stops: null,
            route: next.parsed.departure ? `${next.parsed.departure} → ${rec.iata}` : rec.iata,
            note: "Illustrative estimate",
          } as any,
          hotel_summary: {
            provider: "Estimated",
            name: rec.name,
            nightly_usd: rec.hotelNightlyEur,
            rating: 4.6,
            neighborhood: "Central / premium area",
            note: "Illustrative estimate",
          } as any,
          weather_summary: rec.weather as any,
          activities: { activities: rec.activities, tips: rec.tips } as any,
        })),
      );
    } catch (error) {
      console.warn(error);
    }
  }

  async function signInWithMagicLink() {
    const email = authEmail.trim();
    if (!email) return;
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast.success("Magic link sent", { description: "Check your inbox to finish signing in." });
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

  async function toggleFavorite(rec: TravelRecommendation) {
    const key = destinationKey(rec.name, rec.country);
    const exists = favorites.some((item) => item.key === key);

    if (exists) {
      const next = favorites.filter((item) => item.key !== key);
      setFavorites(next);
      writeStorage(STORAGE_KEYS.favorites, next);
      if (sessionUser) {
        await supabase.from("saved_destinations").delete().eq("user_id", sessionUser.id).eq("destination_key", key);
      }
      toast.message("Removed from saved trips");
      return;
    }

    const nextItem: SavedCard = { key, rec };
    const next = [nextItem, ...favorites];
    setFavorites(next);
    writeStorage(STORAGE_KEYS.favorites, next);
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

  const selectedFavourite = selected ? favorites.some((item) => item.key === destinationKey(selected.name, selected.country)) : false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-elegant">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold leading-none tracking-tight">TravelMatch AI</div>
              <div className="text-xs text-muted-foreground">Find the trip that fits you</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#results" className="text-sm text-muted-foreground hover:text-foreground">Results</a>
            <a href="#saved" className="text-sm text-muted-foreground hover:text-foreground">Saved</a>
            <a href="#account" className="text-sm text-muted-foreground hover:text-foreground">Account</a>
          </nav>

          <div className="flex items-center gap-2">
            {sessionUser ? (
              <>
                <div className="hidden rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground md:block">
                  {sessionUser.email ?? "Signed in"}
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}>
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4">
        <section className="grid gap-10 pb-10 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-14 lg:pt-20">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI travel matching with value-first ranking
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Tell us your vibe.
                <br />
                We&apos;ll find where to go.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Paste a few bullet points and TravelMatch AI turns them into a destination shortlist with a clear match score, budget fit, weather, and trip cost.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [Sparkles, "Describe it", "Budget, dates, departure, mood."],
                [BadgeCheck, "Match score", "See why each place fits."],
                [BarChart3, "Value-first", "Price-performance over cheapest."],
              ].map(([Icon, title, body]) => (
                <Card key={title as string} className="rounded-3xl p-5 shadow-soft">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-lg font-semibold">{title as string}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{body as string}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-card p-5 shadow-elegant md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip brief</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">One message is enough</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  Local + cloud sync
                </div>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Warm weather, 7 days, max 2000€, from Germany, great hotel, good food, not too touristy…"
                className="min-h-36 resize-none rounded-3xl border-border/70 bg-background/80 p-4 text-base shadow-none focus-visible:ring-2"
              />

              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1 rounded-2xl text-base" onClick={() => generateTrip()} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Find my trip
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setAuthOpen(true)}>
                  Save cloud history
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border/70 bg-background/60 p-3">
                <MiniStat label="Trips matched" value={bundle.recommendations.length.toString()} />
                <MiniStat label="Saved" value={favorites.length.toString()} />
                <MiniStat label="Cloud" value={cloudReady ? "Ready" : "Local"} />
              </div>
            </div>
          </Card>
        </section>

        <section id="how" className="grid gap-4 py-4 md:grid-cols-3">
          <InfoPanel
            icon={Compass}
            title="You write, we parse"
            body="The app extracts budget, month, duration, departure city, climate, and trip vibe from free text or bullet points."
          />
          <InfoPanel
            icon={Plane}
            title="We rank the destinations"
            body="Each recommendation gets a match score and a value score so the shortlist feels useful, not random."
          />
          <InfoPanel
            icon={Bookmark}
            title="Save the ones you like"
            body="Favorites and search history stay in your browser and sync to Supabase when you sign in."
          />
        </section>

        <section id="results" className="grid gap-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recommended places</p>
                <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Your shortlist</h2>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {bundle.parsed.month ? monthLabel(bundle.parsed.month) : "Flexible timing"}
              </Badge>
            </div>

            {isGenerating && (
              <Card className="rounded-3xl p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <div className="font-medium">Matching destinations</div>
                    <div className="text-sm text-muted-foreground">Checking vibe, budget, weather, and value.</div>
                  </div>
                </div>
              </Card>
            )}

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
                          <div className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow-soft backdrop-blur">
                            {rec.country}
                          </div>
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
                              <div key={reason} className="flex gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button size="sm" className="rounded-2xl" onClick={(e) => { e.stopPropagation(); void toggleFavorite(rec); }}>
                              <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                              {isFav ? "Saved" : "Save"}
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-2xl">
                              Details <ChevronRight className="h-4 w-4" />
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
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
                      <MapPin className="h-3.5 w-3.5" /> {selected.country}
                    </div>
                    <div className="absolute right-5 top-5 rounded-full bg-background/90 px-4 py-2 text-sm font-semibold">
                      Match {selected.matchScore}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-display text-3xl font-semibold text-white">{selected.name}</h3>
                      <p className="mt-1 max-w-lg text-sm text-white/85">{selected.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="grid grid-cols-3 gap-3">
                      <StatBox icon={Plane} label="Flight" value={formatEuro(selected.flightEur)} />
                      <StatBox icon={Hotel} label="Hotel / nt" value={formatEuro(selected.hotelNightlyEur)} />
                      <StatBox icon={CloudSun} label="Total" value={formatEuro(selected.estimatedTotalEur)} />
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Why it fits</div>
                          <div className="mt-1 font-display text-xl font-semibold">Explanation</div>
                        </div>
                        <MoonStar className="h-5 w-5 text-accent" />
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {selected.reasons.map((reason) => (
                          <li key={reason} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">Weather for {selected.weather.period}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{selected.weather.summary}. Expect about {selected.weather.highC}°C / {selected.weather.lowC}°C.</p>
                      </div>
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">Score breakdown</div>
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
                        <h4 className="font-medium">Activities</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selected.activities.map((item) => (
                            <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Smart tips</h4>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {selected.tips.map((tip) => <li key={tip}>• {tip}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Run a search to see destination details here.</div>
              )}
            </Card>

            <Card id="account" className="rounded-[2rem] border-border/70 bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">Cloud sync</h3>
                </div>
                <Users className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Sign in once, then your saved trips and search history can be stored in Supabase. Local mode still works without an account.
              </p>
              <div className="mt-4 flex items-center gap-2">
                {sessionUser ? (
                  <Badge className="rounded-full px-3 py-2">{sessionUser.email ?? "Signed in"}</Badge>
                ) : (
                  <Button onClick={() => setAuthOpen(true)}>Enable cloud sync</Button>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section id="saved" className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved trips</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Favorites</h2>
            </div>
            <div className="text-sm text-muted-foreground">{favorites.length} saved</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.length ? favorites.map((item) => (
              <Card key={item.key} className="overflow-hidden rounded-[1.75rem] border-border/70 bg-card shadow-soft">
                <img src={item.rec.image} alt={item.rec.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl font-semibold">{item.rec.name}</div>
                      <div className="text-sm text-muted-foreground">{item.rec.country}</div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">{item.rec.matchScore}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" /> {formatEuro(item.rec.estimatedTotalEur)} total
                  </div>
                </div>
              </Card>
            )) : (
              <Card className="rounded-[1.75rem] border-dashed p-8 text-center text-muted-foreground md:col-span-2 xl:col-span-3">
                Save a destination to build your shortlist.
              </Card>
            )}
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Search history</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Recent prompts</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {history.length ? history.map((item) => (
              <button key={item} onClick={() => generateTrip(item)} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                {item}
              </button>
            )) : (
              <div className="text-sm text-muted-foreground">Your recent searches will appear here.</div>
            )}
          </div>
        </section>

        <section className="pb-20 pt-10">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built to decide faster</p>
                <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">No more tab chaos. One place, one shortlist.</h2>
                <p className="mt-3 text-muted-foreground">The app can later plug in live flight, hotel, weather, and map providers without changing the core experience.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setAuthOpen(true)} className="rounded-2xl">
                  <Zap className="h-4 w-4" />
                  Save cloud history
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Back to top
                </Button>
              </div>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Supabase</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">Enable cloud sync</h3>
              </div>
              <button onClick={() => setAuthOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Enter your email and we&apos;ll send a magic link. Search history and favorites can then sync to Supabase.</p>
            <div className="mt-5 space-y-3">
              <Input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-2xl" />
              <Button className="h-12 w-full rounded-2xl" onClick={signInWithMagicLink} disabled={authBusy}>
                {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Send magic link
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}/100</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background text-center shadow-soft">
      <div>
        <div className="font-display text-lg font-semibold leading-none">{s}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-accent" />
      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-base font-semibold">{value}</div>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <Card className="rounded-3xl p-6 shadow-soft">
      <Icon className="h-5 w-5 text-accent" />
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
    </Card>
  );
}

function loadStorage(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function upsertHistory(prompt: string) {
  const current = loadHistory().filter((item) => item !== prompt);
  const next = [prompt, ...current].slice(0, 10);
  writeStorage(STORAGE_KEYS.history, JSON.stringify(next));
}

function loadHistory() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.history);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function loadFavorites(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.favorites);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCard[];
  } catch {
    return [];
  }
}

function normalizeSnapshot(snapshot: any, fallback: { id: string; name: string; country: string; image: string; matchScore: number }): TravelRecommendation {
  if (snapshot && typeof snapshot === "object") {
    return {
      id: snapshot.id ?? fallback.id,
      name: snapshot.name ?? fallback.name,
      country: snapshot.country ?? fallback.country,
      iata: snapshot.iata ?? null,
      image: snapshot.image ?? snapshot.image_url ?? fallback.image,
      tagline: snapshot.tagline ?? "Saved trip",
      matchScore: Number(snapshot.matchScore ?? snapshot.match_score ?? fallback.matchScore),
      valueScore: Number(snapshot.valueScore ?? snapshot.value_score ?? 0),
      estimatedTotalEur: Number(snapshot.estimatedTotalEur ?? snapshot.estimated_total_eur ?? 0),
      flightEur: Number(snapshot.flightEur ?? snapshot.flight_eur ?? 0),
      hotelNightlyEur: Number(snapshot.hotelNightlyEur ?? snapshot.hotel_nightly_eur ?? 0),
      weather: snapshot.weather ?? { period: "saved", highC: 0, lowC: 0, rain: "low", summary: "Saved" },
      scoreBreakdown: snapshot.scoreBreakdown ?? { climate: 0, vibe: 0, budget: 0, ease: 0, value: 0 },
      reasons: Array.isArray(snapshot.reasons) ? snapshot.reasons : ["Saved trip"],
      activities: Array.isArray(snapshot.activities) ? snapshot.activities : [],
      tips: Array.isArray(snapshot.tips) ? snapshot.tips : [],
    };
  }
  return {
    id: fallback.id,
    name: fallback.name,
    country: fallback.country,
    iata: null,
    image: fallback.image,
    tagline: "Saved trip",
    matchScore: fallback.matchScore,
    valueScore: 0,
    estimatedTotalEur: 0,
    flightEur: 0,
    hotelNightlyEur: 0,
    weather: { period: "saved", highC: 0, lowC: 0, rain: "low", summary: "Saved" },
    scoreBreakdown: { climate: 0, vibe: 0, budget: 0, ease: 0, value: 0 },
    reasons: ["Saved trip"],
    activities: [],
    tips: [],
  };
}

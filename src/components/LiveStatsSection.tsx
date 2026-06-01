import { useEffect, useMemo, useState } from "react";
import { Activity, GlassWater, Loader2, RefreshCw, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PublicStats = {
  total_inserted: number;
  white_inserted: number;
  colored_inserted: number;
  event_count: number;
  location_count: number;
  last_insertion_at: string | null;
};

const emptyStats: PublicStats = {
  total_inserted: 0,
  white_inserted: 0,
  colored_inserted: 0,
  event_count: 0,
  location_count: 0,
  last_insertion_at: null,
};

const formatNumber = (value: number) => value.toLocaleString("de-DE");

const formatTime = (value: string | null) => {
  if (!value) return "Noch kein Signal";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const LiveStatsSection = () => {
  const [stats, setStats] = useState<PublicStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setRefreshing(true);
    const { data, error: rpcError } = await (supabase as any).rpc("get_public_recycling_stats");
    if (rpcError) {
      setError("Live-Daten konnten nicht geladen werden.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setStats(((data as PublicStats[] | null)?.[0]) ?? emptyStats);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
    const timer = window.setInterval(loadStats, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const split = useMemo(() => {
    const total = stats.white_inserted + stats.colored_inserted;
    if (total === 0) return { white: 0, colored: 0 };
    return {
      white: Math.round((stats.white_inserted / total) * 100),
      colored: Math.round((stats.colored_inserted / total) * 100),
    };
  }, [stats.colored_inserted, stats.white_inserted]);

  return (
    <section id="live" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <Activity size={16} className="animate-pulse" />
              Live aus Supabase
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Einwurfdaten direkt von der Anlage
            </h2>
            <p className="text-muted-foreground mt-3">
              Die aktuellen Arduino-Signale werden automatisch aus der Datenbank gelesen und regelmaessig aktualisiert.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStats}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Aktualisieren
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Einwuerfe gesamt</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : formatNumber(stats.total_inserted)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Weissglas</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : formatNumber(stats.white_inserted)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{split.white}% der erfassten Einwuerfe</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Buntglas</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : formatNumber(stats.colored_inserted)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{split.colored}% der erfassten Einwuerfe</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Letztes Signal</p>
            <p className="text-lg font-semibold text-foreground mt-2 flex items-center gap-2">
              <Timer size={18} />
              {loading ? "Lade..." : formatTime(stats.last_insertion_at)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(stats.event_count)} Events an {formatNumber(stats.location_count)} Standorten
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="flex h-full">
            <div className="bg-foreground/80 transition-all" style={{ width: `${split.white}%` }} />
            <div className="bg-accent transition-all" style={{ width: `${split.colored}%` }} />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-destructive flex items-center gap-2">
            <GlassWater size={16} />
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default LiveStatsSection;

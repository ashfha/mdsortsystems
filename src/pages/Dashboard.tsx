import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  externalSupabase,
  isWhiteMaterial,
  isColoredMaterial,
  type EinwurfRow,
} from "@/integrations/external/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Loader2, MapPin, Package, Plus, RefreshCw, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type LocationRow = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

type StatsRow = {
  location_id: string;
  total_inserted: number;
  white_inserted: number;
  colored_inserted: number;
  event_count: number;
  last_insertion_at: string | null;
};

type LocationWithStats = LocationRow & {
  total_inserted: number;
  white_inserted: number;
  colored_inserted: number;
  event_count: number;
  last_insertion_at: string | null;
};

const GLASS_CAP = 1000;
const FULL_THRESHOLD = 700;
const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

const isFull = (l: { white_inserted: number; colored_inserted: number }) =>
  l.white_inserted >= FULL_THRESHOLD || l.colored_inserted >= FULL_THRESHOLD;

const routeUrlSingle = (l: { latitude: number; longitude: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${l.latitude},${l.longitude}`;

const routeUrlMulti = (list: Array<{ latitude: number; longitude: number }>) => {
  if (list.length === 0) return "";
  const dest = list[list.length - 1];
  const waypoints = list
    .slice(0, -1)
    .map((l) => `${l.latitude},${l.longitude}`)
    .join("|");
  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    destination: `${dest.latitude},${dest.longitude}`,
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

declare global {
  interface Window {
    google?: any;
    __initMdsMap?: () => void;
  }
}

const loadGoogleMaps = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("gmaps-sdk") as HTMLScriptElement | null;
    window.__initMdsMap = () => resolve();
    if (existing) {
      // Already loading – wait
      const check = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "gmaps-sdk";
    script.async = true;
    script.defer = true;
    const params = new URLSearchParams({
      key: BROWSER_KEY ?? "",
      loading: "async",
      callback: "__initMdsMap",
    });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onerror = () => reject(new Error("Google Maps konnte nicht geladen werden."));
    document.head.appendChild(script);
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationWithStats[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [hovered, setHovered] = useState<LocationWithStats | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Array<{ id: string; marker: any }>>([]);
  const infoRef = useRef<any>(null);
  const openInfoLocationId = useRef<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/login", { replace: true });
      else setUserId(session.user.id);
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      setUserId(session.user.id);
      await loadData(session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Realtime — Einwürfe aus externer DB + eigene Standorte aus Lovable Cloud
  useEffect(() => {
    if (!userId) return;
    const localChannel = supabase
      .channel("dashboard-live-local")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations", filter: `user_id=eq.${userId}` },
        () => loadData(userId)
      )
      .subscribe();
    const externalChannel = externalSupabase
      .channel("dashboard-live-external")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "einwuerfe" },
        () => loadData(userId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(localChannel);
      externalSupabase.removeChannel(externalChannel);
    };
  }, [userId]);

  // Initialize Google Map
  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) return;
    if (!BROWSER_KEY) {
      setMapError("Google Maps API-Key fehlt.");
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;
        const center =
          locations.length > 0
            ? { lat: locations[0].latitude, lng: locations[0].longitude }
            : { lat: 51.1657, lng: 10.4515 };
        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: locations.length > 1 ? 6 : 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          infoRef.current = new window.google.maps.InfoWindow();
        }
        // Clear old markers
        markersRef.current.forEach((m) => m.marker.setMap(null));
        markersRef.current = [];
        locations.forEach((loc) => {
          const full = isFull(loc);
          const marker = new window.google.maps.Marker({
            position: { lat: loc.latitude, lng: loc.longitude },
            map: mapInstance.current,
            title: loc.name,
            icon: full
              ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          });
          marker.addListener("mouseover", () => {
            setHovered(loc);
            openInfoLocationId.current = loc.id;
            infoRef.current.setContent(buildInfoHtml(loc));
            infoRef.current.open(mapInstance.current, marker);
          });
          marker.addListener("mouseout", () => {
            // keep open on hover-out only if user clicked; close otherwise
            if (openInfoLocationId.current === loc.id) {
              // keep open
            } else {
              infoRef.current.close();
            }
          });
          marker.addListener("click", () => {
            openInfoLocationId.current = loc.id;
            infoRef.current.setContent(buildInfoHtml(loc));
            infoRef.current.open(mapInstance.current, marker);
          });
          markersRef.current.push({ id: loc.id, marker });
        });

        if (locations.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          locations.forEach((l) => bounds.extend({ lat: l.latitude, lng: l.longitude }));
          mapInstance.current.fitBounds(bounds);
        } else if (locations.length === 1) {
          mapInstance.current.setCenter(center);
          mapInstance.current.setZoom(12);
        }
      })
      .catch((err) => {
        if (!cancelled) setMapError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, locations]);

  // Keep hovered state and any open InfoWindow in sync with realtime data
  useEffect(() => {
    if (hovered) {
      const fresh = locations.find((l) => l.id === hovered.id);
      if (fresh && fresh !== hovered) setHovered(fresh);
      else if (!fresh) setHovered(null);
    }
    if (openInfoLocationId.current && infoRef.current) {
      const fresh = locations.find((l) => l.id === openInfoLocationId.current);
      if (fresh) infoRef.current.setContent(buildInfoHtml(fresh));
    }
  }, [locations]);


  const loadData = async (uid: string) => {
    setRefreshing(true);
    const [
      { data: standorte, error: sErr },
      { data: einwuerfe, error: eErr },
      { data: prof },
    ] = await Promise.all([
      externalSupabase.from("standorte").select("*"),
      externalSupabase.from("einwuerfe").select("id,standort_id,material,anzahl,timestamp,created_at"),
      supabase.from("profiles").select("company_name").eq("user_id", uid).maybeSingle(),
    ]);
    if (sErr) {
      toast({ title: "Fehler beim Laden der Standorte", description: sErr.message, variant: "destructive" });
    }
    if (eErr) {
      toast({ title: "Fehler beim Laden der Einwürfe", description: eErr.message, variant: "destructive" });
    }

    // Aggregate einwuerfe per standort
    const agg = new Map<
      string,
      { white: number; colored: number; total: number; count: number; last: string | null }
    >();
    ((einwuerfe as EinwurfRow[]) ?? []).forEach((e) => {
      if (!e.standort_id) return;
      const cur = agg.get(e.standort_id) ?? { white: 0, colored: 0, total: 0, count: 0, last: null };
      const qty = Number(e.anzahl ?? 0);
      cur.total += qty;
      cur.count += 1;
      if (isWhiteMaterial(e.material)) cur.white += qty;
      else if (isColoredMaterial(e.material)) cur.colored += qty;
      const ts = e.timestamp ?? e.created_at;
      if (ts && (!cur.last || ts > cur.last)) cur.last = ts;
      agg.set(e.standort_id, cur);
    });

    const merged: LocationWithStats[] = ((standorte as StandortRow[]) ?? [])
      .map(normalizeStandort)
      .filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude))
      .map((l) => {
        const a = agg.get(l.id);
        return {
          ...l,
          total_inserted: a?.total ?? 0,
          white_inserted: a?.white ?? 0,
          colored_inserted: a?.colored ?? 0,
          event_count: a?.count ?? 0,
          last_insertion_at: a?.last ?? null,
        };
      });

    setLocations(merged);
    setCompanyName(prof?.company_name ?? "");
    setLoading(false);
    setRefreshing(false);
  };


  const totalSum = locations.reduce((acc, l) => acc + l.total_inserted, 0);
  const totalWhite = locations.reduce((acc, l) => acc + l.white_inserted, 0);
  const totalColored = locations.reduce((acc, l) => acc + l.colored_inserted, 0);
  const focus = hovered ?? null;
  const whiteValue = focus ? focus.white_inserted : totalWhite;
  const coloredValue = focus ? focus.colored_inserted : totalColored;
  const whitePct = Math.min(100, (whiteValue / GLASS_CAP) * 100);
  const coloredPct = Math.min(100, (coloredValue / GLASS_CAP) * 100);

  return (
    <div className="min-h-screen bg-background aurora">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 relative">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Kundenportal
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Radio size={12} className="animate-pulse" /> Live
              </span>
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {companyName ? `Willkommen, ${companyName}` : "Ihr Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Einwurfdaten werden automatisch geladen und in Echtzeit aktualisiert.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => userId && loadData(userId)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Aktualisieren
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Standorte und Einwürfe werden direkt aus der externen Produktiv-Datenbank gelesen.
        </div>

        {(() => {
          const fullLocs = locations.filter(isFull);
          if (fullLocs.length === 0) return null;
          const canMulti = fullLocs.length >= 5;
          // Google Maps supports up to ~10 waypoints; cap to 10 to be safe
          const tour = fullLocs.slice(0, 10);
          return (
            <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-destructive">
                  {fullLocs.length} Standort{fullLocs.length === 1 ? "" : "e"} über {FULL_THRESHOLD} Einwürfen
                </p>
                <p className="text-xs text-muted-foreground">
                  {canMulti
                    ? "Sammeltour kann direkt in Google Maps geöffnet werden."
                    : `Ab 5 vollen Standorten kann eine Sammeltour generiert werden (aktuell ${fullLocs.length}).`}
                </p>
              </div>
              {canMulti && (
                <a
                  href={routeUrlMulti(tour)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
                >
                  Sammeltour in Google Maps öffnen
                </a>
              )}
            </div>
          );
        })()}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <MapPin size={16} /> Standorte
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{locations.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Package size={16} /> Eingeworfen gesamt
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{totalSum.toLocaleString("de-DE")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Package size={16} /> Ø pro Standort
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {locations.length ? Math.round(totalSum / locations.length).toLocaleString("de-DE") : 0}
            </p>
          </div>
        </div>

        {/* Glass type progress bars */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Auslastung Glascontainer</h2>
              <p className="text-xs text-muted-foreground">
                {focus ? `Standort: ${focus.name}` : "Gesamt über alle Standorte"} · 100 % entspricht 1.000 Einwürfen
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Weißglas</span>
                <span className="text-muted-foreground">
                  {whiteValue.toLocaleString("de-DE")} / {GLASS_CAP.toLocaleString("de-DE")} ({whitePct.toFixed(0)}%)
                </span>
              </div>
              <Progress value={whitePct} className="h-3 [&>div]:bg-foreground/80" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Buntglas</span>
                <span className="text-muted-foreground">
                  {coloredValue.toLocaleString("de-DE")} / {GLASS_CAP.toLocaleString("de-DE")} ({coloredPct.toFixed(0)}%)
                </span>
              </div>
              <Progress value={coloredPct} className="h-3 [&>div]:bg-accent" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Karte der Standorte</h2>
            <p className="text-sm text-muted-foreground">
              Bewegen Sie die Maus über eine Markierung, um die Einwurfdaten oben zu sehen.
            </p>
          </div>
          <div className="h-[500px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin mr-2" /> Lade Karte…
              </div>
            ) : mapError ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-destructive p-4 text-center">
                {mapError}
              </div>
            ) : (
              <div ref={mapRef} className="h-full w-full" />
            )}
          </div>
        </div>

        {locations.length === 0 && !loading && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Noch keine Standorte. Fügen Sie Ihren ersten Standort hinzu — Einwurfdaten werden automatisch synchronisiert.
          </p>
        )}
      </main>
    </div>
  );
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildInfoHtml(loc: {
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  total_inserted: number;
  white_inserted: number;
  colored_inserted: number;
}) {
  const whitePct = Math.min(100, (loc.white_inserted / GLASS_CAP) * 100);
  const coloredPct = Math.min(100, (loc.colored_inserted / GLASS_CAP) * 100);
  const full = isFull(loc);
  const bar = (pct: number, color: string) => `
    <div style="background:#eee;border-radius:4px;height:6px;overflow:hidden;margin-top:2px;">
      <div style="width:${pct}%;height:100%;background:${color};"></div>
    </div>`;
  const route = routeUrlSingle(loc);
  return `
    <div style="font-family: inherit; min-width: 220px; color:#1a1a1a;">
      <div style="font-weight: 600; margin-bottom: 4px; color:${full ? "#c0392b" : "#1a1a1a"};">
        ${escapeHtml(loc.name)} ${full ? "· VOLL" : ""}
      </div>
      ${loc.address ? `<div style="font-size: 12px; color: #555;">${escapeHtml(loc.address)}</div>` : ""}
      <div style="margin-top: 8px; font-size: 12px; color:#1a1a1a;">
        <div style="display:flex;justify-content:space-between;">
          <span>Weißglas</span>
          <span>${loc.white_inserted.toLocaleString("de-DE")} / ${GLASS_CAP}</span>
        </div>
        ${bar(whitePct, loc.white_inserted >= FULL_THRESHOLD ? "#c0392b" : "#333")}
        <div style="display:flex;justify-content:space-between;margin-top:6px;">
          <span>Buntglas</span>
          <span>${loc.colored_inserted.toLocaleString("de-DE")} / ${GLASS_CAP}</span>
        </div>
        ${bar(coloredPct, loc.colored_inserted >= FULL_THRESHOLD ? "#c0392b" : "#2ecc71")}
      </div>
      ${
        full
          ? `<a href="${route}" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;padding:6px 10px;background:#c0392b;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">Route generieren</a>`
          : `<a href="${route}" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;padding:6px 10px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">Route generieren</a>`
      }
    </div>`;
}



export default Dashboard;

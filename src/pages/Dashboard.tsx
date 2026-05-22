import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

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
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState<LocationWithStats | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Array<{ id: string; marker: any }>>([]);
  const infoRef = useRef<any>(null);
  const openInfoLocationId = useRef<string | null>(null);


  // form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

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

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "insertions", filter: `user_id=eq.${userId}` },
        () => loadData(userId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations", filter: `user_id=eq.${userId}` },
        () => loadData(userId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
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
          const marker = new window.google.maps.Marker({
            position: { lat: loc.latitude, lng: loc.longitude },
            map: mapInstance.current,
            title: loc.name,
          });
          marker.addListener("mouseover", () => {
            setHovered(loc);
            openInfoLocationId.current = loc.id;
            infoRef.current.setContent(buildInfoHtml(loc));
            infoRef.current.open(mapInstance.current, marker);
          });
          marker.addListener("mouseout", () => {
            openInfoLocationId.current = null;
            infoRef.current.close();
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
    const [{ data: locs, error: lErr }, { data: stats }, { data: prof }] = await Promise.all([
      supabase
        .from("locations")
        .select("id,name,address,latitude,longitude")
        .order("created_at", { ascending: false }),
      supabase.from("location_stats" as any).select("*"),
      supabase.from("profiles").select("company_name").eq("user_id", uid).maybeSingle(),
    ]);
    if (lErr) toast({ title: "Fehler beim Laden", description: lErr.message, variant: "destructive" });
    const statsMap = new Map<string, StatsRow>();
    ((stats as unknown as StatsRow[]) ?? []).forEach((s) => statsMap.set(s.location_id, s));
    const merged: LocationWithStats[] = ((locs as LocationRow[]) ?? []).map((l) => {
      const s = statsMap.get(l.id);
      return {
        ...l,
        total_inserted: s?.total_inserted ?? 0,
        white_inserted: s?.white_inserted ?? 0,
        colored_inserted: s?.colored_inserted ?? 0,
        event_count: s?.event_count ?? 0,
        last_insertion_at: s?.last_insertion_at ?? null,
      };
    });
    setLocations(merged);
    setCompanyName(prof?.company_name ?? "");
    setLoading(false);
    setRefreshing(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast({ title: "Ungültige Koordinaten", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("locations")
      .insert({ user_id: user.id, name, address: address || null, latitude, longitude });
    setSubmitting(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    setOpen(false);
    setName(""); setAddress(""); setLat(""); setLng("");
    toast({ title: "Standort hinzugefügt" });
    await loadData(user.id);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  <Plus size={16} /> Standort hinzufügen
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuer Standort</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lname">Name</Label>
                    <Input id="lname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sortier-Anlage Nord" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laddr">Adresse (optional)</Label>
                    <Input id="laddr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hauptstraße 1, Berlin" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="llat">Latitude</Label>
                      <Input id="llat" value={lat} onChange={(e) => setLat(e.target.value)} required placeholder="52.5200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="llng">Longitude</Label>
                      <Input id="llng" value={lng} onChange={(e) => setLng(e.target.value)} required placeholder="13.4050" />
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Hinzufügen
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
  total_inserted: number;
  white_inserted: number;
  colored_inserted: number;
}) {
  return `
    <div style="font-family: inherit; min-width: 180px;">
      <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(loc.name)}</div>
      ${loc.address ? `<div style="font-size: 12px; color: #555;">${escapeHtml(loc.address)}</div>` : ""}
      <div style="margin-top: 6px; font-size: 13px;">
        Gesamt: <strong>${loc.total_inserted.toLocaleString("de-DE")}</strong><br/>
        Weißglas: <strong>${loc.white_inserted.toLocaleString("de-DE")}</strong><br/>
        Buntglas: <strong>${loc.colored_inserted.toLocaleString("de-DE")}</strong>
      </div>
    </div>`;
}


export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Loader2, MapPin, Package, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type Location = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  total_inserted: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [count, setCount] = useState("0");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/login", { replace: true });
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      await loadData(session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    setLoading(true);
    const [{ data: locs, error: lErr }, { data: prof }] = await Promise.all([
      supabase.from("locations").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("company_name").eq("user_id", userId).maybeSingle(),
    ]);
    if (lErr) toast({ title: "Fehler beim Laden", description: lErr.message, variant: "destructive" });
    setLocations((locs as Location[]) ?? []);
    setCompanyName(prof?.company_name ?? "");
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const total = parseInt(count, 10) || 0;
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast({ title: "Ungültige Koordinaten", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("locations")
      .insert({
        user_id: user.id,
        name,
        address: address || null,
        latitude,
        longitude,
        total_inserted: total,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    setLocations((prev) => [data as Location, ...prev]);
    setOpen(false);
    setName(""); setAddress(""); setLat(""); setLng(""); setCount("0");
    toast({ title: "Standort hinzugefügt" });
  };

  const totalSum = locations.reduce((acc, l) => acc + l.total_inserted, 0);
  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [51.1657, 10.4515]; // Germany

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Kundenportal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {companyName ? `Willkommen, ${companyName}` : "Ihr Dashboard"}
            </h1>
          </div>
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
                <div className="space-y-2">
                  <Label htmlFor="lcount">Eingeworfene Einheiten</Label>
                  <Input id="lcount" type="number" min="0" value={count} onChange={(e) => setCount(e.target.value)} />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Karte der Standorte</h2>
            <p className="text-sm text-muted-foreground">Hover über die Markierungen für die Einwurf-Statistik.</p>
          </div>
          <div className="h-[500px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin mr-2" /> Lade Karte…
              </div>
            ) : (
              <MapContainer center={center} zoom={locations.length > 1 ? 6 : 12} className="h-full w-full" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => {
                  const radius = 10 + Math.min(40, Math.sqrt(loc.total_inserted));
                  return (
                    <CircleMarker
                      key={loc.id}
                      center={[loc.latitude, loc.longitude]}
                      radius={radius}
                      pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.4, weight: 2 }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
                        <div className="text-sm">
                          <div className="font-semibold">{loc.name}</div>
                          {loc.address && <div className="text-muted-foreground">{loc.address}</div>}
                          <div className="mt-1">
                            Eingeworfen: <strong>{loc.total_inserted.toLocaleString("de-DE")}</strong>
                          </div>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{loc.name}</div>
                          {loc.address && <div className="text-muted-foreground">{loc.address}</div>}
                          <div className="mt-1">
                            Eingeworfen: <strong>{loc.total_inserted.toLocaleString("de-DE")}</strong>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </div>

        {locations.length === 0 && !loading && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Noch keine Standorte. Fügen Sie Ihren ersten Standort hinzu, um ihn auf der Karte zu sehen.
          </p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

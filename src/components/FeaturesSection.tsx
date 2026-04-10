import { Settings, Leaf, Zap, Wrench, Shield, BarChart3 } from "lucide-react";
import sensorCloseup from "@/assets/sensor-closeup.jpg";

const features = [
  {
    icon: Wrench,
    title: "Sofort nachrüstbar",
    desc: "Unser kompakter Aufsatz lässt sich in wenigen Minuten auf jeden Standard-Glascontainer montieren – ohne bauliche Veränderungen.",
  },
  {
    icon: Settings,
    title: "Intelligente Erkennung",
    desc: "Hochpräzise LDR-Sensoren analysieren die Lichtdurchlässigkeit jeder Flasche und bestimmen die Glasfarbe in Millisekunden.",
  },
  {
    icon: Leaf,
    title: "Messbare CO₂-Reduktion",
    desc: "Durch fehlerfreie Sortierung sinkt der Energieverbrauch beim Einschmelzen um bis zu 30 % – ein direkter Beitrag zum Klimaschutz.",
  },
  {
    icon: Zap,
    title: "Kosten runter, Effizienz rauf",
    desc: "Manuelle Nachsortierung entfällt. Das spart Personal- und Reinigungskosten und steigert die Wirtschaftlichkeit Ihres Betriebs.",
  },
  {
    icon: Shield,
    title: "Robust & wartungsarm",
    desc: "Das wetterfeste 3D-gedruckte Gehäuse schützt die Elektronik zuverlässig. Der Wartungsaufwand ist minimal.",
  },
  {
    icon: BarChart3,
    title: "Datenbasierte Optimierung",
    desc: "Optionale Auswertungsfunktionen liefern wertvolle Daten über Sortiermengen und Fehlsortierquoten für Ihre Betriebsplanung.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Leistungen & Vorteile</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">Warum MD Sort Systems?</h2>
        <p className="text-muted-foreground text-lg">
          Unser System vereint Nachhaltigkeit mit Wirtschaftlichkeit – eine kompakte Lösung mit großer Wirkung.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={sensorCloseup} alt="Sensorik-Nahaufnahme am Glascontainer" loading="lazy" width={1024} height={680} className="w-full object-cover" />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.slice(0, 4).map((f) => (
            <div key={f.title} className="group rounded-xl bg-background p-6 border border-border hover:border-accent/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {features.slice(4).map((f) => (
          <div key={f.title} className="group rounded-xl bg-background p-6 border border-border hover:border-accent/40 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <f.icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

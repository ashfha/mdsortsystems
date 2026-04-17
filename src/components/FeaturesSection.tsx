import { Settings, Leaf, Zap, Wrench, Shield, BarChart3 } from "lucide-react";

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative rounded-2xl bg-background p-7 border border-border hover:border-accent/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <f.icon className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

import { Settings, Leaf, Zap, Wrench } from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Nachrüstbar",
    desc: "Passt auf bestehende Glascontainer – keine neue Infrastruktur nötig.",
  },
  {
    icon: Settings,
    title: "Automatische Sortierung",
    desc: "LDR-Sensoren erkennen Glasfarben und Servomotoren lenken korrekt um.",
  },
  {
    icon: Leaf,
    title: "CO₂-Reduktion",
    desc: "Weniger Fehlsortierungen senken den Energieverbrauch beim Recycling.",
  },
  {
    icon: Zap,
    title: "Kosteneffizient",
    desc: "Reduziert manuelle Nachsortierung und spart Personal- und Reinigungskosten.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Warum MD Sort Systems?</h2>
        <p className="text-muted-foreground text-lg">Ein kompakter Aufsatz. Maximale Wirkung für Umwelt und Kosten.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f) => (
          <div key={f.title} className="group rounded-xl bg-background p-8 border border-border hover:border-accent/40 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
              <f.icon className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

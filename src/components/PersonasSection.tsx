import { Building2, Factory, Landmark } from "lucide-react";

const personas = [
  {
    icon: Building2,
    title: "Stadien & Clubs",
    desc: "Hohe Glasmengen bei Events – automatische Sortierung reduziert Reinigungskosten und beschleunigt den Abbau.",
    stat: "–60% Reinigungszeit",
  },
  {
    icon: Factory,
    title: "Entsorgungsbetriebe",
    desc: "Höhere Glasreinheit bedeutet bessere Recyclingquoten und weniger Materialverlust.",
    stat: "95% Sortiergenauigkeit",
  },
  {
    icon: Landmark,
    title: "Kommunen & Städte",
    desc: "Weniger Fehlwürfe an öffentlichen Sammelstellen verbessern das Stadtbild und senken Folgekosten.",
    stat: "–40% Personalkosten",
  },
];

const PersonasSection = () => (
  <section id="personas" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Für wen ist das System?</h2>
        <p className="text-muted-foreground text-lg">Drei Zielgruppen, ein gemeinsames Ziel: effizienteres Glasrecycling.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {personas.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-card p-8 flex flex-col">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
              <p.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
            <div className="mt-6 pt-4 border-t border-border">
              <span className="text-2xl font-bold text-accent">{p.stat}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PersonasSection;

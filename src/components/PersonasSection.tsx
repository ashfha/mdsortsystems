import { Building2, Factory, Landmark } from "lucide-react";

const personas = [
  {
    icon: Building2,
    title: "Stadien & Eventlocations",
    desc: "Bei Großveranstaltungen fallen tausende Glasflaschen an. Unser System sortiert automatisch im Hintergrund – das reduziert den Reinigungsaufwand erheblich und beschleunigt den Abbau nach dem Event.",
    stat: "–60%",
    statLabel: "weniger Reinigungszeit",
    benefits: ["Schnellerer Abbau nach Events", "Weniger Personal nötig", "Sauberes Recycling ohne Nacharbeit"],
  },
  {
    icon: Factory,
    title: "Entsorgungsbetriebe",
    desc: "Fehlsortiertes Glas verursacht Qualitätsverluste und höhere Verarbeitungskosten. Mit unserer Sensorik steigt die Glasreinheit deutlich – für bessere Recyclingquoten und wirtschaftlichere Prozesse.",
    stat: "95%",
    statLabel: "Sortiergenauigkeit",
    benefits: ["Höhere Reinheitsgrade", "Bessere Recyclingquoten", "Geringerer Materialverlust"],
  },
  {
    icon: Landmark,
    title: "Kommunen & Städte",
    desc: "Fehlwürfe an öffentlichen Sammelstellen kosten Gemeinden jährlich Tausende Euro. Unser Aufsatz sorgt für korrekte Trennung direkt am Container – ohne zusätzliches Personal.",
    stat: "–40%",
    statLabel: "Personalkosten",
    benefits: ["Saubereres Stadtbild", "Weniger Folgekosten", "Bürgerfreundliche Lösung"],
  },
];

const PersonasSection = () => (
  <section id="personas" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Zielgruppen</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">Die richtige Lösung für Ihren Einsatzbereich</h2>
        <p className="text-muted-foreground text-lg">
          Ob Großevent, Recyclinghof oder kommunale Sammelstelle – unser System passt sich Ihrem Bedarf an.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {personas.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-card p-8 flex flex-col hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
              <p.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
            <ul className="space-y-2 mb-6 flex-1">
              {p.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border">
              <span className="text-3xl font-bold text-accent">{p.stat}</span>
              <span className="text-sm text-muted-foreground ml-2">{p.statLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PersonasSection;

import techDiagram from "@/assets/tech-diagram.jpg";

const steps = [
  {
    num: "01",
    title: "Einwurf",
    desc: "Die Flasche wird wie gewohnt in den Glascontainer eingeworfen – kein Umlernen für Bürger nötig.",
  },
  {
    num: "02",
    title: "Sensorische Erkennung",
    desc: "Hochempfindliche LDR-Sensoren messen die Lichtdurchlässigkeit in Echtzeit und bestimmen zuverlässig die Glasfarbe (weiß, braun oder grün).",
  },
  {
    num: "03",
    title: "Automatische Sortierung",
    desc: "Servomotoren lenken die Flasche präzise in das korrekte Fach. Die gesamte Analyse und Weichenstellung dauert unter einer Sekunde.",
  },
];

const TechSection = () => (
  <section id="tech" className="py-20 md:py-28 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Technologie</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">So funktioniert unser System</h2>
        <p className="text-muted-foreground text-lg">Drei Schritte. Weniger als eine Sekunde. Fehlerfrei.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={techDiagram} alt="Technische Funktionsweise: LDR-Sensor und Servomotor im Einsatz" loading="lazy" width={1024} height={768} className="w-full object-cover" />
        </div>
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-5">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                <span className="text-sm font-bold text-accent">{s.num}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TechSection;

import techDiagram from "@/assets/tech-diagram.jpg";

const steps = [
  { num: "01", title: "Einwurf", desc: "Die Flasche wird in den Container eingeworfen." },
  { num: "02", title: "Erkennung", desc: "LDR-Sensoren messen die Lichtdurchlässigkeit und bestimmen die Glasfarbe." },
  { num: "03", title: "Sortierung", desc: "Servomotoren lenken die Flasche in das korrekte Fach (weiß, braun, grün)." },
];

const TechSection = () => (
  <section id="tech" className="py-20 md:py-28 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Die Technologie dahinter</h2>
        <p className="text-muted-foreground text-lg">Einfach. Effektiv. Nachrüstbar.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={techDiagram} alt="Technische Funktionsweise: LDR-Sensor und Servomotor" loading="lazy" width={1024} height={768} className="w-full object-cover" />
        </div>
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-5">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
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

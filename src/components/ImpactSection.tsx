import recyclingFacility from "@/assets/recycling-facility.jpg";

const stats = [
  { value: "500 kg", label: "Weißglas, das durch eine einzige fehlsortierte farbige Flasche verunreinigt wird" },
  { value: "95%", label: "Sortiergenauigkeit unserer Sensorik – weit über dem manuellen Durchschnitt" },
  { value: "–30%", label: "Energieeinsparung beim Glasrecycling durch saubere Farbsortierung" },
  { value: "0", label: "Manueller Sortieraufwand direkt am Container" },
];

const ImpactSection = () => (
  <section id="impact" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Umweltwirkung</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">Jede Flasche zählt</h2>
        <p className="text-muted-foreground text-lg">
          Wussten Sie, dass eine einzige farbige Flasche eine halbe Tonne Weißglas unbrauchbar machen kann? Unser System sorgt dafür, dass das nicht passiert – automatisch und zuverlässig.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center rounded-xl bg-card border border-border p-6">
              <div className="text-3xl md:text-4xl font-extrabold text-accent mb-2">{s.value}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={recyclingFacility} alt="Sortierte Glasflaschen in einer Recyclinganlage" loading="lazy" width={1024} height={680} className="w-full object-cover" />
        </div>
      </div>
    </div>
  </section>
);

export default ImpactSection;

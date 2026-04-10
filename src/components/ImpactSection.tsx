const stats = [
  { value: "500 kg", label: "Weißglas gerettet pro fehlsortierter farbiger Flasche" },
  { value: "95%", label: "Sortiergenauigkeit durch Sensorik" },
  { value: "–30%", label: "Energieeinsparung beim Recyclingprozess" },
  { value: "0", label: "Manueller Sortieraufwand am Container" },
];

const ImpactSection = () => (
  <section id="impact" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Umweltwirkung</h2>
        <p className="text-muted-foreground text-lg">
          Eine einzige farbige Flasche kann 500 kg Weißglas verunreinigen. Unser System verhindert das – automatisch.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center rounded-xl bg-card border border-border p-8">
            <div className="text-4xl md:text-5xl font-extrabold text-accent mb-3">{s.value}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ImpactSection;

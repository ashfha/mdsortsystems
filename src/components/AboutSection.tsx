import aboutTeam from "@/assets/about-team.jpg";
import { Target, Users, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Unsere Mission",
    desc: "Wir machen Glasrecycling effizienter, wirtschaftlicher und umweltfreundlicher – durch smarte Automatisierung, die sich in bestehende Infrastruktur integriert.",
  },
  {
    icon: Users,
    title: "Unser Team",
    desc: "Ein interdisziplinäres Team aus Ingenieuren, Umweltwissenschaftlern und Produktdesignern arbeitet daran, Recycling auf das nächste Level zu heben.",
  },
  {
    icon: Lightbulb,
    title: "Unsere Vision",
    desc: "Eine Welt, in der Glasrecycling vollständig automatisiert abläuft – ohne Fehlsortierungen, ohne manuellen Aufwand, mit maximaler Ressourcenschonung.",
  },
];

const AboutSection = () => (
  <section id="about" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Über uns</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">Die Köpfe hinter MD Sort Systems</h2>
        <p className="text-muted-foreground text-lg">
          Als Green-Tech-Startup aus Deutschland verbinden wir Ingenieurskunst mit dem Ziel, nachhaltige Lösungen für die Abfallwirtschaft zu schaffen.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={aboutTeam} alt="Das Team von MD Sort Systems im Labor" loading="lazy" width={1024} height={680} className="w-full object-cover" />
        </div>
        <div className="space-y-8">
          {values.map((v) => (
            <div key={v.title} className="flex gap-5">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;

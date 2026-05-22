import heroProduct from "@/assets/hero-product-new.jpeg";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const highlights = [
  "Nachrüstbar auf bestehende Container",
  "95 % Sortiergenauigkeit",
  "Bis zu 30 % Energieeinsparung",
];

const HeroSection = () => (
  <section className="relative pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-primary opacity-[0.03]" />
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Green Tech Innovation aus Deutschland
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
            Glasrecycling neu gedacht – vollautomatisch und{" "}
            <span className="text-accent">nachhaltig</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            MD Sort Systems entwickelt modulare Sensoraufsätze, die Glasfarben in Echtzeit erkennen und fehlerfrei sortieren. Einfach nachrüstbar auf jeden handelsüblichen Glascontainer – für Kommunen, Entsorgungsbetriebe und Eventveranstalter.
          </p>
          <ul className="space-y-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#cta" className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Jetzt Angebot anfragen
              <ArrowRight size={18} />
            </a>
            <a href="#tech" className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors">
              Mehr erfahren
            </a>
          </div>
        </div>
        <div className="relative animate-fade-in flex justify-center items-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent blur-3xl rounded-full" />
          <img
            src={heroProduct}
            alt="MD Sort Systems – modularer Sensoraufsatz auf Glascontainer"
            width={640}
            height={480}
            className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

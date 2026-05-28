import heroProduct from "@/assets/hero-product-new.jpeg";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const highlights = [
  "Nachrüstbar auf bestehende Container",
  "95 % Sortiergenauigkeit",
  "Bis zu 30 % Energieeinsparung",
];

const HeroSection = () => (
  <section className="relative pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.16),transparent_28rem),linear-gradient(135deg,hsl(var(--background)),hsl(var(--card)))]" />
    <div className="absolute left-1/2 top-24 h-48 w-[38rem] -translate-x-1/2 rounded-full border border-accent/20 bg-accent/10 blur-3xl" />
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent shadow-sm shadow-accent/10 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent))]" />
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
            <a href="#cta" className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:opacity-90 transition-all">
              Jetzt Angebot anfragen
              <ArrowRight size={18} />
            </a>
            <a href="#tech" className="inline-flex items-center justify-center rounded-lg border border-border bg-background/70 px-8 py-3 text-base font-semibold text-foreground backdrop-blur hover:bg-muted transition-colors">
              Mehr erfahren
            </a>
          </div>
        </div>
        <div className="relative animate-fade-in flex justify-center items-center">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-accent/25 via-primary/15 to-transparent blur-3xl" />
          <div className="relative rounded-2xl border border-border/70 bg-background/45 p-5 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <div className="absolute right-6 top-6 rounded-full border border-accent/20 bg-background/80 px-3 py-1 text-xs font-semibold text-accent shadow-sm backdrop-blur">
              Live-Sensorik
            </div>
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
    </div>
  </section>
);

export default HeroSection;

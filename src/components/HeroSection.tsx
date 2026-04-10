import heroProduct from "@/assets/hero-product.jpg";

const HeroSection = () => (
  <section className="relative pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-primary opacity-[0.03]" />
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Green Tech Innovation
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
            Recycling revolutionieren durch{" "}
            <span className="text-accent">Automatisierung</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Unser modularer Sensoraufsatz erkennt Glasfarben automatisch und sortiert fehlerfrei – nachrüstbar auf bestehende Glascontainer.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#cta" className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Angebot anfragen
            </a>
            <a href="#tech" className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors">
              Technologie entdecken
            </a>
          </div>
        </div>
        <div className="relative animate-fade-in flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={heroProduct} alt="MD Sort Systems Technical Box auf Glascontainer" width={640} height={480} className="w-full max-w-lg object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

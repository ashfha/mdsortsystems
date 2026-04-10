import { ArrowRight, Mail, Phone } from "lucide-react";

const CtaSection = () => (
  <section id="cta" className="py-20 md:py-28 bg-primary">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
        Bereit für intelligentes Glasrecycling?
      </h2>
      <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
        Lassen Sie sich unverbindlich beraten und erfahren Sie, wie unser System Ihre Recyclingprozesse optimiert. Wir erstellen Ihnen gerne ein individuelles Angebot.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <a
          href="mailto:info@mdsort.systems"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-10 py-4 text-base font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Jetzt Angebot anfragen
          <ArrowRight size={18} />
        </a>
        <a
          href="#features"
          className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-10 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
        >
          Mehr über das Produkt
        </a>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-primary-foreground/70">
        <span className="flex items-center gap-2">
          <Mail size={16} />
          info@mdsort.systems
        </span>
        <span className="flex items-center gap-2">
          <Phone size={16} />
          +49 (0) 123 456 789
        </span>
      </div>
    </div>
  </section>
);

export default CtaSection;

const CtaSection = () => (
  <section id="cta" className="py-20 md:py-28 bg-primary">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Bereit für smartes Glasrecycling?</h2>
      <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
        Kontaktieren Sie uns für eine individuelle Beratung und ein unverbindliches Angebot.
      </p>
      <a
        href="mailto:info@mdsort.systems"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-10 py-4 text-base font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Angebot anfragen
      </a>
    </div>
  </section>
);

export default CtaSection;

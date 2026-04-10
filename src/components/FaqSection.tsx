import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Kann das System auf jeden Glascontainer nachgerüstet werden?",
    a: "Ja, unser modularer Aufsatz ist so konzipiert, dass er auf alle gängigen Glascontainer-Modelle passt. Die Montage dauert in der Regel weniger als 30 Minuten und erfordert keine baulichen Veränderungen am Container.",
  },
  {
    q: "Wie genau erkennt der Sensor die Glasfarbe?",
    a: "Unsere LDR-Sensoren messen die Lichtdurchlässigkeit des Glases mit einer Genauigkeit von 95 %. Sie unterscheiden zuverlässig zwischen Weißglas, Braunglas und Grünglas – in Echtzeit und unter verschiedensten Lichtverhältnissen.",
  },
  {
    q: "Wie hoch sind die Betriebskosten?",
    a: "Die Betriebskosten sind minimal. Der Sensor verbraucht sehr wenig Strom und das System ist nahezu wartungsfrei. Die Einsparungen durch wegfallende manuelle Sortierung übersteigen die Betriebskosten in der Regel deutlich.",
  },
  {
    q: "Benötigt das System eine Stromversorgung?",
    a: "Ja, das System benötigt eine Niederspannungs-Stromversorgung. In den meisten Fällen kann ein einfacher Akku oder eine Solaranlage als autarke Energiequelle eingesetzt werden.",
  },
  {
    q: "Wie wetterfest ist das Gehäuse?",
    a: "Das 3D-gedruckte Gehäuse besteht aus robustem, wetterfestem Material und ist für den ganzjährigen Außeneinsatz ausgelegt. Es schützt die Elektronik zuverlässig vor Regen, Staub und Temperaturschwankungen.",
  },
  {
    q: "Kann ich eine Demo oder ein Testgerät anfragen?",
    a: "Selbstverständlich. Kontaktieren Sie uns über das Formular unten, und wir vereinbaren gerne eine Live-Demo oder stellen Ihnen ein Testgerät für Ihre Anlage zur Verfügung.",
  },
];

const FaqSection = () => (
  <section id="faq" className="py-20 md:py-28 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">FAQ</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">Häufig gestellte Fragen</h2>
        <p className="text-muted-foreground text-lg">
          Alles, was Sie über unser System wissen müssen – kurz und verständlich beantwortet.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-background px-6">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FaqSection;

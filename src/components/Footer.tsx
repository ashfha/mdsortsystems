import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="py-12 border-t border-border bg-background">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="MD Sort Systems" className="h-8 w-8" />
            <span className="font-semibold text-foreground">MD Sort Systems</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Automatisierte Glassortiertechnologie für eine nachhaltigere Zukunft. Made in Germany.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
          <div className="space-y-2 text-sm">
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Leistungen & Vorteile</a>
            <a href="#personas" className="block text-muted-foreground hover:text-foreground transition-colors">Zielgruppen</a>
            <a href="#tech" className="block text-muted-foreground hover:text-foreground transition-colors">Technologie</a>
            <a href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">Über uns</a>
            <a href="#faq" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Kontakt</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>info@mdsort.systems</p>
            <p>+49 (0) 123 456 789</p>
            <p>Deutschland</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2026 MD Sort Systems. Alle Rechte vorbehalten.</p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
          <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
          <a href="#" className="hover:text-foreground transition-colors">AGB</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

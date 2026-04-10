import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="py-12 border-t border-border bg-background">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="MD Sort Systems" className="h-8 w-8" />
          <span className="font-semibold text-foreground">MD Sort Systems</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Produkt</a>
          <a href="#personas" className="hover:text-foreground transition-colors">Zielgruppen</a>
          <a href="#tech" className="hover:text-foreground transition-colors">Technologie</a>
          <a href="#impact" className="hover:text-foreground transition-colors">Umwelt</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 MD Sort Systems. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

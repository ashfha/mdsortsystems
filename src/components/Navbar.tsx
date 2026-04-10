import { useState } from "react";
import logo from "@/assets/logo.png";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Produkt", href: "#features" },
    { label: "Zielgruppen", href: "#personas" },
    { label: "Technologie", href: "#tech" },
    { label: "Umwelt", href: "#impact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="MD Sort Systems" className="h-10 w-10" />
          <span className="font-bold text-lg text-foreground">MD Sort Systems</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#cta" className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Angebot anfragen
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <a href="#cta" onClick={() => setOpen(false)} className="block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground text-center">
            Angebot anfragen
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

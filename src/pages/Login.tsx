import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img src={logo} alt="MD Sort Systems" className="h-10 w-10" />
              <span className="font-bold text-lg text-foreground">MD Sort Systems</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Passwort zurücksetzen</h1>
            <p className="text-muted-foreground mt-2">Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-Mail-Adresse</Label>
                <Input id="reset-email" type="email" placeholder="name@firma.de" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                Link senden
              </button>
            </form>
            <button onClick={() => setShowForgot(false)} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Zurück zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MD Sort Systems" className="h-10 w-10" />
            <span className="font-bold text-lg text-foreground">MD Sort Systems</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isRegister ? "Konto erstellen" : "Willkommen zurück"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRegister
              ? "Registrieren Sie sich, um Zugang zum Kundenportal zu erhalten."
              : "Melden Sie sich in Ihrem Kundenportal an."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Firmenname</Label>
                <Input id="name" type="text" placeholder="Muster GmbH" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input id="email" type="email" placeholder="name@firma.de" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                {!isRegister && (
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-accent hover:underline">
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Passwort bestätigen</Label>
                <Input id="password-confirm" type="password" placeholder="••••••••" />
              </div>
            )}
            <button type="submit" className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              {isRegister ? "Registrieren" : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? (
              <>
                Bereits ein Konto?{" "}
                <button onClick={() => setIsRegister(false)} className="text-accent hover:underline font-medium">
                  Jetzt anmelden
                </button>
              </>
            ) : (
              <>
                Noch kein Konto?{" "}
                <button onClick={() => setIsRegister(true)} className="text-accent hover:underline font-medium">
                  Jetzt registrieren
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mit der Anmeldung stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.
        </p>
      </div>
    </div>
  );
};

export default Login;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email("Ungültige E-Mail-Adresse").max(255);
const passwordSchema = z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein").max(72);
const companySchema = z.string().trim().min(1, "Firmenname erforderlich").max(100);

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [company, setCompany] = useState("");

  // Redirect if already signed in
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Eingabe ungültig", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message.includes("Invalid login")
        ? "E-Mail oder Passwort ist falsch."
        : error.message;
      toast({ title: "Anmeldung fehlgeschlagen", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Willkommen zurück!", description: "Sie sind erfolgreich angemeldet." });
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      companySchema.parse(company);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Eingabe ungültig", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    if (password !== passwordConfirm) {
      toast({ title: "Passwörter stimmen nicht überein", variant: "destructive" });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { company_name: company },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.includes("already registered")
        ? "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an."
        : error.message;
      toast({ title: "Registrierung fehlgeschlagen", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Konto erstellt!", description: "Sie sind nun angemeldet." });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Eingabe ungültig", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "E-Mail verschickt",
      description: "Prüfen Sie Ihr Postfach für den Link zum Zurücksetzen.",
    });
    setShowForgot(false);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img src={logo} alt="MD Sort Systems" className="h-10" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Passwort zurücksetzen</h1>
            <p className="text-muted-foreground mt-2">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <form onSubmit={handleForgot} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-Mail-Adresse</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@firma.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Link senden
              </button>
            </form>
            <button
              onClick={() => setShowForgot(false)}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Zurück zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MD Sort Systems" className="h-10" />
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
          <form onSubmit={isRegister ? handleSignUp : handleSignIn} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Firmenname</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Muster GmbH"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-accent hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Passwort bestätigen</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? "Registrieren" : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? (
              <>
                Bereits ein Konto?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-accent hover:underline font-medium"
                >
                  Jetzt anmelden
                </button>
              </>
            ) : (
              <>
                Noch kein Konto?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-accent hover:underline font-medium"
                >
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

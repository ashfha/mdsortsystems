// External Supabase project (read-only) — Quelle für Einwürfe
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_URL = "https://uqyymevzcfxfrrvsejpo.supabase.co";
const EXTERNAL_PUBLISHABLE_KEY = "sb_publishable_szmpi7X3c7YoSshN5r0vUw_zpGe_Nq4";

export const externalSupabase = createClient(EXTERNAL_URL, EXTERNAL_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type EinwurfRow = {
  id: string;
  standort_id: string | null;
  material: string;
  anzahl: number;
  timestamp: string | null;
  created_at: string | null;
};

// Erkennt explizite "keine Flasche"-Einträge, die ignoriert werden sollen
export const isNoBottle = (m: string) => {
  const v = (m ?? "").toLowerCase().trim();
  if (!v) return true;
  return (
    v.includes("keine") || v === "none" || v === "no_bottle" ||
    v === "no bottle" || v.includes("nichts") || v.includes("unbekannt") ||
    v.includes("unknown")
  );
};

export const isWhiteMaterial = (m: string) => {
  if (isNoBottle(m)) return false;
  const v = (m ?? "").toLowerCase().trim();
  return v.includes("weiss") || v.includes("weiß") || v.includes("white") || v.includes("klar") || v.includes("clear");
};

export const isColoredMaterial = (m: string) => {
  if (isNoBottle(m)) return false;
  if (isWhiteMaterial(m)) return false;
  const v = (m ?? "").toLowerCase().trim();
  return (
    v.includes("bunt") || v.includes("color") || v.includes("grün") || v.includes("gruen") ||
    v.includes("green") || v.includes("braun") || v.includes("brown") || v.includes("amber")
  );
};

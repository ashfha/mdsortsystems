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

export const isWhiteMaterial = (m: string) => {
  const v = (m ?? "").toLowerCase().trim();
  return v === "weiss" || v === "weiß" || v === "white" || v === "klar";
};

export const isColoredMaterial = (m: string) => {
  const v = (m ?? "").toLowerCase().trim();
  return (
    v === "bunt" || v === "colored" || v === "grün" || v === "gruen" ||
    v === "braun" || v === "green" || v === "brown"
  );
};

// External Supabase project (read-only) — Quelle für standorte & einwuerfe
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_URL = "https://uqyymevzcfxfrrvsejpo.supabase.co";
const EXTERNAL_PUBLISHABLE_KEY = "sb_publishable_szmpi7X3c7YoSshN5r0vUw_zpGe_Nq4";

export const externalSupabase = createClient(EXTERNAL_URL, EXTERNAL_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type StandortRow = {
  id: string;
  name?: string | null;
  bezeichnung?: string | null;
  adresse?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  breitengrad?: number | null;
  laengengrad?: number | null;
  [key: string]: unknown;
};

export type EinwurfRow = {
  id: string;
  standort_id: string | null;
  material: string;
  anzahl: number;
  timestamp: string | null;
  created_at: string | null;
};

export const normalizeStandort = (s: StandortRow) => {
  const lat =
    (s.latitude as number | null) ??
    (s.lat as number | null) ??
    (s.breitengrad as number | null) ??
    null;
  const lng =
    (s.longitude as number | null) ??
    (s.lng as number | null) ??
    (s.laengengrad as number | null) ??
    null;
  return {
    id: s.id,
    name: (s.name ?? s.bezeichnung ?? "Standort") as string,
    address: (s.adresse ?? s.address ?? null) as string | null,
    latitude: typeof lat === "number" ? lat : Number(lat ?? 0),
    longitude: typeof lng === "number" ? lng : Number(lng ?? 0),
  };
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

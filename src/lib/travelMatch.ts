export type Climate = "warm" | "cool" | "tropical" | "temperate" | "cold" | "any";
export type LuxuryLevel = "budget" | "midrange" | "premium" | "luxury";
export type TripVibe = "beach" | "city" | "nature" | "food" | "nightlife" | "family" | "relax" | "culture" | "adventure";
export type PartyType = "solo" | "couple" | "family" | "friends" | "any";

export type TravelPreferences = {
  rawInput: string;
  budgetMax?: number | null;
  durationDays?: number | null;
  month?: string | null;
  departure?: string | null;
  climate?: Climate;
  luxury?: LuxuryLevel;
  party?: PartyType;
  travelers?: number | null;
  vibes: TripVibe[];
  exclusions: string[];
  mustHaves: string[];
  notes: string[];
};

export type TravelRecommendation = {
  id: string;
  name: string;
  country: string;
  iata: string;
  image: string;
  tagline: string;
  matchScore: number;
  valueScore: number;
  estimatedTotalEur: number;
  flightEur: number;
  hotelNightlyEur: number;
  weather: {
    period: string;
    highC: number;
    lowC: number;
    rain: "low" | "medium" | "high";
    summary: string;
  };
  scoreBreakdown: {
    climate: number;
    vibe: number;
    budget: number;
    ease: number;
    value: number;
  };
  reasons: string[];
  activities: string[];
  tips: string[];
};

export type TravelBundle = {
  parsed: TravelPreferences;
  recommendations: TravelRecommendation[];
};

type DestinationSeed = {
  id: string;
  name: string;
  country: string;
  iata: string;
  image: string;
  tagline: string;
  climate: Climate;
  vibes: TripVibe[];
  bestMonths: string[];
  flightFromEurope: number;
  flightFromUK: number;
  flightFromUS: number;
  flightFromGulf: number;
  hotelNightly: Record<LuxuryLevel, number>;
  activities: string[];
  tips: string[];
  weather: Record<string, { high: number; low: number; rain: "low" | "medium" | "high" }>;
};

const DESTINATIONS: DestinationSeed[] = [
  {
    id: "mallorca",
    name: "Mallorca",
    country: "Spain",
    iata: "PMI",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5b8?auto=format&fit=crop&w=1200&q=80",
    tagline: "Easy premium beach escape with coves, food and polished hotels.",
    climate: "warm",
    vibes: ["beach", "food", "relax", "family", "culture"],
    bestMonths: ["april", "may", "june", "september", "october"],
    flightFromEurope: 180,
    flightFromUK: 130,
    flightFromUS: 620,
    flightFromGulf: 310,
    hotelNightly: { budget: 120, midrange: 190, premium: 320, luxury: 560 },
    activities: ["Hidden coves", "Palma old town", "Sunset boat day", "Wine tasting", "Coastal drives"],
    tips: ["Book a car for the quieter beaches.", "Best mix of value and comfort in shoulder season."],
    weather: {
      spring: { high: 23, low: 14, rain: "low" },
      summer: { high: 30, low: 20, rain: "low" },
      autumn: { high: 26, low: 17, rain: "low" },
      winter: { high: 16, low: 9, rain: "medium" },
    },
  },
  {
    id: "crete",
    name: "Crete",
    country: "Greece",
    iata: "HER",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8f2b6bd?auto=format&fit=crop&w=1200&q=80",
    tagline: "Big island energy: beaches, villages, mountain roads and great value.",
    climate: "warm",
    vibes: ["beach", "nature", "food", "family", "culture", "adventure"],
    bestMonths: ["may", "june", "september", "october"],
    flightFromEurope: 210,
    flightFromUK: 160,
    flightFromUS: 680,
    flightFromGulf: 340,
    hotelNightly: { budget: 95, midrange: 165, premium: 290, luxury: 490 },
    activities: ["Balos lagoon", "Traditional villages", "Samaria gorge", "Tavernas", "Boat trips"],
    tips: ["Great value if you like road trips.", "Pick the west side for more dramatic scenery."],
    weather: {
      spring: { high: 24, low: 15, rain: "low" },
      summer: { high: 31, low: 22, rain: "low" },
      autumn: { high: 27, low: 18, rain: "low" },
      winter: { high: 17, low: 11, rain: "medium" },
    },
  },
  {
    id: "madeira",
    name: "Madeira",
    country: "Portugal",
    iata: "FNC",
    image: "https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=1200&q=80",
    tagline: "Green cliffs, premium calm, hiking and a mild year-round climate.",
    climate: "temperate",
    vibes: ["nature", "relax", "adventure", "culture", "food"],
    bestMonths: ["march", "april", "may", "september", "october", "november"],
    flightFromEurope: 240,
    flightFromUK: 190,
    flightFromUS: 700,
    flightFromGulf: 380,
    hotelNightly: { budget: 110, midrange: 180, premium: 320, luxury: 540 },
    activities: ["Levada hikes", "Coast viewpoints", "Seafood dinners", "Cable car rides", "Whale watching"],
    tips: ["A car gives you much more flexibility.", "Perfect if you want active days without beach crowds."],
    weather: {
      spring: { high: 21, low: 15, rain: "medium" },
      summer: { high: 25, low: 18, rain: "low" },
      autumn: { high: 24, low: 18, rain: "medium" },
      winter: { high: 19, low: 14, rain: "medium" },
    },
  },
  {
    id: "antalya",
    name: "Antalya",
    country: "Turkey",
    iata: "AYT",
    image: "https://images.unsplash.com/photo-1569830503708-99e6f5c50a0b?auto=format&fit=crop&w=1200&q=80",
    tagline: "Big resort value with beaches, old town charm and strong all-inclusive deals.",
    climate: "warm",
    vibes: ["beach", "family", "relax", "food", "nightlife"],
    bestMonths: ["april", "may", "june", "september", "october"],
    flightFromEurope: 170,
    flightFromUK: 150,
    flightFromUS: 720,
    flightFromGulf: 260,
    hotelNightly: { budget: 85, midrange: 140, premium: 230, luxury: 420 },
    activities: ["Old town Kaleiçi", "Waterfalls", "Beach clubs", "Boat tours", "Resort spas"],
    tips: ["Strongest budget-to-comfort ratio in this list.", "Great for all-inclusive if you want simple planning."],
    weather: {
      spring: { high: 25, low: 15, rain: "low" },
      summer: { high: 34, low: 24, rain: "low" },
      autumn: { high: 28, low: 18, rain: "low" },
      winter: { high: 16, low: 8, rain: "medium" },
    },
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    iata: "LIS",
    image: "https://images.unsplash.com/photo-1515450684190-932f845a6bc8?auto=format&fit=crop&w=1200&q=80",
    tagline: "Stylish city break with food, views and an easy long-weekend feel.",
    climate: "temperate",
    vibes: ["city", "food", "culture", "nightlife", "relax"],
    bestMonths: ["march", "april", "may", "june", "september", "october"],
    flightFromEurope: 150,
    flightFromUK: 120,
    flightFromUS: 560,
    flightFromGulf: 350,
    hotelNightly: { budget: 100, midrange: 170, premium: 300, luxury: 500 },
    activities: ["Tram rides", "Rooftop bars", "Seafood markets", "Day trip to Cascais", "Historic neighborhoods"],
    tips: ["Best for a short trip with lots of atmosphere.", "Walkable, but hills make good shoes important."],
    weather: {
      spring: { high: 22, low: 13, rain: "medium" },
      summer: { high: 29, low: 18, rain: "low" },
      autumn: { high: 24, low: 16, rain: "medium" },
      winter: { high: 15, low: 9, rain: "medium" },
    },
  },
  {
    id: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    iata: "ZNZ",
    image: "https://images.unsplash.com/photo-1522093007474-d86e75c2b6ae?auto=format&fit=crop&w=1200&q=80",
    tagline: "Tropical beach and spice-island mood with boutique resort style.",
    climate: "tropical",
    vibes: ["beach", "relax", "food", "nature", "adventure"],
    bestMonths: ["june", "july", "august", "september", "october", "january", "february"],
    flightFromEurope: 620,
    flightFromUK: 560,
    flightFromUS: 980,
    flightFromGulf: 430,
    hotelNightly: { budget: 140, midrange: 220, premium: 390, luxury: 680 },
    activities: ["Stone Town", "Spice tours", "Dhow cruises", "Snorkeling", "Private beaches"],
    tips: ["Best if you want warm water and a slower pace.", "Check tides when planning beach days."],
    weather: {
      spring: { high: 31, low: 25, rain: "high" },
      summer: { high: 29, low: 23, rain: "low" },
      autumn: { high: 30, low: 24, rain: "low" },
      winter: { high: 32, low: 25, rain: "high" },
    },
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    iata: "BKK",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    tagline: "High-energy city with unbeatable food, shopping and easy island connections.",
    climate: "tropical",
    vibes: ["city", "food", "nightlife", "culture", "adventure"],
    bestMonths: ["november", "december", "january", "february", "march"],
    flightFromEurope: 720,
    flightFromUK: 610,
    flightFromUS: 920,
    flightFromGulf: 380,
    hotelNightly: { budget: 55, midrange: 110, premium: 220, luxury: 430 },
    activities: ["Street food", "Temples", "Skybars", "Markets", "Day trips to river towns"],
    tips: ["Best as a first stop before a beach island.", "Use the train network to save time in traffic."],
    weather: {
      spring: { high: 35, low: 27, rain: "high" },
      summer: { high: 32, low: 26, rain: "high" },
      autumn: { high: 31, low: 25, rain: "medium" },
      winter: { high: 33, low: 26, rain: "medium" },
    },
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    iata: "DPS",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    tagline: "The classic long-haul mix of surf, villas, wellness and jungle scenery.",
    climate: "tropical",
    vibes: ["beach", "nature", "relax", "adventure", "culture", "food"],
    bestMonths: ["april", "may", "june", "july", "august", "september"],
    flightFromEurope: 860,
    flightFromUK: 800,
    flightFromUS: 1120,
    flightFromGulf: 520,
    hotelNightly: { budget: 60, midrange: 130, premium: 250, luxury: 520 },
    activities: ["Rice terraces", "Beach clubs", "Villas", "Surf", "Jungle cafes"],
    tips: ["Stay a bit longer to make the flight worth it.", "Strong option for couples or friends chasing variety."],
    weather: {
      spring: { high: 31, low: 25, rain: "medium" },
      summer: { high: 30, low: 24, rain: "low" },
      autumn: { high: 31, low: 24, rain: "medium" },
      winter: { high: 30, low: 25, rain: "high" },
    },
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    iata: "DXB",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    tagline: "Luxury, shopping, skyline hotels and a very polished city break.",
    climate: "warm",
    vibes: ["city", "nightlife", "food", "family", "relax"],
    bestMonths: ["november", "december", "january", "february", "march"],
    flightFromEurope: 260,
    flightFromUK: 220,
    flightFromUS: 820,
    flightFromGulf: 120,
    hotelNightly: { budget: 120, midrange: 220, premium: 430, luxury: 850 },
    activities: ["Skyline hotels", "Desert safari", "Beach clubs", "Malls", "Fine dining"],
    tips: ["Choose it if you want smooth logistics and luxury polish.", "Great winter city escape from Europe."],
    weather: {
      spring: { high: 31, low: 23, rain: "low" },
      summer: { high: 41, low: 31, rain: "low" },
      autumn: { high: 35, low: 27, rain: "low" },
      winter: { high: 25, low: 18, rain: "low" },
    },
  },
];

const MONTH_ALIASES: Record<string, string> = {
  january: "january",
  february: "february",
  march: "march",
  april: "april",
  may: "may",
  june: "june",
  july: "july",
  august: "august",
  september: "september",
  october: "october",
  november: "november",
  december: "december",
  jan: "january",
  feb: "february",
  mar: "march",
  apr: "april",
  jun: "june",
  jul: "july",
  aug: "august",
  sep: "september",
  sept: "september",
  oct: "october",
  nov: "november",
  dec: "december",
};

const VIBE_KEYWORDS: Array<{ key: TripVibe; words: string[] }> = [
  { key: "beach", words: ["beach", "strand", "sea", "meer", "snorkel", "water"] },
  { key: "city", words: ["city", "stadt", "urban", "walkable", "metropole"] },
  { key: "nature", words: ["nature", "natur", "mountain", "hike", "hiking", "berg", "outdoor"] },
  { key: "food", words: ["food", "essen", "restaurant", "cuisine", "kulinar", "street food"] },
  { key: "nightlife", words: ["nightlife", "party", "club", "bars", "bar", "feiern"] },
  { key: "family", words: ["family", "familie", "kids", "children", "kind"] },
  { key: "relax", words: ["relax", "ruhe", "quiet", "calm", "chill", "entspann"] },
  { key: "culture", words: ["culture", "kultur", "historic", "altstadt", "museum"] },
  { key: "adventure", words: ["adventure", "abenteuer", "surf", "diving", "trek", "aktiv"] },
];

const CITY_ALIASES: Array<{ match: RegExp; label: string }> = [
  { match: /stuttgart/i, label: "Stuttgart" },
  { match: /frankfurt/i, label: "Frankfurt" },
  { match: /münchen|munich/i, label: "München" },
  { match: /berlin/i, label: "Berlin" },
  { match: /hamburg/i, label: "Hamburg" },
  { match: /london/i, label: "London" },
  { match: /nyc|new york/i, label: "New York" },
  { match: /zurich|zürich/i, label: "Zürich" },
  { match: /vienna|wien/i, label: "Wien" },
  { match: /dubai/i, label: "Dubai" },
];

const numberFromText = (text: string) => {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
};

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function detectMonth(text: string): string | null {
  const lower = text.toLowerCase();
  const found = Object.entries(MONTH_ALIASES).find(([alias]) => lower.includes(alias));
  return found ? found[1] : null;
}

function detectDeparture(text: string): string | null {
  const direct = CITY_ALIASES.find((item) => item.match.test(text));
  if (direct) return direct.label;

  const fromMatch = text.match(/from\s+([a-zäöüß\- ]{3,40})/i) ?? text.match(/ab\s+([a-zäöüß\- ]{3,40})/i);
  if (!fromMatch) return null;
  const value = fromMatch[1].trim();
  return value ? value.replace(/[.,]$/, "") : null;
}

function detectClimate(text: string): Climate {
  if (containsAny(text, ["tropical", "tropisch", "jungle", "jungle"])) return "tropical";
  if (containsAny(text, ["cold", "kalt", "ski", "snow", "winter"])) return "cold";
  if (containsAny(text, ["cool", "fresh", "mild", "frisch", "kühl"])) return "cool";
  if (containsAny(text, ["temperate", "mild", "balanc", "pleasant", "angenehm"])) return "temperate";
  if (containsAny(text, ["warm", "hot", "heiß", "sonne", "sun", "beach", "strand"])) return "warm";
  return "any";
}

function detectLuxury(text: string): LuxuryLevel {
  if (containsAny(text, ["luxury", "luxus", "5 star", "five star", "high-end"])) return "luxury";
  if (containsAny(text, ["premium", "upscale", "gehoben", "comfortable", "komfort"])) return "premium";
  if (containsAny(text, ["budget", "cheap", "günstig", "low", "sparen", "preiswert"])) return "budget";
  return "midrange";
}

function detectPartyType(text: string): PartyType {
  if (containsAny(text, ["family", "familie", "kids", "children", "kind"])) return "family";
  if (containsAny(text, ["couple", "honeymoon", "paar", "romantic", "romantisch"])) return "couple";
  if (containsAny(text, ["solo", "alone", "allein"])) return "solo";
  if (containsAny(text, ["friends", "freunde", "group", "gang"])) return "friends";
  return "any";
}

function detectVibes(text: string): TripVibe[] {
  const vibes = VIBE_KEYWORDS.filter((entry) => containsAny(text, entry.words)).map((entry) => entry.key);
  return Array.from(new Set(vibes));
}

function detectMustHaves(text: string): string[] {
  const mustHaves: string[] = [];
  if (containsAny(text, ["must", "muss", "wichtig", "need", "want", "brauche"])) {
    for (const vibe of detectVibes(text)) mustHaves.push(vibe);
  }
  return Array.from(new Set(mustHaves));
}

function detectExclusions(text: string): string[] {
  const exclusions: string[] = [];
  const lower = text.toLowerCase();
  const patterns = [
    ["party", /(?:kein|no|without|ohne)\s+party/],
    ["crowds", /(?:kein|no|without|ohne)\s+(?:massentourismus|crowds|crowd|tourists?)/],
    ["hot", /(?:kein|no|without|ohne)\s+(?:extreme heat|extreme hitze|heiß|hot)/],
    ["kids", /(?:kein|no|without|ohne)\s+(?:kids|children|family|familie)/],
  ] as const;
  for (const [label, regex] of patterns) if (regex.test(lower)) exclusions.push(label);
  return exclusions;
}

export function parseTravelPrompt(rawInput: string): TravelPreferences {
  const clean = rawInput.trim();
  const lower = clean.toLowerCase();
  const budgetMax = (() => {
    const withCurrency = clean.match(/(\d[\d.,]*)\s?(?:€|eur|euro|usd|\$)/i);
    const money = withCurrency ? Number(withCurrency[1].replace(/\./g, "").replace(",", ".")) : null;
    if (money) return money;
    const around = lower.match(/(?:under|max|bis|unter|limit)\s*(?:of\s*)?(\d[\d.,]*)/i);
    return around ? Number(around[1].replace(/\./g, "").replace(",", ".")) : null;
  })();

  const durationDays = (() => {
    const days = clean.match(/(\d+)\s*(?:days?|tagen?|nächte|nights?)/i);
    if (days) return Number(days[1]);
    const weeks = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:weeks?|wochen?)/i);
    if (weeks) return Math.round(Number(weeks[1].replace(",", ".")) * 7);
    return null;
  })();

  const travelers = (() => {
    const group = clean.match(/(\d+)\s*(?:people|persons|travellers|travelers|personen|gäste)/i);
    return group ? Number(group[1]) : null;
  })();

  return {
    rawInput: clean,
    budgetMax,
    durationDays,
    month: detectMonth(clean),
    departure: detectDeparture(clean),
    climate: detectClimate(lower),
    luxury: detectLuxury(lower),
    party: detectPartyType(lower),
    travelers,
    vibes: detectVibes(lower),
    exclusions: detectExclusions(lower),
    mustHaves: detectMustHaves(lower),
    notes: lower.split(/[\n.]/).map((part) => part.trim()).filter(Boolean).slice(0, 6),
  };
}

function departureRegion(departure: string | null): "europe" | "uk" | "us" | "gulf" | "other" {
  if (!departure) return "europe";
  const lower = departure.toLowerCase();
  if (containsAny(lower, ["london", "manchester", "birmingham", "uk", "england"])) return "uk";
  if (containsAny(lower, ["new york", "nyc", "boston", "chicago", "miami", "los angeles", "usa", "us"])) return "us";
  if (containsAny(lower, ["dubai", "abu dhabi", "doha", "riyadh", "jeddah"])) return "gulf";
  return "europe";
}

function seasonFromMonth(month: string | null): keyof DestinationSeed["weather"] {
  const lower = (month ?? "").toLowerCase();
  if (["december", "january", "february"].includes(lower)) return "winter";
  if (["march", "april", "may"].includes(lower)) return "spring";
  if (["june", "july", "august"].includes(lower)) return "summer";
  return "autumn";
}

function climateAffinity(pref: Climate | undefined, destinationClimate: Climate): number {
  if (!pref || pref === "any") return 0.72;
  if (pref === destinationClimate) return 1;
  const pairs: Record<Climate, Climate[]> = {
    warm: ["temperate", "tropical"],
    cool: ["temperate", "cold"],
    tropical: ["warm"],
    temperate: ["warm", "cool"],
    cold: ["cool", "temperate"],
    any: ["warm", "cool", "tropical", "temperate", "cold"],
  };
  return pairs[pref].includes(destinationClimate) ? 0.72 : 0.28;
}

function vibeAffinity(pref: TravelPreferences, destination: DestinationSeed): number {
  if (pref.vibes.length === 0) return 0.68;
  const overlap = pref.vibes.filter((v) => destination.vibes.includes(v)).length;
  return Math.min(1, 0.36 + overlap * 0.24);
}

function budgetScore(pref: TravelPreferences, estimatedTotal: number): number {
  if (!pref.budgetMax) return 0.72;
  const ratio = estimatedTotal / pref.budgetMax;
  if (ratio <= 0.8) return 1;
  if (ratio <= 1) return 0.88;
  if (ratio <= 1.15) return 0.6;
  if (ratio <= 1.3) return 0.35;
  return 0.12;
}

function easeScore(destination: DestinationSeed, departure: string | null): number {
  const region = departureRegion(departure);
  const flight = region === "uk" ? destination.flightFromUK : region === "us" ? destination.flightFromUS : region === "gulf" ? destination.flightFromGulf : destination.flightFromEurope;
  if (flight <= 180) return 1;
  if (flight <= 300) return 0.85;
  if (flight <= 500) return 0.68;
  if (flight <= 750) return 0.45;
  return 0.28;
}

function valueScore(destination: DestinationSeed, pref: TravelPreferences, estimatedTotal: number): number {
  const tier = pref.luxury ?? "midrange";
  const hotelTarget = destination.hotelNightly[tier];
  const qualityBoost = tier === "luxury" ? 0.92 : tier === "premium" ? 0.88 : 0.8;
  const costNorm = estimatedTotal < 900 ? 1 : estimatedTotal < 1400 ? 0.84 : estimatedTotal < 2200 ? 0.62 : 0.38;
  const hotelNorm = hotelTarget < 120 ? 1 : hotelTarget < 220 ? 0.9 : hotelTarget < 350 ? 0.72 : 0.58;
  return Math.max(0.12, Math.min(1, qualityBoost * 0.45 + costNorm * 0.35 + hotelNorm * 0.2));
}

function weatherFor(destination: DestinationSeed, month: string | null) {
  const season = seasonFromMonth(month);
  return destination.weather[season];
}

function estimateFlight(destination: DestinationSeed, pref: TravelPreferences): number {
  const region = departureRegion(pref.departure);
  const base = region === "uk" ? destination.flightFromUK : region === "us" ? destination.flightFromUS : region === "gulf" ? destination.flightFromGulf : destination.flightFromEurope;
  const durationBoost = pref.durationDays && pref.durationDays > 10 ? 1.05 : 1;
  return Math.round(base * durationBoost);
}

function estimateHotelNightly(destination: DestinationSeed, pref: TravelPreferences): number {
  const tier = pref.luxury ?? "midrange";
  return destination.hotelNightly[tier];
}

function toReasonList(pref: TravelPreferences, destination: DestinationSeed, estimatedTotal: number, weather: ReturnType<typeof weatherFor>): string[] {
  const reasons: string[] = [];
  if (pref.vibes.length === 0) {
    reasons.push(`${destination.name} is a strong all-rounder with ${destination.tagline.toLowerCase()}`);
  } else {
    const matchingVibes = pref.vibes.filter((v) => destination.vibes.includes(v));
    if (matchingVibes.length) {
      reasons.push(`Matches your ${matchingVibes.slice(0, 3).join(" + ")} vibe very well.`);
    }
  }

  if (pref.budgetMax) {
    if (estimatedTotal <= pref.budgetMax) {
      reasons.push(`Fits your budget ceiling of ${formatEuro(pref.budgetMax)} with an estimated trip total of ${formatEuro(estimatedTotal)}.`);
    } else {
      reasons.push(`Sits a little above your budget at about ${formatEuro(estimatedTotal)}, but the price-performance is still strong.`);
    }
  } else {
    reasons.push(`Strong value-for-money once flight and hotel are combined.`);
  }

  reasons.push(`${weather.summary} for ${pref.month ?? "your chosen period"}.`);
  return reasons.slice(0, 4);
}

function monthNice(month: string | null): string {
  if (!month) return "your travel window";
  return month.charAt(0).toUpperCase() + month.slice(1);
}

function buildRecommendation(pref: TravelPreferences, destination: DestinationSeed): TravelRecommendation {
  const weather = weatherFor(destination, pref.month);
  const flight = estimateFlight(destination, pref);
  const hotelNightly = estimateHotelNightly(destination, pref);
  const duration = pref.durationDays ?? 7;
  const activitiesCost = pref.party === "family" ? 220 : pref.party === "couple" ? 180 : pref.party === "friends" ? 260 : 160;
  const estimatedTotal = Math.round(flight + hotelNightly * duration + activitiesCost + 110);

  const climate = climateAffinity(pref.climate, destination.climate);
  const vibe = vibeAffinity(pref, destination);
  const budget = budgetScore(pref, estimatedTotal);
  const ease = easeScore(destination, pref.departure);
  const value = valueScore(destination, pref, estimatedTotal);

  const matchScore = Math.round((climate * 0.3 + vibe * 0.28 + budget * 0.2 + ease * 0.12 + value * 0.1) * 100);
  const valueScoreOut = Math.round((value * 0.6 + budget * 0.4) * 100);

  const reasons = toReasonList(pref, destination, estimatedTotal, weather);
  const season = monthNice(pref.month);
  return {
    id: destination.id,
    name: destination.name,
    country: destination.country,
    iata: destination.iata,
    image: destination.image,
    tagline: destination.tagline,
    matchScore,
    valueScore: valueScoreOut,
    estimatedTotalEur: estimatedTotal,
    flightEur: flight,
    hotelNightlyEur: hotelNightly,
    weather: {
      period: season,
      highC: weather.high,
      lowC: weather.low,
      rain: weather.rain,
      summary:
        weather.rain === "low"
          ? "Mostly dry and sunny"
          : weather.rain === "medium"
            ? "Balanced with a few showers"
            : "Expect a wetter pattern",
    },
    scoreBreakdown: {
      climate: Math.round(climate * 100),
      vibe: Math.round(vibe * 100),
      budget: Math.round(budget * 100),
      ease: Math.round(ease * 100),
      value: valueScoreOut,
    },
    reasons,
    activities: destination.activities,
    tips: destination.tips,
  };
}

export function recommendDestinations(rawInput: string): TravelBundle {
  const parsed = parseTravelPrompt(rawInput);
  const recommendations = DESTINATIONS.map((destination) => buildRecommendation(parsed, destination))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return { parsed, recommendations };
}

export function findDestinationById(id: string) {
  return DESTINATIONS.find((d) => d.id === id) ?? null;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function monthLabel(month: string | null | undefined) {
  if (!month) return "flexible";
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function destinationKey(name: string, country: string) {
  return `${name}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function promptPreview(pref: TravelPreferences) {
  const parts = [
    pref.budgetMax ? `bis ${formatEuro(pref.budgetMax)}` : null,
    pref.durationDays ? `${pref.durationDays} Tage` : null,
    pref.month ? monthLabel(pref.month) : null,
    pref.departure ? `ab ${pref.departure}` : null,
    pref.climate && pref.climate !== "any" ? pref.climate : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

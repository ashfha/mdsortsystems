export type Climate = "warm" | "cool" | "tropical" | "temperate" | "cold" | "any";
export type LuxuryLevel = "budget" | "midrange" | "premium" | "luxury";
export type TripVibe = "beach" | "city" | "nature" | "food" | "nightlife" | "family" | "relax" | "culture" | "adventure";
export type PartyType = "solo" | "couple" | "family" | "friends" | "any";
export type Region = "Europe" | "Middle East" | "Africa" | "Asia" | "Americas" | "Oceania";

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
  notes: string[];
};

export type TravelRecommendation = {
  id: string;
  name: string;
  country: string;
  region: Region;
  iata: string;
  lat: number;
  lng: number;
  image: string;
  tagline: string;
  matchScore: number;
  valueScore: number;
  estimatedTotalEur: number;
  flightEur: number;
  hotelNightlyEur: number;
  weather: { period: string; highC: number; lowC: number; rain: "low" | "medium" | "high"; summary: string };
  scoreBreakdown: { climate: number; vibe: number; budget: number; ease: number; value: number };
  reasons: string[];
  activities: string[];
  tips: string[];
};

export type TravelBundle = { parsed: TravelPreferences; recommendations: TravelRecommendation[] };

type DestinationSeed = {
  id: string;
  name: string;
  country: string;
  region: Region;
  iata: string;
  lat: number;
  lng: number;
  image: string;
  tagline: string;
  climate: Climate;
  vibes: TripVibe[];
  bestMonths: string[];
  hotelNightly: Record<LuxuryLevel, number>;
  activities: string[];
  tips: string[];
};

const DESTINATIONS: DestinationSeed[] = [
  { id: "mallorca", name: "Mallorca", country: "Spain", region: "Europe", iata: "PMI", lat: 39.55, lng: 2.73, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80", tagline: "Easy beach escape with polished hotels and coves.", climate: "warm", vibes: ["beach", "food", "relax", "family", "culture"], bestMonths: ["april", "may", "june", "september", "october"], hotelNightly: { budget: 120, midrange: 190, premium: 320, luxury: 560 }, activities: ["Cala d'Or", "Palma old town", "Coastal drives", "Boat days"], tips: ["Best with a rental car.", "Strong shoulder-season value." ] },
  { id: "antalya", name: "Antalya", country: "Turkey", region: "Middle East", iata: "AYT", lat: 36.90, lng: 30.79, image: "https://images.unsplash.com/photo-1569830503708-99e6f5c50a0b?auto=format&fit=crop&w=1400&q=80", tagline: "Big resort value with beaches and all-inclusives.", climate: "warm", vibes: ["beach", "family", "relax", "food", "nightlife"], bestMonths: ["april", "may", "june", "september", "october"], hotelNightly: { budget: 85, midrange: 140, premium: 230, luxury: 420 }, activities: ["Kaleiçi", "Waterfalls", "Beach clubs", "Spa resorts"], tips: ["Very good price-performance.", "Good for simple package trips." ] },
  { id: "madeira", name: "Madeira", country: "Portugal", region: "Europe", iata: "FNC", lat: 32.69, lng: -16.78, image: "https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=1400&q=80", tagline: "Green cliffs, hiking and mild weather.", climate: "temperate", vibes: ["nature", "relax", "adventure", "culture", "food"], bestMonths: ["march", "april", "may", "september", "october", "november"], hotelNightly: { budget: 110, midrange: 180, premium: 320, luxury: 540 }, activities: ["Levada hikes", "Viewpoints", "Whale watching", "Seafood"], tips: ["Great if you want active days.", "A car gives freedom." ] },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", iata: "LIS", lat: 38.77, lng: -9.13, image: "https://images.unsplash.com/photo-1515450684190-932f845a6bc8?auto=format&fit=crop&w=1400&q=80", tagline: "Stylish city break with food, views and nightlife.", climate: "temperate", vibes: ["city", "food", "culture", "nightlife", "relax"], bestMonths: ["march", "april", "may", "june", "september", "october"], hotelNightly: { budget: 100, midrange: 170, premium: 300, luxury: 500 }, activities: ["Trams", "Rooftops", "Markets", "Cascais"], tips: ["Best for a short city trip.", "Comfortable on foot, but hilly." ] },
  { id: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa", iata: "RAK", lat: 31.61, lng: -8.03, image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80", tagline: "Souks, riads and warm winter sunshine.", climate: "warm", vibes: ["culture", "food", "relax", "nightlife", "adventure"], bestMonths: ["march", "april", "may", "september", "october", "november"], hotelNightly: { budget: 70, midrange: 130, premium: 230, luxury: 420 }, activities: ["Medina", "Riads", "Desert day trips", "Rooftop dinners"], tips: ["Great winter sun escape.", "Stay central for atmosphere." ] },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", region: "Europe", iata: "KEF", lat: 63.99, lng: -22.60, image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1400&q=80", tagline: "Northern light city break with nature nearby.", climate: "cold", vibes: ["nature", "city", "relax", "adventure"], bestMonths: ["may", "june", "july", "august", "september"], hotelNightly: { budget: 140, midrange: 240, premium: 390, luxury: 650 }, activities: ["Blue Lagoon", "Golden Circle", "Whale watching", "Northern lights"], tips: ["Best if you like nature over beaches.", "Weather changes fast." ] },
  { id: "rome", name: "Rome", country: "Italy", region: "Europe", iata: "FCO", lat: 41.80, lng: 12.25, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=80", tagline: "Classic city with food, history and style.", climate: "temperate", vibes: ["city", "food", "culture", "relax"], bestMonths: ["march", "april", "may", "june", "september", "october"], hotelNightly: { budget: 110, midrange: 180, premium: 310, luxury: 520 }, activities: ["Historic center", "Trattorias", "Museums", "Day trips"], tips: ["Ideal for a long weekend.", "Book central to save time." ] },
  { id: "cancun", name: "Cancún", country: "Mexico", region: "Americas", iata: "CUN", lat: 21.04, lng: -86.87, image: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=80", tagline: "Caribbean beach, resorts and easy long-haul sunshine.", climate: "tropical", vibes: ["beach", "family", "relax", "nightlife"], bestMonths: ["january", "february", "march", "april", "november", "december"], hotelNightly: { budget: 140, midrange: 220, premium: 380, luxury: 650 }, activities: ["Beach clubs", "Cenotes", "All-inclusive resorts", "Island trips"], tips: ["Best for a simple beach week.", "Compare all-inclusive carefully." ] },
  { id: "new-york", name: "New York", country: "USA", region: "Americas", iata: "JFK", lat: 40.64, lng: -73.78, image: "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1400&q=80", tagline: "The classic city trip with everything at once.", climate: "temperate", vibes: ["city", "nightlife", "food", "culture"], bestMonths: ["april", "may", "september", "october"], hotelNightly: { budget: 180, midrange: 280, premium: 460, luxury: 850 }, activities: ["Broadway", "Museums", "Rooftops", "Neighborhoods"], tips: ["Book early for good rates.", "Great if you want nonstop energy." ] },
  { id: "capetown", name: "Cape Town", country: "South Africa", region: "Africa", iata: "CPT", lat: -33.97, lng: 18.60, image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=80", tagline: "Mountain, ocean and wine country in one trip.", climate: "temperate", vibes: ["nature", "city", "food", "adventure", "relax"], bestMonths: ["november", "december", "january", "february", "march"], hotelNightly: { budget: 90, midrange: 160, premium: 280, luxury: 520 }, activities: ["Table Mountain", "Wine farms", "Coast roads", "Beaches"], tips: ["Great if you want variety.", "Base in a safe, central area." ] },
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia", iata: "BKK", lat: 13.69, lng: 100.75, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80", tagline: "Food, skyline hotels and a big-city buzz.", climate: "tropical", vibes: ["city", "food", "nightlife", "culture"], bestMonths: ["november", "december", "january", "february", "march"], hotelNightly: { budget: 55, midrange: 110, premium: 220, luxury: 430 }, activities: ["Street food", "Temples", "Skybars", "Markets"], tips: ["Use the train to beat traffic.", "Good first stop for Asia." ] },
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia", iata: "HND", lat: 35.55, lng: 139.78, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80", tagline: "Ultra-polished city with food, design and order.", climate: "temperate", vibes: ["city", "food", "culture", "nightlife"], bestMonths: ["march", "april", "may", "october", "november"], hotelNightly: { budget: 85, midrange: 160, premium: 290, luxury: 540 }, activities: ["Neighborhoods", "Sushi", "Shopping", "Temples"], tips: ["Great for detail lovers.", "Long-haul, but very rewarding." ] },
  { id: "bali", name: "Bali", country: "Indonesia", region: "Asia", iata: "DPS", lat: -8.74, lng: 115.17, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80", tagline: "Surf, villas, wellness and rice terraces.", climate: "tropical", vibes: ["beach", "nature", "relax", "adventure", "culture", "food"], bestMonths: ["april", "may", "june", "july", "august", "september"], hotelNightly: { budget: 60, midrange: 130, premium: 250, luxury: 520 }, activities: ["Rice fields", "Beach clubs", "Villas", "Surf"], tips: ["Best if you stay longer.", "Great value for couples." ] },
  { id: "zanzibar", name: "Zanzibar", country: "Tanzania", region: "Africa", iata: "ZNZ", lat: -6.22, lng: 39.22, image: "https://images.unsplash.com/photo-1522093007474-d86e75c2b6ae?auto=format&fit=crop&w=1400&q=80", tagline: "Spice island with calm beaches and boutique resorts.", climate: "tropical", vibes: ["beach", "relax", "food", "nature"], bestMonths: ["june", "july", "august", "september", "october", "january", "february"], hotelNightly: { budget: 140, midrange: 220, premium: 390, luxury: 680 }, activities: ["Stone Town", "Spice tours", "Dhow cruises", "Snorkeling"], tips: ["Watch tides.", "Great for a slower pace." ] },
  { id: "mauritius", name: "Mauritius", country: "Mauritius", region: "Africa", iata: "MRU", lat: -20.43, lng: 57.68, image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80", tagline: "Polished island escape with beaches and lagoons.", climate: "tropical", vibes: ["beach", "relax", "family", "nature"], bestMonths: ["may", "june", "july", "august", "september", "october", "november"], hotelNightly: { budget: 150, midrange: 250, premium: 420, luxury: 760 }, activities: ["Lagoon beaches", "Catamaran trips", "Hiking", "Resorts"], tips: ["Good for a premium beach week.", "Worth it for longer stays." ] },
  { id: "sydney", name: "Sydney", country: "Australia", region: "Oceania", iata: "SYD", lat: -33.94, lng: 151.18, image: "https://images.unsplash.com/photo-1506973035872-a4f23e90f596?auto=format&fit=crop&w=1400&q=80", tagline: "Iconic harbor city with beaches and easy city life.", climate: "temperate", vibes: ["city", "beach", "food", "culture", "adventure"], bestMonths: ["september", "october", "november", "march", "april", "may"], hotelNightly: { budget: 140, midrange: 240, premium: 420, luxury: 780 }, activities: ["Harbor", "Bondi", "Dining", "Coastal walks"], tips: ["Great mix of city and beach.", "Long-haul, so stay longer." ] },
  { id: "buenos-aires", name: "Buenos Aires", country: "Argentina", region: "Americas", iata: "EZE", lat: -34.81, lng: -58.54, image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1400&q=80", tagline: "Big-city energy with food, neighborhoods and nightlife.", climate: "temperate", vibes: ["city", "food", "nightlife", "culture"], bestMonths: ["march", "april", "may", "september", "october", "november"], hotelNightly: { budget: 70, midrange: 140, premium: 240, luxury: 430 }, activities: ["Recoleta", "Steakhouses", "Tango", "Cafes"], tips: ["Great for culture and food.", "Very strong value if you like cities." ] },
  { id: "vancouver", name: "Vancouver", country: "Canada", region: "Americas", iata: "YVR", lat: 49.19, lng: -123.18, image: "https://images.unsplash.com/photo-1500043357865-c6b8827edf78?auto=format&fit=crop&w=1400&q=80", tagline: "Mountain-meets-ocean city with outdoor access.", climate: "cool", vibes: ["city", "nature", "food", "adventure"], bestMonths: ["may", "june", "july", "august", "september"], hotelNightly: { budget: 120, midrange: 210, premium: 360, luxury: 640 }, activities: ["Seawall", "Stanley Park", "Whistler", "Dining"], tips: ["Ideal if you want outdoors and city together.", "Great summer destination." ] },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", region: "Middle East", iata: "DXB", lat: 25.25, lng: 55.37, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80", tagline: "Luxury skyline hotels, shopping and winter sun.", climate: "warm", vibes: ["city", "nightlife", "food", "family", "relax"], bestMonths: ["november", "december", "january", "february", "march"], hotelNightly: { budget: 120, midrange: 220, premium: 430, luxury: 850 }, activities: ["Desert safari", "Beach clubs", "Malls", "Skyline"], tips: ["Best in winter.", "Very easy logistics." ] },
];

const AIRPORTS: Record<string, { lat: number; lng: number; label: string }> = {
  stuttgart: { lat: 48.69, lng: 9.22, label: "Stuttgart" },
  str: { lat: 48.69, lng: 9.22, label: "Stuttgart" },
  frankfurt: { lat: 50.05, lng: 8.57, label: "Frankfurt" },
  fra: { lat: 50.05, lng: 8.57, label: "Frankfurt" },
  munich: { lat: 48.35, lng: 11.79, label: "Munich" },
  muc: { lat: 48.35, lng: 11.79, label: "Munich" },
  berlin: { lat: 52.52, lng: 13.40, label: "Berlin" },
  ber: { lat: 52.52, lng: 13.40, label: "Berlin" },
  hamburg: { lat: 53.55, lng: 10.00, label: "Hamburg" },
  ham: { lat: 53.55, lng: 10.00, label: "Hamburg" },
  dusseldorf: { lat: 51.23, lng: 6.78, label: "Düsseldorf" },
  dus: { lat: 51.23, lng: 6.78, label: "Düsseldorf" },
  cologne: { lat: 50.94, lng: 6.96, label: "Cologne" },
  cgn: { lat: 50.94, lng: 6.96, label: "Cologne" },
  zurich: { lat: 47.45, lng: 8.56, label: "Zürich" },
  zrh: { lat: 47.45, lng: 8.56, label: "Zürich" },
  vienna: { lat: 48.21, lng: 16.37, label: "Vienna" },
  vie: { lat: 48.21, lng: 16.37, label: "Vienna" },
  london: { lat: 51.47, lng: -0.45, label: "London" },
  lhr: { lat: 51.47, lng: -0.45, label: "London" },
  paris: { lat: 49.01, lng: 2.55, label: "Paris" },
  amsterdam: { lat: 52.31, lng: 4.76, label: "Amsterdam" },
  madrid: { lat: 40.47, lng: -3.56, label: "Madrid" },
  rome: { lat: 41.80, lng: 12.25, label: "Rome" },
  newyork: { lat: 40.64, lng: -73.78, label: "New York" },
  nyc: { lat: 40.64, lng: -73.78, label: "New York" },
  losangeles: { lat: 33.94, lng: -118.40, label: "Los Angeles" },
  la: { lat: 33.94, lng: -118.40, label: "Los Angeles" },
  dubai: { lat: 25.25, lng: 55.37, label: "Dubai" },
  doha: { lat: 25.27, lng: 51.61, label: "Doha" },
  singapore: { lat: 1.36, lng: 103.99, label: "Singapore" },
};

const MONTH_ALIASES: Record<string, string> = {
  january: "january", february: "february", march: "march", april: "april", may: "may", june: "june", july: "july", august: "august", september: "september", october: "october", november: "november", december: "december",
  jan: "january", feb: "february", mar: "march", apr: "april", jun: "june", jul: "july", aug: "august", sept: "september", sep: "september", oct: "october", nov: "november", dec: "december",
};

const VIBE_KEYWORDS: Array<{ key: TripVibe; words: string[] }> = [
  { key: "beach", words: ["beach", "strand", "sea", "meer", "snorkel", "sun" ] },
  { key: "city", words: ["city", "stadt", "urban", "metropole", "walkable"] },
  { key: "nature", words: ["nature", "natur", "hike", "hiking", "mountain", "berg", "outdoor"] },
  { key: "food", words: ["food", "essen", "restaurant", "cuisine", "kulinar", "street food"] },
  { key: "nightlife", words: ["nightlife", "party", "club", "bars", "bar", "feiern"] },
  { key: "family", words: ["family", "familie", "kids", "children", "kind"] },
  { key: "relax", words: ["relax", "ruhe", "quiet", "calm", "chill", "entspann"] },
  { key: "culture", words: ["culture", "kultur", "historic", "museum", "altstadt"] },
  { key: "adventure", words: ["adventure", "abenteuer", "surf", "diving", "trek", "aktiv"] },
];

export function parseTravelPrompt(rawInput: string): TravelPreferences {
  const clean = rawInput.trim();
  const lower = clean.toLowerCase();
  const budgetMax = (() => {
    const direct = clean.match(/(\d[\d.,]*)\s?(?:€|eur|euro|\$|usd)/i);
    if (direct) return Number(direct[1].replace(/\./g, "").replace(",", "."));
    const around = lower.match(/(?:under|max|bis|unter)\s*(?:of\s*)?(\d[\d.,]*)/i);
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
    const group = clean.match(/(\d+)\s*(?:people|persons|travelers|travellers|personen|gäste)/i);
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
    notes: lower.split(/[\n.]/).map((part) => part.trim()).filter(Boolean).slice(0, 6),
  };
}

export function recommendDestinations(rawInput: string): TravelBundle {
  const parsed = parseTravelPrompt(rawInput);
  const recommendations = DESTINATIONS.map((dest) => buildRecommendation(parsed, dest))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);
  return { parsed, recommendations };
}

export function destinationKey(name: string, country: string) {
  return `${name}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function monthLabel(month: string | null | undefined) {
  if (!month) return "flexible";
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function promptPreview(pref: TravelPreferences) {
  return [pref.budgetMax ? `bis ${formatEuro(pref.budgetMax)}` : null, pref.durationDays ? `${pref.durationDays} Tage` : null, pref.month ? monthLabel(pref.month) : null, pref.departure ? `ab ${pref.departure}` : null].filter(Boolean).join(" · ");
}

export function worldDestinations() {
  return DESTINATIONS;
}

function buildRecommendation(pref: TravelPreferences, dest: DestinationSeed): TravelRecommendation {
  const weather = weatherFor(dest, pref.month);
  const flight = estimateFlight(pref, dest);
  const hotelNightly = estimateHotel(pref, dest);
  const days = pref.durationDays ?? 7;
  const activityBudget = pref.party === "family" ? 250 : pref.party === "friends" ? 260 : 180;
  const estimatedTotal = Math.round(flight + hotelNightly * days + activityBudget + 90);

  const climate = climateScore(pref.climate, dest.climate);
  const vibe = vibeScore(pref.vibes, dest.vibes);
  const budget = budgetScore(pref.budgetMax, estimatedTotal);
  const ease = easeScore(pref.departure, dest);
  const value = valueScore(hotelNightly, estimatedTotal, pref.luxury ?? "midrange");
  const matchScore = Math.round((climate * 0.28 + vibe * 0.30 + budget * 0.20 + ease * 0.12 + value * 0.10) * 100);

  return {
    id: dest.id,
    name: dest.name,
    country: dest.country,
    region: dest.region,
    iata: dest.iata,
    lat: dest.lat,
    lng: dest.lng,
    image: dest.image,
    tagline: dest.tagline,
    matchScore,
    valueScore: Math.round((value * 0.55 + budget * 0.45) * 100),
    estimatedTotalEur: estimatedTotal,
    flightEur: flight,
    hotelNightlyEur: hotelNightly,
    weather,
    scoreBreakdown: {
      climate: Math.round(climate * 100),
      vibe: Math.round(vibe * 100),
      budget: Math.round(budget * 100),
      ease: Math.round(ease * 100),
      value: Math.round(value * 100),
    },
    reasons: buildReasons(pref, dest, estimatedTotal, weather),
    activities: dest.activities,
    tips: dest.tips,
  };
}

function buildReasons(pref: TravelPreferences, dest: DestinationSeed, estimatedTotal: number, weather: TravelRecommendation["weather"]): string[] {
  const reasons: string[] = [];
  const overlap = pref.vibes.filter((v) => dest.vibes.includes(v));
  if (overlap.length) reasons.push(`Matches your ${overlap.slice(0, 3).join(" + ")} vibe.`);
  if (pref.budgetMax) {
    reasons.push(estimatedTotal <= pref.budgetMax ? `Fits inside ${formatEuro(pref.budgetMax)}.` : `Sits a bit above ${formatEuro(pref.budgetMax)}.`);
  } else {
    reasons.push(`Strong price-performance for the destination type.`);
  }
  reasons.push(`${weather.summary} around ${weather.highC}°C / ${weather.lowC}°C.`);
  if (dest.bestMonths.includes(pref.month ?? "")) reasons.push(`One of the best months for ${dest.name}.`);
  return reasons.slice(0, 4);
}

function detectMonth(text: string) {
  const lower = text.toLowerCase();
  const found = Object.entries(MONTH_ALIASES).find(([k]) => lower.includes(k));
  return found?.[1] ?? null;
}

function detectDeparture(text: string) {
  const direct = Object.entries(AIRPORTS).find(([key, airport]) => new RegExp(`\b${escapeRegExp(key)}\b`, "i").test(text) || new RegExp(`\b${escapeRegExp(airport.label.toLowerCase())}\b`, "i").test(text));
  if (direct) return direct[1].label;
  const fromMatch = text.match(/(?:from|ab)\s+([a-zäöüß\- ]{3,40})/i);
  return fromMatch ? fromMatch[1].trim().replace(/[.,]$/, "") : null;
}

function detectClimate(text: string): Climate {
  if (containsAny(text, ["tropical", "tropisch", "jungle"])) return "tropical";
  if (containsAny(text, ["cold", "kalt", "ski", "snow", "winter"])) return "cold";
  if (containsAny(text, ["cool", "fresh", "frisch", "kühl"])) return "cool";
  if (containsAny(text, ["temperate", "mild", "pleasant", "angenehm"])) return "temperate";
  if (containsAny(text, ["warm", "hot", "heiß", "sun", "beach", "strand"])) return "warm";
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
  return Array.from(new Set(VIBE_KEYWORDS.filter((entry) => containsAny(text, entry.words)).map((entry) => entry.key)));
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function easeScore(departure: string | null, dest: DestinationSeed) {
  const origin = airportFor(departure);
  const distance = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  if (distance < 1000) return 1;
  if (distance < 2500) return 0.85;
  if (distance < 6000) return 0.6;
  if (distance < 10000) return 0.4;
  return 0.25;
}

function estimateFlight(pref: TravelPreferences, dest: DestinationSeed) {
  const origin = airportFor(pref.departure);
  const distance = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  const stops = estimateStops(distance, dest, origin);
  const seasonalFactor = pref.month && dest.bestMonths.includes(pref.month) ? 1.08 : 0.98;
  const routeFactor = dest.region === "Oceania" ? 1.12 : dest.region === "Asia" ? 1.06 : dest.region === "Americas" ? 1.02 : 1;
  return Math.round((80 + distance * 0.08 + stops * 55) * seasonalFactor * routeFactor);
}

function estimateHotel(pref: TravelPreferences, dest: DestinationSeed) {
  const tier = pref.luxury ?? "midrange";
  const base = dest.hotelNightly[tier];
  const durationFactor = pref.durationDays && pref.durationDays > 10 ? 0.97 : 1;
  return Math.round(base * durationFactor);
}

function budgetScore(budgetMax: number | null | undefined, estimatedTotal: number) {
  if (!budgetMax) return 0.73;
  const ratio = estimatedTotal / budgetMax;
  if (ratio <= 0.85) return 1;
  if (ratio <= 1) return 0.88;
  if (ratio <= 1.15) return 0.62;
  if (ratio <= 1.3) return 0.38;
  return 0.15;
}

function climateScore(prefClimate: Climate | undefined, destClimate: Climate) {
  if (!prefClimate || prefClimate === "any") return 0.72;
  if (prefClimate === destClimate) return 1;
  const affinities: Record<Climate, Climate[]> = {
    warm: ["temperate", "tropical"],
    cool: ["temperate", "cold"],
    tropical: ["warm"],
    temperate: ["warm", "cool"],
    cold: ["cool", "temperate"],
    any: ["warm", "cool", "tropical", "temperate", "cold"],
  };
  return affinities[prefClimate].includes(destClimate) ? 0.72 : 0.28;
}

function vibeScore(preferred: TripVibe[], destination: TripVibe[]) {
  if (!preferred.length) return 0.68;
  const overlap = preferred.filter((v) => destination.includes(v)).length;
  return Math.min(1, 0.34 + overlap * 0.24);
}

function valueScore(hotelNightly: number, estimatedTotal: number, luxury: LuxuryLevel) {
  const luxuryBoost = luxury === "luxury" ? 0.92 : luxury === "premium" ? 0.86 : 0.78;
  const costBoost = estimatedTotal < 900 ? 1 : estimatedTotal < 1500 ? 0.86 : estimatedTotal < 2400 ? 0.64 : 0.42;
  const hotelBoost = hotelNightly < 120 ? 1 : hotelNightly < 220 ? 0.9 : hotelNightly < 350 ? 0.74 : 0.58;
  return Math.max(0.12, Math.min(1, luxuryBoost * 0.42 + costBoost * 0.36 + hotelBoost * 0.22));
}

function airportFor(departure: string | null | undefined) {
  if (!departure) return AIRPORTS.fra;
  const key = departure.toLowerCase().replace(/[öüäß]/g, (m) => ({ ö: "oe", ü: "ue", ä: "ae", ß: "ss" }[m] ?? m)).replace(/[^a-z0-9]+/g, "").trim();
  return AIRPORTS[key] ?? AIRPORTS.fra;
}

function estimateStops(distanceKm: number, dest: DestinationSeed, origin: { lat: number; lng: number; label: string }) {
  if (distanceKm < 1200) return 0;
  if (distanceKm < 3500) return 1;
  if (distanceKm < 8000) return 1;
  if (distanceKm < 12000) return 1;
  return 2;
}

function weatherFor(dest: DestinationSeed, month: string | null) {
  const season = seasonFromMonth(month);
  const profile = WEATHER_BY_CLIMATE[dest.climate][season];
  const latAdjust = dest.lat > 45 ? -3 : dest.lat < -10 ? 2 : 0;
  return {
    period: month ? monthLabel(month) : "flexible",
    highC: profile.high + latAdjust,
    lowC: profile.low + latAdjust,
    rain: profile.rain,
    summary: profile.summary,
  };
}

function seasonFromMonth(month: string | null) {
  const m = (month ?? "").toLowerCase();
  if (["december", "january", "february"].includes(m)) return "winter" as const;
  if (["march", "april", "may"].includes(m)) return "spring" as const;
  if (["june", "july", "august"].includes(m)) return "summer" as const;
  return "autumn" as const;
}

const WEATHER_BY_CLIMATE = {
  warm: {
    spring: { high: 24, low: 15, rain: "low" as const, summary: "Mostly sunny and pleasant" },
    summer: { high: 31, low: 22, rain: "low" as const, summary: "Hot and sunny" },
    autumn: { high: 27, low: 18, rain: "low" as const, summary: "Still warm and stable" },
    winter: { high: 17, low: 10, rain: "medium" as const, summary: "Mild with a few showers" },
  },
  temperate: {
    spring: { high: 20, low: 11, rain: "medium" as const, summary: "Comfortable with some clouds" },
    summer: { high: 26, low: 16, rain: "low" as const, summary: "Warm and easygoing" },
    autumn: { high: 21, low: 13, rain: "medium" as const, summary: "Balanced and walkable" },
    winter: { high: 12, low: 6, rain: "medium" as const, summary: "Cool and changeable" },
  },
  tropical: {
    spring: { high: 32, low: 26, rain: "high" as const, summary: "Hot with rain chances" },
    summer: { high: 30, low: 24, rain: "medium" as const, summary: "Warm with brief showers" },
    autumn: { high: 31, low: 25, rain: "medium" as const, summary: "Tropical and humid" },
    winter: { high: 32, low: 26, rain: "high" as const, summary: "Warm but more humid" },
  },
  cool: {
    spring: { high: 15, low: 6, rain: "medium" as const, summary: "Fresh and bright" },
    summer: { high: 21, low: 12, rain: "low" as const, summary: "Cool and pleasant" },
    autumn: { high: 14, low: 5, rain: "medium" as const, summary: "Crisp and scenic" },
    winter: { high: 7, low: 0, rain: "medium" as const, summary: "Cold but manageable" },
  },
  cold: {
    spring: { high: 10, low: 2, rain: "medium" as const, summary: "Cold but improving" },
    summer: { high: 18, low: 9, rain: "low" as const, summary: "Fresh summer weather" },
    autumn: { high: 11, low: 3, rain: "medium" as const, summary: "Cool and windy" },
    winter: { high: 2, low: -4, rain: "high" as const, summary: "Cold with strong winter feel" },
  },
  any: {
    spring: { high: 20, low: 12, rain: "medium" as const, summary: "Moderate and pleasant" },
    summer: { high: 27, low: 18, rain: "low" as const, summary: "Comfortable and bright" },
    autumn: { high: 21, low: 13, rain: "medium" as const, summary: "Generally balanced" },
    winter: { high: 13, low: 7, rain: "medium" as const, summary: "Mild to cool" },
  },
} as const;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function timeSeasonFactor(month: string | null, bestMonths: string[]) {
  if (!month) return 1;
  return bestMonths.includes(month) ? 1.08 : 0.98;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

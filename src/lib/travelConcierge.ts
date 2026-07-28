export type TravelDestination = {
  name: string;
  country: string;
  region: string;
  score: number;
  price: number;
  flight: number;
  hotel: number;
  image: string;
  summary: string;
  tags: string[];
};

export type TravelProfile = {
  brief: string;
  budget: number;
  people: number;
  days: number;
  departureDate: string;
  selectedType: string;
  controls: string[];
  climate: "warm" | "cool" | "mixed";
  vibe: "quiet" | "balanced" | "lively";
  priorities: string[];
  maxFlightHours: number | null;
  wantsBeach: boolean;
  wantsFood: boolean;
  wantsLuxury: boolean;
};

export type RankedDestination = TravelDestination & {
  fitScore: number;
  reasons: string[];
  totalPrice: number;
};

export type LiveHook = {
  label: string;
  endpoint: string;
  method: "POST" | "GET";
  body: Record<string, unknown>;
  note: string;
};

export type AccountPreview = {
  savedTrips: number;
  favorites: number;
  searchHistory: number;
  nextTripName: string;
  budgetLabel: string;
  sharedTrips: number;
};

const BEACH_WORDS = ["beach", "strand", "sea", "ocean", "sun", "sunny", "warm", "pool"];
const FOOD_WORDS = ["food", "essen", "restaurant", "taste", "kulinar", "cuisine"];
const LUXURY_WORDS = ["luxury", "premium", "high-end", "5 star", "5 stern", "polished", "upscale"];
const QUIET_WORDS = ["quiet", "calm", "no party", "not party", "relax", "ruhig", "entspannt"];
const LIVELY_WORDS = ["party", "nightlife", "club", "lively", "vibe", "bar", "loud"];
const COLD_WORDS = ["ski", "winter", "cold", "snow", "mountain"];
const WARM_WORDS = ["warm", "sun", "beach", "summer", "hot"];

export function parseTravelBrief(input: {
  brief: string;
  budget: number;
  people: number;
  days: number;
  departureDate: string;
  selectedType: string;
  controls: string[];
}): TravelProfile {
  const text = input.brief.toLowerCase();
  const climate = includesAny(text, WARM_WORDS) ? "warm" : includesAny(text, COLD_WORDS) ? "cool" : "mixed";
  const vibe = includesAny(text, QUIET_WORDS)
    ? "quiet"
    : includesAny(text, LIVELY_WORDS)
      ? "lively"
      : "balanced";
  const priorities = [
    includesAny(text, BEACH_WORDS) ? "Beach" : null,
    includesAny(text, FOOD_WORDS) ? "Food" : null,
    includesAny(text, LUXURY_WORDS) ? "Luxury" : null,
    /budget|price|deal|value/.test(text) ? "Value" : null,
    /culture|museum|city|old town/.test(text) ? "Culture" : null,
    /adventure|nature|active|hike/.test(text) ? "Adventure" : null,
  ].filter(Boolean) as string[];
  const maxFlightHours = extractNumber(text, /flight(?: under| max(?:imum)?)?\s*(\d+(?:\.\d+)?)/) ?? extractNumber(text, /(\d+(?:\.\d+)?)\s*h(?:ours?)?/);
  return {
    brief: input.brief,
    budget: input.budget,
    people: input.people,
    days: input.days,
    departureDate: input.departureDate,
    selectedType: input.selectedType,
    controls: input.controls,
    climate,
    vibe,
    priorities,
    maxFlightHours,
    wantsBeach: includesAny(text, BEACH_WORDS),
    wantsFood: includesAny(text, FOOD_WORDS),
    wantsLuxury: includesAny(text, LUXURY_WORDS) || input.selectedType.toLowerCase().includes("luxury"),
  };
}

export function rankDestinations(destinations: TravelDestination[], profile: TravelProfile): RankedDestination[] {
  return destinations
    .map((destination) => {
      let fitScore = destination.score;
      const reasons: string[] = [];

      if (profile.climate === "warm" && /Mallorca|Dubai|Bangkok/i.test(destination.name)) {
        fitScore += 4;
        reasons.push("Matches your warm-weather preference.");
      }
      if (profile.vibe === "quiet" && /Mallorca|Cape Town/i.test(destination.name)) {
        fitScore += 3;
        reasons.push("Works well for a calmer trip.");
      }
      if (profile.vibe === "lively" && /Bangkok|Dubai/i.test(destination.name)) {
        fitScore += 3;
        reasons.push("Good fit for a livelier trip.");
      }
      if (profile.wantsBeach && /Beach|ocean|sun/i.test([destination.summary, ...destination.tags].join(" "))) {
        fitScore += 6;
        reasons.push("Has the beach / sun vibe you asked for.");
      }
      if (profile.wantsFood && /Food|culture/i.test([destination.summary, ...destination.tags].join(" "))) {
        fitScore += 5;
        reasons.push("Strong food or city culture potential.");
      }
      if (profile.wantsLuxury && /Dubai|premium|service/i.test([destination.name, destination.summary, ...destination.tags].join(" "))) {
        fitScore += 6;
        reasons.push("Feels premium enough for your style.");
      }
      if (profile.budget < destination.price) {
        fitScore -= 4;
        reasons.push("Needs a bit more budget or a smart flight deal.");
      } else {
        reasons.push("Fits inside your rough budget band.");
      }
      if (profile.maxFlightHours !== null) {
        const estimatedHours = destination.flight > 600 ? 10.5 : destination.flight > 350 ? 7.2 : 2.8;
        if (estimatedHours <= profile.maxFlightHours) {
          fitScore += 5;
          reasons.push(`Estimated flight time stays under ${profile.maxFlightHours} hours.`);
        } else {
          fitScore -= 5;
          reasons.push(`Estimated flight time may be longer than ${profile.maxFlightHours} hours.`);
        }
      }

      return {
        ...destination,
        fitScore: Math.max(1, Math.min(100, fitScore)),
        reasons,
        totalPrice: destination.flight + destination.hotel + Math.round(profile.budget * 0.12),
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function buildLiveHooks(destination: RankedDestination | undefined, profile: TravelProfile): LiveHook[] {
  if (!destination) return [];
  return [
    {
      label: "Flight search",
      endpoint: "/functions/travel-flight-search",
      method: "POST",
      body: {
        departureIata: "STR",
        destinationIata: destination.name.slice(0, 3).toUpperCase(),
        departureDate: profile.departureDate,
        returnDate: addDays(profile.departureDate, profile.days),
        travelers: profile.people,
        budgetMax: profile.budget,
      },
      note: "Pulls live flight options and sorts by price, duration and stops.",
    },
    {
      label: "Hotel search",
      endpoint: "/functions/travel-hotel-search",
      method: "POST",
      body: {
        destinationIata: destination.name.slice(0, 3).toUpperCase(),
        destinationName: destination.name,
        checkInDate: profile.departureDate,
        checkOutDate: addDays(profile.departureDate, profile.days),
        adults: profile.people,
        luxuryLevel: profile.wantsLuxury ? "luxury" : profile.budget < 1500 ? "budget" : "midrange",
      },
      note: "Pulls hotels by city and sorts by price and fit.",
    },
    {
      label: "Travel profile",
      endpoint: "/functions/travel-profile",
      method: "POST",
      body: {
        brief: profile.brief,
        climate: profile.climate,
        vibe: profile.vibe,
        priorities: profile.priorities,
      },
      note: "Turns plain language into structured trip requirements.",
    },
  ];
}

export function buildAccountPreview(profile: TravelProfile, destinationCount = 1): AccountPreview {
  return {
    savedTrips: Math.max(1, Math.floor(profile.people / 1.5)),
    favorites: Math.max(2, destinationCount),
    searchHistory: 12,
    nextTripName: profile.priorities[0] ? `${profile.priorities[0]} escape` : `${profile.selectedType} escape`,
    budgetLabel: formatCurrency(profile.budget),
    sharedTrips: Math.max(1, profile.people - 1),
  };
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((word) => text.includes(word));
}

function extractNumber(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function addDays(date: string, days: number) {
  const start = new Date(date);
  start.setDate(start.getDate() + days);
  return start.toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

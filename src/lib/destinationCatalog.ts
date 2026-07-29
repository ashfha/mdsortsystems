export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  themes: string[];
  flightHours: number;
  baseFlight: number;
  baseHotelNight: number;
  calm: number;
  luxury: number;
  image: string;
};

const raw = [
  ["Mallorca","Spanien","Europa"],["Ibiza","Spanien","Europa"],["Menorca","Spanien","Europa"],["Teneriffa","Spanien","Europa"],["Gran Canaria","Spanien","Europa"],["Lanzarote","Spanien","Europa"],["Fuerteventura","Spanien","Europa"],["Barcelona","Spanien","Europa"],["Madrid","Spanien","Europa"],["Lissabon","Portugal","Europa"],["Porto","Portugal","Europa"],["Madeira","Portugal","Europa"],["Algarve","Portugal","Europa"],["Paris","Frankreich","Europa"],["Nizza","Frankreich","Europa"],["Korsika","Frankreich","Europa"],["Rom","Italien","Europa"],["Mailand","Italien","Europa"],["Florenz","Italien","Europa"],["Venedig","Italien","Europa"],["Sardinien","Italien","Europa"],["Sizilien","Italien","Europa"],["Amalfiküste","Italien","Europa"],["Athen","Griechenland","Europa"],["Kreta","Griechenland","Europa"],["Rhodos","Griechenland","Europa"],["Kos","Griechenland","Europa"],["Santorini","Griechenland","Europa"],["Mykonos","Griechenland","Europa"],["Korfu","Griechenland","Europa"],["Dubrovnik","Kroatien","Europa"],["Split","Kroatien","Europa"],["Hvar","Kroatien","Europa"],["Istrien","Kroatien","Europa"],["Malta","Malta","Europa"],["Zypern","Zypern","Europa"],["Reykjavik","Island","Europa"],["Oslo","Norwegen","Europa"],["Bergen","Norwegen","Europa"],["Stockholm","Schweden","Europa"],["Kopenhagen","Dänemark","Europa"],["Amsterdam","Niederlande","Europa"],["Prag","Tschechien","Europa"],["Budapest","Ungarn","Europa"],["Wien","Österreich","Europa"],["Zürich","Schweiz","Europa"],["Istanbul","Türkei","Europa/Asien"],["Antalya","Türkei","Europa/Asien"],["Bodrum","Türkei","Europa/Asien"],["Marrakesch","Marokko","Afrika"],["Agadir","Marokko","Afrika"],["Hurghada","Ägypten","Afrika"],["Marsa Alam","Ägypten","Afrika"],["Sharm el-Sheikh","Ägypten","Afrika"],["Kapstadt","Südafrika","Afrika"],["Sansibar","Tansania","Afrika"],["Seychellen","Seychellen","Afrika"],["Mauritius","Mauritius","Afrika"],["Dubai","VAE","Naher Osten"],["Abu Dhabi","VAE","Naher Osten"],["Doha","Katar","Naher Osten"],["Muscat","Oman","Naher Osten"],["Amman","Jordanien","Naher Osten"],["Tel Aviv","Israel","Naher Osten"],["Bangkok","Thailand","Asien"],["Phuket","Thailand","Asien"],["Koh Samui","Thailand","Asien"],["Krabi","Thailand","Asien"],["Chiang Mai","Thailand","Asien"],["Bali","Indonesien","Asien"],["Lombok","Indonesien","Asien"],["Singapur","Singapur","Asien"],["Kuala Lumpur","Malaysia","Asien"],["Langkawi","Malaysia","Asien"],["Hanoi","Vietnam","Asien"],["Ho-Chi-Minh-Stadt","Vietnam","Asien"],["Da Nang","Vietnam","Asien"],["Hoi An","Vietnam","Asien"],["Tokio","Japan","Asien"],["Kyoto","Japan","Asien"],["Seoul","Südkorea","Asien"],["Hongkong","Hongkong","Asien"],["Malé","Malediven","Asien"],["Goa","Indien","Asien"],["Sri Lanka","Sri Lanka","Asien"],["New York","USA","Nordamerika"],["Miami","USA","Nordamerika"],["Los Angeles","USA","Nordamerika"],["San Francisco","USA","Nordamerika"],["Las Vegas","USA","Nordamerika"],["Hawaii","USA","Nordamerika"],["Cancún","Mexiko","Nordamerika"],["Tulum","Mexiko","Nordamerika"],["Vancouver","Kanada","Nordamerika"],["Toronto","Kanada","Nordamerika"],["Costa Rica","Costa Rica","Mittelamerika"],["Punta Cana","Dominikanische Republik","Karibik"],["Jamaika","Jamaika","Karibik"],["Barbados","Barbados","Karibik"],["Curaçao","Curaçao","Karibik"],["Rio de Janeiro","Brasilien","Südamerika"],["Buenos Aires","Argentinien","Südamerika"],["Lima","Peru","Südamerika"],["Cartagena","Kolumbien","Südamerika"],["Sydney","Australien","Ozeanien"],["Melbourne","Australien","Ozeanien"],["Gold Coast","Australien","Ozeanien"],["Auckland","Neuseeland","Ozeanien"],["Queenstown","Neuseeland","Ozeanien"],["Fidschi","Fidschi","Ozeanien"]
] as const;

const themeSets = [
  ["Strand","Entspannung","Sonne"],
  ["Kultur","Essen","Stadt"],
  ["Natur","Abenteuer","Ruhe"],
  ["Luxus","Wellness","Service"],
  ["Nightlife","Strand","Events"],
  ["Familie","Strand","Komfort"]
];

const images = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57"
];

export const destinations: Destination[] = raw.map(([name, country, region], index) => {
  const far = ["Asien","Ozeanien","Südamerika","Nordamerika"].includes(region);
  const medium = ["Afrika","Naher Osten","Karibik","Mittelamerika"].includes(region);
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/gi,"-"),
    name,
    country,
    region,
    themes: themeSets[index % themeSets.length],
    flightHours: far ? 9 + (index % 6) : medium ? 4 + (index % 5) : 1.5 + (index % 4),
    baseFlight: far ? 520 + (index % 8) * 55 : medium ? 250 + (index % 7) * 42 : 90 + (index % 8) * 28,
    baseHotelNight: 58 + (index % 10) * 24,
    calm: 55 + (index * 7) % 45,
    luxury: 50 + (index * 11) % 50,
    image: `${images[index % images.length]}?auto=format&fit=crop&w=1400&q=82`
  };
});

export type SearchProfile = {
  text: string;
  budget: number;
  people: number;
  days: number;
  maxFlight: number;
  interests: string[];
  hotelLevel: "Smart" | "Comfort" | "Premium";
};

export function rankDestinations(profile: SearchProfile) {
  const words = `${profile.text} ${profile.interests.join(" ")}`.toLowerCase();
  const hotelMultiplier = profile.hotelLevel === "Premium" ? 1.75 : profile.hotelLevel === "Comfort" ? 1.25 : 0.9;
  return destinations.map((destination) => {
    const flight = Math.round(destination.baseFlight * profile.people);
    const hotel = Math.round(destination.baseHotelNight * profile.days * hotelMultiplier);
    const total = flight + hotel;
    let score = 72;
    destination.themes.forEach((theme) => { if (words.includes(theme.toLowerCase())) score += 7; });
    if (words.includes("ruhe") || words.includes("entspann")) score += Math.round(destination.calm / 12);
    if (words.includes("luxus") || profile.hotelLevel === "Premium") score += Math.round(destination.luxury / 15);
    if (destination.flightHours <= profile.maxFlight) score += 12; else score -= Math.round((destination.flightHours - profile.maxFlight) * 4);
    if (total <= profile.budget) score += 14; else score -= Math.round(((total - profile.budget) / Math.max(profile.budget, 1)) * 30);
    score = Math.max(32, Math.min(99, score));
    const reasons = [
      destination.flightHours <= profile.maxFlight ? `Flugzeit passt mit ca. ${destination.flightHours.toFixed(1)} Std.` : "Etwas längere Anreise",
      total <= profile.budget ? "liegt im geplanten Budget" : "liegt über dem Zielbudget",
      `stark bei ${destination.themes.slice(0,2).join(" und ")}`
    ];
    return { ...destination, score, flight, hotel, total, reasons };
  }).sort((a,b) => b.score - a.score || a.total - b.total);
}

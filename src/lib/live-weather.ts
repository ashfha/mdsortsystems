export type LiveWeather = {
  source: "live" | "fallback";
  period: string;
  highC: number;
  lowC: number;
  rain: "low" | "medium" | "high";
  summary: string;
  placeName?: string;
};

type WeatherInput = {
  destinationName: string;
  country?: string;
  fallback: LiveWeather;
};

export async function fetchLiveWeather({ destinationName, country, fallback }: WeatherInput): Promise<LiveWeather> {
  try {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.searchParams.set("name", destinationName);
    geocodeUrl.searchParams.set("count", "1");
    geocodeUrl.searchParams.set("language", "en");
    if (country) geocodeUrl.searchParams.set("country", country);

    const geocodeResponse = await fetch(geocodeUrl.toString());
    if (!geocodeResponse.ok) return fallback;
    const geocodeJson = await geocodeResponse.json();
    const match = geocodeJson?.results?.[0];
    if (!match?.latitude || !match?.longitude) return fallback;

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(match.latitude));
    forecastUrl.searchParams.set("longitude", String(match.longitude));
    forecastUrl.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    forecastUrl.searchParams.set("forecast_days", "7");
    forecastUrl.searchParams.set("timezone", "auto");

    const forecastResponse = await fetch(forecastUrl.toString());
    if (!forecastResponse.ok) return fallback;
    const forecastJson = await forecastResponse.json();
    const daily = forecastJson?.daily;
    const max = Number(daily?.temperature_2m_max?.[0]);
    const min = Number(daily?.temperature_2m_min?.[0]);
    const precip = Number(daily?.precipitation_probability_max?.[0]);

    if (!Number.isFinite(max) || !Number.isFinite(min)) return fallback;

    const rain: LiveWeather["rain"] = precip >= 60 ? "high" : precip >= 30 ? "medium" : "low";
    return {
      source: "live",
      period: daily?.time?.[0] ?? fallback.period,
      highC: Math.round(max),
      lowC: Math.round(min),
      rain,
      summary: rain === "high" ? "Live forecast suggests showers are likely." : rain === "medium" ? "Live forecast shows mixed conditions." : "Live forecast looks mostly dry.",
      placeName: match.name,
    };
  } catch {
    return fallback;
  }
}

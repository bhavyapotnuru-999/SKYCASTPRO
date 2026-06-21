/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationData, DetailedWeatherData, ForecastDay } from "../types";

/**
 * Returns weather condition name and description matching WMO Weather Codes
 */
export function getWeatherCondition(code: number): { text: string; description: string } {
  switch (code) {
    case 0:
      return { text: "Clear Sky", description: "Clear, cloudless skies" };
    case 1:
      return { text: "Mainly Clear", description: "Mostly clear skies" };
    case 2:
      return { text: "Partly Cloudy", description: "Scatter of soft clouds" };
    case 3:
      return { text: "Overcast", description: "Continuous grey sky" };
    case 45:
    case 48:
      return { text: "Foggy", description: "Thick fog limiting visibility" };
    case 51:
    case 53:
    case 55:
      return { text: "Drizzle", description: "Light gentle rainfall" };
    case 56:
    case 57:
      return { text: "Freezing Drizzle", description: "Very cold drizzle on surfaces" };
    case 61:
    case 63:
    case 65:
      return { text: "Rainy", description: "Steady water precipitation" };
    case 66:
    case 67:
      return { text: "Freezing Rain", description: "Ice-cold heavy downpour" };
    case 71:
    case 73:
    case 75:
      return { text: "Snowy", description: "Steady snowfall and flakes" };
    case 77:
      return { text: "Snow Grains", description: "Tiny frozen snow particles" };
    case 80:
    case 81:
    case 82:
      return { text: "Rain Showers", description: "Sudden bursts of rain" };
    case 85:
    case 86:
      return { text: "Snow Showers", description: "Sudden flurries of snow" };
    case 95:
      return { text: "Thunderstorm", description: "Unstable stormy conditions with lightning" };
    case 96:
    case 99:
      return { text: "Thunderstorm with Hail", description: "Severe storm with hail particles" };
    default:
      return { text: "Moderate Conditions", description: "Normal mild conditions" };
  }
}

/**
 * Searches for global locations matching a text search query
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=5&language=en&format=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Location lookup failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((result: any) => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country || "",
      admin1: result.admin1,
      timezone: result.timezone || "UTC",
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error;
  }
}

/**
 * Fetches all current conditions and 7-day reports for a specific location
 */
export async function getWeatherData(location: LocationData): Promise<DetailedWeatherData> {
  const { latitude, longitude, timezone } = location;

  // Forecast query including current metrics & daily projections
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Weather fetching failed with status: ${response.status}`);
    }

    const data = await response.json();

    const current = data.current;
    const daily = data.daily;

    if (!current || !daily) {
      throw new Error("Invalid or incomplete weather data payload returned.");
    }

    const currentCondition = getWeatherCondition(current.weather_code);

    const formattedCurrent = {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      precipitation: current.precipitation,
      isDay: current.is_day === 1,
      weatherCode: current.weather_code,
      conditionText: currentCondition.text,
      time: current.time,
    };

    const formattedForecast: ForecastDay[] = daily.time.map((dateStr: string, idx: number) => {
      const dayCode = daily.weather_code[idx];
      return {
        date: dateStr,
        maxTemp: daily.temperature_2m_max[idx],
        minTemp: daily.temperature_2m_min[idx],
        uvIndex: daily.uv_index_max[idx] ?? 0,
        weatherCode: dayCode,
        conditionText: getWeatherCondition(dayCode).text,
      };
    });

    return {
      location,
      current: formattedCurrent,
      forecast: formattedForecast,
    };
  } catch (error) {
    console.error("Error fetching detailed weather data:", error);
    throw error;
  }
}

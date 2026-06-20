/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useId } from "react";
import { SearchBar } from "./components/SearchBar";
import { WeatherCard } from "./components/WeatherCard";
import { ForecastSection } from "./components/ForecastSection";
import { DetailedWeatherData, LocationData } from "./types";
import { getWeatherData } from "./utils/weatherApi";
import { PRESET_CITIES } from "./utils/presets";
import {
  CloudSun,
  RefreshCw,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(PRESET_CITIES[0]);
  const [weatherData, setWeatherData] = useState<DetailedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<"C" | "F">(() => {
    try {
      const stored = localStorage.getItem("skycast_temp_unit");
      return (stored === "C" || stored === "F") ? stored : "C";
    } catch {
      return "C";
    }
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("skycast_temp_unit", tempUnit);
    } catch (e) {
      console.warn("Storage write blocked or unavailable", e);
    }
  }, [tempUnit]);

  const headingId = useId();

  // Helper to dynamically evaluate dynamic glow mesh colors relative to climate conditions
  const getGlowColors = (weatherCode: number, isDay: boolean): { left: string; right: string; mid: string } => {
    if (!isDay) {
      return {
        left: "bg-indigo-900",
        right: "bg-purple-950",
        mid: "bg-sky-900"
      };
    }
    switch (weatherCode) {
      case 0: // Sunny / Ultra clear
      case 1:
        return {
          left: "bg-amber-600",
          right: "bg-rose-500",
          mid: "bg-orange-400"
        };
      case 51: // Rain / Drizzle
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return {
          left: "bg-cyan-600",
          right: "bg-blue-700",
          mid: "bg-teal-500"
        };
      case 95: // Thunderstorm
      case 96:
      case 99:
        return {
          left: "bg-purple-800",
          right: "bg-indigo-950",
          mid: "bg-fuchsia-900"
        };
      default: // Cloudy / Default
        return {
          left: "bg-blue-600",
          right: "bg-purple-600",
          mid: "bg-cyan-400"
        };
    }
  };

  // Main weather loading effect
  useEffect(() => {
    let active = true;
    async function loadWeather() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getWeatherData(selectedLocation);
        if (active) {
          setWeatherData(result);
        }
      } catch (err: any) {
        if (active) {
          setError(
            err?.message || "Unable to retrieve weather reports. Please check your network connection."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }
    loadWeather();
    return () => {
      active = false;
    };
  }, [selectedLocation]);

  // Quick refresh action
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await getWeatherData(selectedLocation);
      setWeatherData(result);
    } catch (err: any) {
      setError("An error occurred while refreshing your weather forecast.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleUnit = () => {
    setTempUnit((prev) => (prev === "C" ? "F" : "C"));
  };

  const glows = weatherData
    ? getGlowColors(weatherData.current.weatherCode, weatherData.current.isDay)
    : { left: "bg-blue-600", right: "bg-purple-600", mid: "bg-cyan-400" };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-750 ease-out flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Mesh Gradient Background Elements */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${glows.left} rounded-full blur-[120px] opacity-25 pointer-events-none transition-all duration-1000`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] ${glows.right} rounded-full blur-[120px] opacity-25 pointer-events-none transition-all duration-1000`}></div>
      <div className={`absolute top-[20%] right-[10%] w-[300px] h-[300px] ${glows.mid} rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-1000`}></div>

      {/* Upper Brand Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-6 md:pt-10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 transition-transform hover:scale-[1.01] duration-300">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <CloudSun className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight text-white uppercase">
              SkyCast Pro
            </h1>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/50">
              Microclimate Intel
            </p>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="flex items-center gap-3">
          <button
            id="refresh-feed-btn"
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all font-sans font-bold text-xs md:text-sm shadow-sm disabled:opacity-50"
            aria-label="Refresh weather data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Shell */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 space-y-8 flex flex-col justify-center z-10">
        {/* Dynamic Search section */}
        <SearchBar
          onSelectLocation={setSelectedLocation}
          activeLocation={selectedLocation}
        />

        {/* Loading Overlay */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4" id="primary-loader">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-white relative z-10" />
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-125 opacity-40"></div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-white font-sans font-extrabold text-base md:text-lg">Tapping weather satellites...</p>
              <p className="text-white/60 text-xs font-semibold">Fetching microclimate reports for {selectedLocation.name}</p>
            </div>
          </div>
        ) : error ? (
          /* Error Banner */
          <div className="bg-rose-955/35 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-rose-500/30 shadow-2xl text-center max-w-xl mx-auto space-y-4" id="error-banner">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Geocoding Failure</h3>
              <p className="text-sm text-rose-200/80">{error}</p>
            </div>
            <button
              id="retry-fetch-btn"
              type="button"
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-sm rounded-xl shadow-lg transition-all hover:shadow-rose-500/20"
            >
              Try Again
            </button>
          </div>
        ) : weatherData ? (
          /* Weather details render */
          <div className="space-y-8 animate-fade-in" id="weather-details-section">
            <WeatherCard
              data={weatherData}
              unit={tempUnit}
              onToggleUnit={handleToggleUnit}
            />
            <ForecastSection days={weatherData.forecast.slice(0, 5)} unit={tempUnit} />
          </div>
        ) : null}
      </main>

      {/* Dynamic Portfolio Footer */}
      <footer className="w-full bg-slate-950/40 backdrop-blur-md border-t border-white/10 mt-12 py-8 z-10 text-white/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2.5 bg-white/10 rounded-xl text-white/60 border border-white/10">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide font-sans">
                Enterprise weather display designed for high-resolution microclimatic metrics.
              </p>
              <p className="text-[10px] text-white/40 font-medium">
                Integrated using responsive Tailwind parameters and secure, asynchronous geolocational APIs.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

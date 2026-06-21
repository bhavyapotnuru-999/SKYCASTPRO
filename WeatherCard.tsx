/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DetailedWeatherData } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import {
  Wind,
  Droplets,
  Navigation,
  Thermometer,
  Calendar,
  CloudRain,
  Compass,
} from "lucide-react";

interface WeatherCardProps {
  data: DetailedWeatherData;
  unit: "C" | "F";
  onToggleUnit: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  data,
  unit,
  onToggleUnit,
}) => {
  const { location, current, forecast } = data;

  const toFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);
  const formatTemp = (temp: number) => {
    const val = unit === "F" ? toFahrenheit(temp) : Math.round(temp);
    return `${val}°${unit}`;
  };

  // Safe helper to format time
  const getFormattedTime = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: location.timezone,
      };
      return new Intl.DateTimeFormat("en-US", options).format(new Date());
    } catch (e) {
      return new Date().toLocaleDateString();
    }
  };

  // Humidity level evaluation
  const getHumidityFeedback = (rh: number) => {
    if (rh < 30) return { label: "Dry Air", color: "text-amber-600 bg-amber-50" };
    if (rh <= 60) return { label: "Comfortable", color: "text-emerald-600 bg-emerald-50" };
    return { label: "High Moisture", color: "text-blue-600 bg-blue-50" };
  };

  // Beaufort-like scale feedback
  const getWindFeedback = (speed: number) => {
    if (speed < 5) return "Calm";
    if (speed < 15) return "Light breeze";
    if (speed < 25) return "Moderate wind";
    return "High wind";
  };

  // UV level scale feedback
  const getUVFeedback = (uv: number) => {
    if (uv <= 2) return { label: "Low", color: "text-emerald-600 bg-emerald-50" };
    if (uv <= 5) return { label: "Moderate", color: "text-orange-600 bg-orange-50" };
    if (uv <= 8) return { label: "Very High", color: "text-red-600 bg-red-50 animate-pulse" };
    return { label: "Extreme", color: "text-purple-600 bg-purple-50" };
  };

  const todayForecast = forecast[0] || { maxTemp: current.temperature, minTemp: current.temperature };

  const uuid = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id={uuid('weather-card-container')}>
      <div 
        id={uuid('weather-card-inner')}
        className="bg-white/10 backdrop-blur-2xl rounded-[40px] p-6 md:p-10 border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-cyan-500/5 hover:border-white/30"
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6" id={uuid('card-header')}>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Compass className="h-6 w-6 text-cyan-400 animate-spin-slow" />
              {location.name}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/10">
                {location.country}
              </span>
            </h2>
            <p className="text-white/60 text-xs md:text-sm flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-white/40" />
              {getFormattedTime()}
            </p>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shadow-inner" id={uuid('unit-switcher')}>
            <button
              id={uuid('unit-c-btn')}
              type="button"
              onClick={() => { if (unit !== "C") onToggleUnit(); }}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                unit === "C"
                  ? "bg-white text-indigo-950 shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              °C
            </button>
            <button
              id={uuid('unit-f-btn')}
              type="button"
              onClick={() => { if (unit !== "F") onToggleUnit(); }}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                unit === "F"
                  ? "bg-white text-indigo-950 shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8" id={uuid('dashboard-grid')}>
          
          {/* Left Column: Hero Status Card */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-stretch sm:flex-row justify-between lg:flex-col lg:justify-center bg-white/5 rounded-3xl p-6 border border-white/10" id={uuid('hero-status-card')}>
            <div className="flex flex-col items-center sm:items-start lg:items-center">
              <div className="p-5 bg-white/10 rounded-3xl shadow-md border border-white/20 mb-4 transition-transform hover:scale-105 duration-300">
                <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={84} />
              </div>
              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-sans font-light tracking-tighter text-white">
                {formatTemp(current.temperature)}
              </h3>
              <p className="text-xl font-bold text-white/95 mt-2 font-sans tracking-wide">
                {current.conditionText}
              </p>
              <div className="flex items-center gap-2 text-white/60 text-sm mt-1.5 font-medium">
                <span>H: {formatTemp(todayForecast.maxTemp)}</span>
                <span className="text-white/30">•</span>
                <span>L: {formatTemp(todayForecast.minTemp)}</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-0 lg:mt-6 border-t sm:border-t-0 lg:border-t sm:border-l lg:border-l-0 lg:pt-5 sm:pl-6 lg:pl-0 pt-5 sm:pt-0 border-white/10 flex flex-col justify-center sm:justify-between lg:justify-start">
              <div className="space-y-1 sm:space-y-2 lg:space-y-1.5 text-center sm:text-left lg:text-center">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  App timezone
                </div>
                <div className="text-white text-sm font-sans font-semibold">
                  {location.timezone}
                </div>
                <div className="text-xs text-white/50">
                  {current.isDay ? "Daylight active" : "Night active"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4" id={uuid('details-grid')}>
            {/* Metric 1: Apparent (Feels Like) */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/10 transition-all hover:bg-white/10 duration-300 flex items-start gap-4" id={uuid('metric-feels-like')}>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-orange-400">
                <Thermometer className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
                  Feels Like
                </span>
                <p className="text-2xl font-bold font-sans text-white">
                  {formatTemp(current.apparentTemperature)}
                </p>
                <div className="text-xs text-white/50">
                  {current.apparentTemperature > current.temperature
                    ? "Feels warmer than actual"
                    : "Feels cooler than actual"}
                </div>
              </div>
            </div>

            {/* Metric 2: Humidity */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/10 transition-all hover:bg-white/10 duration-300 flex items-start gap-4" id={uuid('metric-humidity')}>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-blue-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div className="space-y-1 w-full">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
                  Humidity
                </span>
                <p className="text-2xl font-bold font-sans text-white">
                  {current.humidity}%
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                    current.humidity < 30 ? "text-amber-300 bg-amber-500/20" :
                    current.humidity <= 60 ? "text-emerald-300 bg-emerald-500/20" : "text-blue-300 bg-blue-500/20"
                  }`}>
                    {getHumidityFeedback(current.humidity).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Wind */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/10 transition-all hover:bg-white/10 duration-300 flex items-start gap-4" id={uuid('metric-wind')}>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-teal-400">
                <Wind className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
                  Wind Speed
                </span>
                <p className="text-2xl font-bold font-sans text-white flex items-center gap-1.5">
                  {current.windSpeed} <span className="text-sm font-semibold text-white/40 font-sans">km/h</span>
                </p>
                <div className="text-xs text-white/50">
                  {getWindFeedback(current.windSpeed)}
                </div>
              </div>
            </div>

            {/* Metric 4: Precipitation & UV */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/10 transition-all hover:bg-white/10 duration-300 flex items-start gap-4" id={uuid('metric-uv')}>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-violet-400">
                <CloudRain className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
                  Rain & UV Indicator
                </span>
                <div className="text-base font-bold font-sans text-white">
                  Rain: <span className="text-lg text-blue-400 font-extrabold">{current.precipitation} mm</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/50 mt-1">
                  <span>UV Max: {todayForecast.uvIndex}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                    todayForecast.uvIndex <= 2 ? "text-emerald-300 bg-emerald-500/20" :
                    todayForecast.uvIndex <= 5 ? "text-orange-300 bg-orange-500/20" : "text-rose-300 bg-rose-500/20"
                  }`}>
                    {getUVFeedback(todayForecast.uvIndex).label}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

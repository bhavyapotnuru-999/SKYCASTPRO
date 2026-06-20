/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ForecastDay } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { CalendarRange } from "lucide-react";

interface ForecastSectionProps {
  days: ForecastDay[];
  unit: "C" | "F";
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ days, unit }) => {
  const toFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);
  const formatTemp = (temp: number) => {
    const val = unit === "F" ? toFahrenheit(temp) : Math.round(temp);
    return `${val}°`;
  };

  const getDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return "Today";
    if (idx === 1) return "Tomorrow";

    try {
      const date = new Date(dateStr);
      // Avoid timezone-shift error by structuring date cleanly
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { weekday: "short" });
      }
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const uuid = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4" id={uuid('forecast-section')}>
      <div className="flex items-center gap-2 px-1 text-white">
        <CalendarRange className="h-5 w-5 text-cyan-400" />
        <h3 className="font-sans font-bold text-lg tracking-tight">5-Day Forecast Outlook</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5" id={uuid('forecast-grid')}>
        {days.map((day, idx) => (
          <div
            id={`forecast-day-${idx}`}
            key={day.date}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center text-center shadow-md transition-all hover:bg-white/20 hover:scale-[1.03] hover:shadow-cyan-500/5 duration-300"
          >
            {/* Weekday Label */}
            <span className="text-sm font-bold text-white block font-sans">
              {getDayName(day.date, idx)}
            </span>
            {/* Calendar Date Label */}
            <span className="text-[10px] text-white/50 font-bold block mt-0.5 uppercase tracking-wide">
              {getFormattedDate(day.date)}
            </span>

            {/* Weather Condition Icon */}
            <div className="my-3.5 p-2.5 bg-white/10 rounded-2xl border border-white/10">
              <WeatherIcon code={day.weatherCode} size={32} />
            </div>

            {/* Weather string description */}
            <span className="text-xs font-semibold text-white/70 mb-2 truncate max-w-[100px] block">
              {day.conditionText}
            </span>

            {/* High/Low Temperature range */}
            <div className="mt-auto flex items-center gap-2 text-xs">
              <span className="font-bold text-white">
                {formatTemp(day.maxTemp)}
              </span>
              <span className="font-medium text-white/40">
                {formatTemp(day.minTemp)}
              </span>
            </div>

            {/* Soft UV Indicator */}
            <div className="mt-2 text-[9px] text-white/40 font-bold font-sans tracking-wide">
              UV {day.uvIndex}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

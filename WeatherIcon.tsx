/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudSnow,
} from "lucide-react";

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = "",
  size = 24,
}) => {
  switch (code) {
    case 0: // Clear sky
      return isDay ? (
        <Sun className={`text-amber-500 animate-pulse ${className}`} size={size} />
      ) : (
        <Moon className={`text-indigo-300 ${className}`} size={size} />
      );

    case 1: // Mainly clear
    case 2: // Partly cloudy
      return isDay ? (
        <CloudSun className={`text-sky-400 ${className}`} size={size} />
      ) : (
        <CloudMoon className={`text-indigo-400 ${className}`} size={size} />
      );

    case 3: // Overcast
      return <Cloud className={`text-slate-400 ${className}`} size={size} />;

    case 45: // Fog
    case 48: // Depositing rime fog
      return <CloudFog className={`text-zinc-400 ${className}`} size={size} />;

    case 51: // Drizzle
    case 53:
    case 55:
      return <CloudDrizzle className={`text-teal-400 ${className}`} size={size} />;

    case 56: // Freezing Drizzle
    case 57:
    case 66: // Freezing Rain
    case 67:
    case 71: // Snow fall
    case 73:
    case 75:
    case 77: // Snow grains
    case 85: // Snow showers
    case 86:
      return <Snowflake className={`text-sky-200 ${className}`} size={size} />;

    case 61: // Rain
    case 63:
    case 65:
    case 80: // Rain showers
    case 81:
    case 82:
      return <CloudRain className={`text-blue-400 ${className}`} size={size} />;

    case 95: // Thunderstorm
    case 96:
    case 99:
      return <CloudLightning className={`text-purple-400 ${className}`} size={size} />;

    default:
      return <Cloud className={`text-slate-400 ${className}`} size={size} />;
  }
};

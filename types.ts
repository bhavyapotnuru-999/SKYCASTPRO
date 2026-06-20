/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocationData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/province
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  isDay: boolean;
  weatherCode: number;
  conditionText: string;
  time: string;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  uvIndex: number;
  weatherCode: number;
  conditionText: string;
}

export interface DetailedWeatherData {
  location: LocationData;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

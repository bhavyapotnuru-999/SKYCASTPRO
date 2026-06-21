/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { LocationData } from "../types";
import { searchLocations } from "../utils/weatherApi";
import { PRESET_CITIES } from "../utils/presets";

interface SearchBarProps {
  onSelectLocation: (location: LocationData) => void;
  activeLocation?: LocationData;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  activeLocation,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Soft debounced effect for geocoding query
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        if (results.length === 0) {
          setError("No cities found matching your search term.");
        }
      } catch (err) {
        setError("Error fetching city search results.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setQuery(""); // Clear on select
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setError(null);
  };

  const uuid = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  const searchInputId = uuid('search-input');
  const presetGroupId = uuid('preset-group');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search Input Container */}
      <div className="relative" ref={dropdownRef}>
        <label htmlFor={searchInputId} className="sr-only">Search for a city</label>
        <div className="relative flex items-center shadow-lg rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all focus-within:ring-2 focus-within:ring-white/30 overflow-hidden">
          <div className="pl-4 text-white/50">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/80" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>
          <input
            id={searchInputId}
            type="text"
            className="w-full py-4 px-3 text-white placeholder-white/40 font-sans focus:outline-none text-base bg-transparent"
            placeholder="Search city (e.g. London, Tokyo, Mumbai...)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <button
              id={uuid('clear-search-btn')}
              type="button"
              onClick={handleClear}
              className="p-2 mr-2 text-white/40 hover:text-white/70 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Clear text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {isOpen && (query.trim().length >= 2) && (
          <div className="absolute left-0 right-0 z-50 mt-2 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 divide-y divide-white/10 overflow-hidden max-h-72 overflow-y-auto">
            {isLoading && suggestions.length === 0 && (
              <div className="px-4 py-3.5 text-sm text-white/50 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                Searching cities...
              </div>
            )}
            
            {error && !isLoading && (
              <div className="px-4 py-3.5 text-sm text-rose-300">
                {error}
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <ul className="py-2" aria-label="City suggestions">
                {suggestions.map((loc) => (
                  <li key={loc.id}>
                    <button
                      id={`suggest-${loc.id}`}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-start gap-3 transition-colors group"
                    >
                      <MapPin className="h-5 w-5 text-white/40 group-hover:text-white/80 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-white group-hover:text-white">
                          {loc.name}
                        </div>
                        <div className="text-xs text-white/60 font-sans">
                          {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Preset Quick Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5" id={presetGroupId}>
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider mr-1">Popular:</span>
        {PRESET_CITIES.map((city) => {
          const isActive = activeLocation?.id === city.id;
          return (
            <button
              id={`preset-${city.id}`}
              key={city.id}
              type="button"
              onClick={() => onSelectLocation(city)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 shadow-sm ${
                isActive
                  ? "bg-white text-indigo-950 border-white font-bold"
                  : "bg-white/10 backdrop-blur-sm border-white/10 text-white/80 hover:border-white/30 hover:text-white"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

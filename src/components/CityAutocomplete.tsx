import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchCities, NovaPoshtaCity, formatCityDisplay } from '../lib/novaPoshta';

interface CityAutocompleteProps {
  value: NovaPoshtaCity | null;
  onChange: (city: NovaPoshtaCity | null) => void;
  required?: boolean;
  placeholder?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  required = false,
  placeholder = 'Введіть назву міста'
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<NovaPoshtaCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value) {
      setInputValue(formatCityDisplay(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue);

    if (!newValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      onChange(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (newValue.trim().length >= 2) {
        setIsLoading(true);
        try {
          const cities = await searchCities(newValue.trim());
          setSuggestions(cities);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching cities:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);
  };

  const handleSelectCity = (city: NovaPoshtaCity) => {
    setInputValue(formatCityDisplay(city));
    onChange(city);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Місто {required && '*'}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <MapPin className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {inputValue && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={city.Ref}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-900">
                    {city.Description}
                  </div>
                  {city.AreaDescription && (
                    <div className="text-sm text-slate-600">
                      {city.AreaDescription}
                      {city.RegionDescription && `, ${city.RegionDescription}`}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="text-slate-600 text-sm text-center">
            Міст не знайдено. Спробуйте змінити запит.
          </p>
        </div>
      )}
    </div>
  );
}

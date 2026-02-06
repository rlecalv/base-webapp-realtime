'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAddresses, IGNAddress } from '@/lib/ignApi';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, postcode: string, city: string, lat?: number, lon?: number) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  helpText?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Ex: 10 rue de la Paix, Paris',
  required = false,
  label,
  error,
  helpText,
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<IGNAddress[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange('', '', '');

    if (newQuery.length >= 3) {
      setIsLoading(true);
      const results = await searchAddresses(newQuery);
      setSuggestions(results);
      setShowSuggestions(true);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (address: IGNAddress) => {
    setQuery(address.label);
    setShowSuggestions(false);
    onChange(
      address.label,
      address.postcode,
      address.city,
      address.geometry.coordinates[1],
      address.geometry.coordinates[0]
    );
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            error && 'border-destructive'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-3 py-2.5 hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{suggestion.label}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.postcode} {suggestion.city}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {helpText && !error && <p className="mt-1.5 text-xs text-muted-foreground">{helpText}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

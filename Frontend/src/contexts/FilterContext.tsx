// src/contexts/FilterContext.tsx
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeSearchQuery, containsRegex } from '../services/PostService';

interface FilterState {
  [key: string]: string;
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: (key: string, value: string) => void;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  getFilter: (key: string, defaultValue?: string) => string;
  serializeSearch?: (allowedKeys?: string[]) => string | undefined;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ 
  children: React.ReactNode;
  defaultFilters?: FilterState;
}> = ({ children, defaultFilters = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse filters directly from URL on every render
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const parsedFilters: FilterState = {};
    
    // Parse all query parameters from URL
    params.forEach((value, key) => {
      parsedFilters[key] = value;
    });
    
    // Apply defaults only for missing parameters
    Object.entries(defaultFilters).forEach(([key, defaultValue]) => {
      if (!(key in parsedFilters)) {
        parsedFilters[key] = defaultValue;
      }
    });
    
    return parsedFilters;
  }, [location.search, defaultFilters]);

  const serializeSearch = useCallback((allowedKeys?: string[]) => {
    // Build filters from current URL-derived `filters` state
    const filtersToUse: Record<string, any> = {};

    Object.entries(filters).forEach(([k, v]) => {
      if (k === 'q') return; // skip search bar here
      if (allowedKeys && !allowedKeys.includes(k)) return;
      if (v === undefined || v === null || v === '') return;
      filtersToUse[k] = v;
    });

    const q = filters['q'] || '';

    // Convert to search expressions (RegExp or values)
    const queryExpr = makeSearchQuery(filtersToUse);

    // Serialize expressions: convert RegExp to source string
    const out: Record<string, any> = {};
    for (const k in queryExpr) {
      const v = queryExpr[k];
      if (v instanceof RegExp) out[k] = v.source;
      else out[k] = v;
    }

    // If there's a q (search bar) include it under the '*' key as requested
    if (q && q !== '') {
      out['*'] = containsRegex(q);
    }

    // If nothing to send, return undefined
    if (Object.keys(out).length === 0) return undefined;

    return JSON.stringify(out);
  }, [filters]);

  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    // Add all non-empty filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    // Remove parameters that match default values or are empty
    Object.entries(defaultFilters).forEach(([key, defaultValue]) => {
      if (newFilters[key] === defaultValue || newFilters[key] === '') {
        params.delete(key);
      }
    });
    
    const queryString = params.toString();
    const newUrl = queryString ? `${location.pathname}?${queryString}` : location.pathname;
    
    navigate(newUrl, { replace: true });
  }, [location.pathname, navigate, defaultFilters]);

  const setFilters = useCallback((newFilters: FilterState) => {
    updateUrl(newFilters);
  }, [updateUrl]);

  const updateFilter = useCallback((key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  const resetFilters = useCallback(() => {
    updateUrl(defaultFilters);
  }, [defaultFilters, updateUrl]);

  const getFilter = useCallback((key: string, defaultValue: string = '') => {
    return filters[key] || defaultValue;
  }, [filters]);

  const contextValue = useMemo(() => ({
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    getFilter,
    serializeSearch
  }), [filters, setFilters, updateFilter, resetFilters, getFilter, serializeSearch]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
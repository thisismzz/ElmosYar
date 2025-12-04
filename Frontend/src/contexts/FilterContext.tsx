// src/contexts/FilterContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface FilterState {
  mealType: string;
  location: string;
  day: string; 
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const defaultFilters: FilterState = {
    mealType: 'all',
    location: 'all',
    day: 'all'
  };

  const parseUrlParams = (): FilterState => {
    const params = new URLSearchParams(location.search);
    return {
      mealType: params.get('meal') || 'all',
      location: params.get('location') || 'all',
      day: params.get('day') || 'all' 
    };
  };

  const [filters, setFiltersState] = useState<FilterState>(parseUrlParams());

  const updateUrl = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.mealType !== 'all') params.set('meal', newFilters.mealType);
    if (newFilters.location !== 'all') params.set('location', newFilters.location);
    if (newFilters.day !== 'all') params.set('day', newFilters.day); 
    
    const queryString = params.toString();
    const newUrl = queryString ? `${location.pathname}?${queryString}` : location.pathname;
    
    navigate(newUrl, { replace: true });
  };

  const setFilters = (newFilters: FilterState) => {
    setFiltersState(newFilters);
    updateUrl(newFilters);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  useEffect(() => {
    setFiltersState(parseUrlParams());
  }, [location.search]);

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter, resetFilters }}>
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
'use client';
import React from 'react';

interface FiltersProps {
  options: any;
  currentFilters: any;
  onChange: (filters: any) => void;
}

export default function Filters({ options, currentFilters, onChange }: FiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...currentFilters };
    if (value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onChange(newFilters);
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Filters</h3>
        {Object.keys(currentFilters).length > 0 && (
          <button className="btn-pill" onClick={clearFilters}>Clear all</button>
        )}
      </div>
      {['end_year', 'topic', 'sector', 'region', 'pestle', 'source', 'country'].map(filterKey => (
        <div key={filterKey} className="filter-group">
          <label>{filterKey.replace('_', ' ').toUpperCase()}</label>
          <select 
            value={currentFilters[filterKey] || ""} 
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
          >
            <option value="">Any {filterKey.replace('_', ' ')}</option>
            {options[filterKey]?.filter(Boolean).map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </>
  );
}

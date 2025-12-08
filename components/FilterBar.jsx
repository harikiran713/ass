'use client'

import { useState, useEffect } from 'react'
import './FilterBar.css'

export default function FilterBar({ filters, filterOptions, filterOptionsLoading = false, onFilterChange, sortBy, sortOrder, onSortChange }) {
  const [openDropdown, setOpenDropdown] = useState(null)

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && openDropdown) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [openDropdown])

  const handleMultiSelect = (filterType, value) => {
    const currentValues = filters[filterType] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange(filterType, newValues)
  }

  const removeFilter = (filterType, value) => {
    if (filterType === 'ageRange' || filterType === 'dateRange') {
      onFilterChange(filterType, { min: '', max: '' })
    } else {
      const currentValues = filters[filterType] || []
      onFilterChange(filterType, currentValues.filter(v => v !== value))
    }
  }

  const getFilterLabel = (filterType) => {
    const labels = {
      regions: 'Customer Region',
      genders: 'Gender',
      ageRange: 'Age Range',
      categories: 'Product Category',
      tags: 'Tags',
      paymentMethods: 'Payment Method',
      dateRange: 'Date'
    }
    return labels[filterType] || filterType
  }

  const getFilterDisplayValue = (filterType) => {
    if (filterType === 'ageRange') {
      if (filters.ageRange?.min && filters.ageRange?.max) {
        return `${filters.ageRange.min}-${filters.ageRange.max}`
      }
      if (filters.ageRange?.min) return `Min: ${filters.ageRange.min}`
      if (filters.ageRange?.max) return `Max: ${filters.ageRange.max}`
      return null
    }
    if (filterType === 'dateRange') {
      if (filters.dateRange?.start && filters.dateRange?.end) {
        return `${filters.dateRange.start} to ${filters.dateRange.end}`
      }
      if (filters.dateRange?.start) return `From: ${filters.dateRange.start}`
      if (filters.dateRange?.end) return `To: ${filters.dateRange.end}`
      return null
    }
    return null
  }

  const FilterDropdown = ({ filterType, label, options, isRange = false }) => {
    const isOpen = openDropdown === filterType
    const activeValues = filters[filterType] || []
    const hasActive = isRange 
      ? (filterType === 'ageRange' && (filters.ageRange?.min || filters.ageRange?.max)) ||
        (filterType === 'dateRange' && (filters.dateRange?.start || filters.dateRange?.end))
      : activeValues.length > 0
    
    // Debug: Log options to see what's being received
    if (isOpen && !isRange) {
      console.log(`FilterDropdown ${filterType}:`, { options, optionsLength: options?.length, optionsType: typeof options })
    }

    return (
      <div className="filter-dropdown-wrapper">
        <button
          className={`filter-dropdown-btn ${hasActive ? 'active' : ''}`}
          onClick={() => setOpenDropdown(isOpen ? null : filterType)}
        >
          {label}
          {hasActive && (
            <span className="filter-count">
              {isRange ? '•' : activeValues.length}
            </span>
          )}
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <>
            <div className="dropdown-overlay" onClick={() => setOpenDropdown(null)} />
            <div className="filter-dropdown-menu" onClick={(e) => e.stopPropagation()}>
              {isRange && filterType === 'ageRange' ? (
                <div className="range-inputs" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageRange?.min || ''}
                    onChange={(e) => onFilterChange('ageRange', { ...filters.ageRange, min: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageRange?.max || ''}
                    onChange={(e) => onFilterChange('ageRange', { ...filters.ageRange, max: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : isRange && filterType === 'dateRange' ? (
                <div className="range-inputs" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <div className="filter-options">
                  {options && Array.isArray(options) && options.length > 0 ? (
                    options.map(option => {
                      // Ensure option is a valid string/number
                      const optionValue = String(option || '').trim()
                      if (!optionValue) return null
                      return (
                        <label key={optionValue} className="filter-option" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={activeValues.includes(optionValue)}
                            onChange={() => handleMultiSelect(filterType, optionValue)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{optionValue}</span>
                        </label>
                      )
                    }).filter(Boolean)
                  ) : (
                    <div className="filter-option-empty">
                      {filterOptionsLoading ? 'Loading options...' : 'No options available. Please check database connection.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Display active filter tags */}
        {hasActive && !isRange && (
          <div className="filter-tags">
            {activeValues.map(value => (
              <span key={value} className="filter-tag">
                {value.length > 10 ? value.substring(0, 8) + '...' : value}
                <button onClick={() => removeFilter(filterType, value)}>×</button>
              </span>
            ))}
          </div>
        )}
        {hasActive && isRange && (
          <div className="filter-tags">
            <span className="filter-tag">
              {getFilterDisplayValue(filterType)}
              <button onClick={() => removeFilter(filterType, null)}>×</button>
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="filter-bar">
      <FilterDropdown
        filterType="regions"
        label="Customer Region"
        options={filterOptions.regions || []}
      />
      <FilterDropdown
        filterType="genders"
        label="Gender"
        options={filterOptions.genders || []}
      />
      <FilterDropdown
        filterType="ageRange"
        label="Age Range"
        options={[]}
        isRange={true}
      />
      <FilterDropdown
        filterType="categories"
        label="Product Category"
        options={filterOptions.categories || []}
      />
      <FilterDropdown
        filterType="tags"
        label="Tags"
        options={filterOptions.tags || []}
      />
      <FilterDropdown
        filterType="paymentMethods"
        label="Payment Method"
        options={filterOptions.paymentMethods || []}
      />
      <FilterDropdown
        filterType="dateRange"
        label="Date"
        options={[]}
        isRange={true}
      />
      <div className="filter-dropdown-wrapper">
        <button
          className={`filter-dropdown-btn ${sortBy !== 'date' ? 'active' : ''}`}
          onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
        >
          Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'quantity' ? 'Quantity' : 'Customer Name'}
          {sortBy !== 'date' && <span className="filter-count">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          <span className={`dropdown-arrow ${openDropdown === 'sort' ? 'open' : ''}`}>▼</span>
        </button>
        {openDropdown === 'sort' && (
          <>
            <div className="dropdown-overlay" onClick={() => setOpenDropdown(null)} />
            <div className="filter-dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="filter-options">
                <label className="filter-option" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="radio"
                    checked={sortBy === 'date'}
                    onChange={() => {
                      onSortChange('date');
                      setOpenDropdown(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>Date (Newest First)</span>
                </label>
                <label className="filter-option" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="radio"
                    checked={sortBy === 'quantity'}
                    onChange={() => {
                      onSortChange('quantity');
                      setOpenDropdown(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>Quantity</span>
                </label>
                <label className="filter-option" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="radio"
                    checked={sortBy === 'customerName'}
                    onChange={() => {
                      onSortChange('customerName');
                      setOpenDropdown(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>Customer Name (A-Z)</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


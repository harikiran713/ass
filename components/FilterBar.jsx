'use client'

import { useState } from 'react'
import './FilterBar.css'

export default function FilterBar({ filters, filterOptions, onFilterChange, sortBy, sortOrder, onSortChange }) {
  const [openDropdown, setOpenDropdown] = useState(null)

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
            <div className="filter-dropdown-menu">
              {isRange && filterType === 'ageRange' ? (
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageRange?.min || ''}
                    onChange={(e) => onFilterChange('ageRange', { ...filters.ageRange, min: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageRange?.max || ''}
                    onChange={(e) => onFilterChange('ageRange', { ...filters.ageRange, max: e.target.value })}
                  />
                </div>
              ) : isRange && filterType === 'dateRange' ? (
                <div className="range-inputs">
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  />
                </div>
              ) : (
                <div className="filter-options">
                  {options.map(option => (
                    <label key={option} className="filter-option">
                      <input
                        type="checkbox"
                        checked={activeValues.includes(option)}
                        onChange={() => handleMultiSelect(filterType, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
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
            <div className="filter-dropdown-menu">
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    checked={sortBy === 'date'}
                    onChange={() => onSortChange('date')}
                  />
                  <span>Date (Newest First)</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    checked={sortBy === 'quantity'}
                    onChange={() => onSortChange('quantity')}
                  />
                  <span>Quantity</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    checked={sortBy === 'customerName'}
                    onChange={() => onSortChange('customerName')}
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


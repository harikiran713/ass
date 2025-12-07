'use client'

import { useState } from 'react'
import './FilterPanel.css'

export default function FilterPanel({ filters, filterOptions, onFilterChange }) {
  const [expandedSections, setExpandedSections] = useState({
    region: true,
    gender: true,
    age: true,
    category: true,
    tags: true,
    payment: true,
    date: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleMultiSelect = (filterType, value) => {
    const currentValues = filters[filterType] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange(filterType, newValues)
  }

  const handleRangeChange = (filterType, field, value) => {
    onFilterChange(filterType, { [field]: value })
  }

  const clearFilter = (filterType) => {
    if (filterType === 'ageRange' || filterType === 'dateRange') {
      onFilterChange(filterType, { min: '', max: '' })
    } else {
      onFilterChange(filterType, [])
    }
  }

  const hasActiveFilter = (filterType) => {
    if (filterType === 'ageRange') {
      return filters.ageRange?.min !== '' && filters.ageRange?.min !== undefined && filters.ageRange?.min !== null ||
             filters.ageRange?.max !== '' && filters.ageRange?.max !== undefined && filters.ageRange?.max !== null
    }
    if (filterType === 'dateRange') {
      return filters.dateRange?.start !== '' || filters.dateRange?.end !== ''
    }
    return filters[filterType] && Array.isArray(filters[filterType]) && filters[filterType].length > 0
  }

  return (
    <div className="filter-panel">
      <h2>Filters</h2>
      
      {/* Customer Region */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('region')}>
          <span>Customer Region {hasActiveFilter('regions') && <span className="filter-badge">{(filters.regions || []).length}</span>}</span>
          <span className="filter-toggle">{expandedSections.region ? '−' : '+'}</span>
        </div>
        {expandedSections.region && (
          <div className="filter-content">
            {(filterOptions.regions || []).map(region => (
              <label key={region} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.regions || []).includes(region)}
                  onChange={() => handleMultiSelect('regions', region)}
                />
                <span>{region}</span>
              </label>
            ))}
            {hasActiveFilter('regions') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('regions')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Gender */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('gender')}>
          <span>Gender {hasActiveFilter('genders') && <span className="filter-badge">{(filters.genders || []).length}</span>}</span>
          <span className="filter-toggle">{expandedSections.gender ? '−' : '+'}</span>
        </div>
        {expandedSections.gender && (
          <div className="filter-content">
            {(filterOptions.genders || []).map(gender => (
              <label key={gender} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.genders || []).includes(gender)}
                  onChange={() => handleMultiSelect('genders', gender)}
                />
                <span>{gender}</span>
              </label>
            ))}
            {hasActiveFilter('genders') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('genders')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Age Range */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('age')}>
          <span>Age Range {hasActiveFilter('ageRange') && <span className="filter-badge">•</span>}</span>
          <span className="filter-toggle">{expandedSections.age ? '−' : '+'}</span>
        </div>
        {expandedSections.age && (
          <div className="filter-content">
            <div className="range-inputs">
              <div className="range-input-group">
                <label>Min Age</label>
                <input
                  type="number"
                  min={filterOptions.ageRange?.min || 0}
                  max={filterOptions.ageRange?.max || 100}
                  value={filters.ageRange?.min || ''}
                  onChange={(e) => handleRangeChange('ageRange', 'min', e.target.value)}
                  placeholder={filterOptions.ageRange?.min || 0}
                />
              </div>
              <div className="range-input-group">
                <label>Max Age</label>
                <input
                  type="number"
                  min={filterOptions.ageRange?.min || 0}
                  max={filterOptions.ageRange?.max || 100}
                  value={filters.ageRange?.max || ''}
                  onChange={(e) => handleRangeChange('ageRange', 'max', e.target.value)}
                  placeholder={filterOptions.ageRange?.max || 100}
                />
              </div>
            </div>
            {hasActiveFilter('ageRange') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('ageRange')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Category */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('category')}>
          <span>Product Category {hasActiveFilter('categories') && <span className="filter-badge">{(filters.categories || []).length}</span>}</span>
          <span className="filter-toggle">{expandedSections.category ? '−' : '+'}</span>
        </div>
        {expandedSections.category && (
          <div className="filter-content">
            {(filterOptions.categories || []).map(category => (
              <label key={category} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.categories || []).includes(category)}
                  onChange={() => handleMultiSelect('categories', category)}
                />
                <span>{category}</span>
              </label>
            ))}
            {hasActiveFilter('categories') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('categories')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('tags')}>
          <span>Tags {hasActiveFilter('tags') && <span className="filter-badge">{(filters.tags || []).length}</span>}</span>
          <span className="filter-toggle">{expandedSections.tags ? '−' : '+'}</span>
        </div>
        {expandedSections.tags && (
          <div className="filter-content">
            {(filterOptions.tags || []).map(tag => (
              <label key={tag} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.tags || []).includes(tag)}
                  onChange={() => handleMultiSelect('tags', tag)}
                />
                <span>{tag}</span>
              </label>
            ))}
            {hasActiveFilter('tags') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('tags')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('payment')}>
          <span>Payment Method {hasActiveFilter('paymentMethods') && <span className="filter-badge">{(filters.paymentMethods || []).length}</span>}</span>
          <span className="filter-toggle">{expandedSections.payment ? '−' : '+'}</span>
        </div>
        {expandedSections.payment && (
          <div className="filter-content">
            {(filterOptions.paymentMethods || []).map(method => (
              <label key={method} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.paymentMethods || []).includes(method)}
                  onChange={() => handleMultiSelect('paymentMethods', method)}
                />
                <span>{method}</span>
              </label>
            ))}
            {hasActiveFilter('paymentMethods') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('paymentMethods')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('date')}>
          <span>Date Range {hasActiveFilter('dateRange') && <span className="filter-badge">•</span>}</span>
          <span className="filter-toggle">{expandedSections.date ? '−' : '+'}</span>
        </div>
        {expandedSections.date && (
          <div className="filter-content">
            <div className="range-inputs">
              <div className="range-input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  min={filterOptions.dateRange?.min || ''}
                  max={filterOptions.dateRange?.max || ''}
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleRangeChange('dateRange', 'start', e.target.value)}
                />
              </div>
              <div className="range-input-group">
                <label>End Date</label>
                <input
                  type="date"
                  min={filterOptions.dateRange?.min || ''}
                  max={filterOptions.dateRange?.max || ''}
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleRangeChange('dateRange', 'end', e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilter('dateRange') && (
              <button className="clear-filter-btn" onClick={() => clearFilter('dateRange')}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


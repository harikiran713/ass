'use client'

import { useState, useEffect, useCallback } from 'react'
import './page.css'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import SalesTable from '@/components/SalesTable'
import Pagination from '@/components/Pagination'
import SummaryCards from '@/components/SummaryCards'

export default function Home() {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statistics, setStatistics] = useState({
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalRecords: 0
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Filter state
  const [filters, setFilters] = useState({
    regions: [],
    genders: [],
    ageRange: { min: '', max: '' },
    categories: [],
    tags: [],
    paymentMethods: [],
    dateRange: { start: '', end: '' }
  })

  // Sort state
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter options - Hardcoded based on the data in screenshots
  const [filterOptions] = useState({
    regions: ['East', 'Central', 'West', 'North', 'South'],
    genders: ['Male', 'Female', 'Other'],
    categories: ['Clothing', 'Electronics', 'Beauty'],
    tags: ['Premium', 'Sale', 'New Arrival', 'Best Seller', 'Limited Edition', 'Trending', 'Popular'],
    paymentMethods: ['Wallet', 'Credit Card', 'UPI', 'Debit Card', 'Net Banking'],
    ageRange: { min: 18, max: 80 },
    dateRange: { min: '2023-01-01', max: '2023-12-31' }
  })
  const [filterOptionsLoading] = useState(false)

  // Fetch sales data
  const fetchSalesData = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        sortBy,
        sortOrder,
        search: searchTerm
      })

      // Add filters to params
      if (Array.isArray(filters.regions) && filters.regions.length > 0) {
        filters.regions.forEach(region => params.append('regions', region))
      }
      if (Array.isArray(filters.genders) && filters.genders.length > 0) {
        filters.genders.forEach(gender => params.append('genders', gender))
      }
      if (filters.ageRange?.min !== '' && filters.ageRange?.min !== undefined && filters.ageRange?.min !== null) {
        params.append('ageMin', filters.ageRange.min)
      }
      if (filters.ageRange?.max !== '' && filters.ageRange?.max !== undefined && filters.ageRange?.max !== null) {
        params.append('ageMax', filters.ageRange.max)
      }
      if (Array.isArray(filters.categories) && filters.categories.length > 0) {
        filters.categories.forEach(category => params.append('categories', category))
      }
      if (Array.isArray(filters.tags) && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag))
      }
      if (Array.isArray(filters.paymentMethods) && filters.paymentMethods.length > 0) {
        filters.paymentMethods.forEach(method => params.append('paymentMethods', method))
      }
      if (filters.dateRange?.start) {
        params.append('dateStart', filters.dateRange.start)
      }
      if (filters.dateRange?.end) {
        params.append('dateEnd', filters.dateRange.end)
      }

      const response = await fetch(`/api/sales?${params.toString()}`)
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to fetch sales data`)
      }
      
      const data = await response.json()
      
      if (!data || !data.data) {
        throw new Error('Invalid response format from server')
      }
      setSalesData(data.data || [])
      setPagination(data.pagination || {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      })
      setStatistics(data.statistics || {
        totalUnits: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalRecords: 0
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data')
      console.error('Error fetching sales data:', err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters, sortBy, sortOrder])

  // Fetch data when filters, search, or sort change (also runs on mount)
  useEffect(() => {
    fetchSalesData(1) // Reset to page 1 when filters/search/sort change
  }, [fetchSalesData])

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (filterType === 'ageRange' || filterType === 'dateRange') {
        newFilters[filterType] = { ...newFilters[filterType], ...value }
      } else {
        newFilters[filterType] = value
      }
      return newFilters
    })
  }

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === 'date' ? 'desc' : 'asc')
    }
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchSalesData(newPage)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sales Management System</h1>
        <SearchBar onSearch={handleSearch} />
      </header>

      <div className="app-container">
        <div className="app-main">
          <FilterBar
            filters={filters}
            filterOptions={filterOptions}
            filterOptionsLoading={filterOptionsLoading}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          <SummaryCards statistics={statistics} />

          {loading && <div className="loading">Loading sales data...</div>}
          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
              <br />
              <small style={{ marginTop: '0.5rem', display: 'block' }}>
                Please check:
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>MongoDB connection is working</li>
                  <li>Database has been seeded (run: npm run seed)</li>
                  <li>Check browser console for more details</li>
                </ul>
              </small>
            </div>
          )}
          {!loading && !error && (
            <>
              <SalesTable data={salesData} />
              {salesData.length === 0 && (
                <div className="no-results">
                  No sales records found matching your criteria.
                </div>
              )}
              {salesData.length > 0 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


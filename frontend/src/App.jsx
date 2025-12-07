import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import SalesTable from './components/SalesTable'
import Pagination from './components/Pagination'
import SortDropdown from './components/SortDropdown'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: [],
    ageRange: { min: 0, max: 100 },
    dateRange: { min: '', max: '' }
  })

  // Fetch filter options on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/filters`)
      .then(response => {
        setFilterOptions(response.data)
      })
      .catch(err => {
        console.error('Error fetching filter options:', err)
      })
  }, [])

  // Fetch sales data
  const fetchSalesData = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        page,
        pageSize: 10,
        sortBy,
        sortOrder,
        search: searchTerm
      }

      // Add filters to params
      if (filters.regions.length > 0) {
        params.regions = filters.regions
      }
      if (filters.genders.length > 0) {
        params.genders = filters.genders
      }
      if (filters.ageRange.min !== '' && filters.ageRange.min !== undefined && filters.ageRange.min !== null) {
        params.ageMin = filters.ageRange.min
      }
      if (filters.ageRange.max !== '' && filters.ageRange.max !== undefined && filters.ageRange.max !== null) {
        params.ageMax = filters.ageRange.max
      }
      if (filters.categories.length > 0) {
        params.categories = filters.categories
      }
      if (filters.tags.length > 0) {
        params.tags = filters.tags
      }
      if (filters.paymentMethods.length > 0) {
        params.paymentMethods = filters.paymentMethods
      }
      if (filters.dateRange.start) {
        params.dateStart = filters.dateRange.start
      }
      if (filters.dateRange.end) {
        params.dateEnd = filters.dateRange.end
      }

      const response = await axios.get(`${API_BASE_URL}/sales`, { params })
      setSalesData(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data')
      console.error('Error fetching sales data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when filters, search, or sort change (also runs on mount)
  useEffect(() => {
    fetchSalesData(1) // Reset to page 1 when filters/search/sort change
  }, [searchTerm, filters, sortBy, sortOrder])

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
        <h1>TruEstate - Retail Sales Management System</h1>
      </header>

      <div className="app-container">
        <div className="app-sidebar">
          <SearchBar onSearch={handleSearch} />
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="app-main">
          <div className="app-controls">
            <SortDropdown
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>

          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">Error: {error}</div>}
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

export default App

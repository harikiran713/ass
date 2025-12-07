'use client'

import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="search-bar">
      <h2>Search</h2>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search by Customer Name or Phone Number..."
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>
    </div>
  )
}


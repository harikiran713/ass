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
    <div className="search-bar-horizontal">
      <input
        type="text"
        placeholder="Name, Phone no."
        value={searchTerm}
        onChange={handleChange}
        className="search-input-horizontal"
      />
      <span className="search-icon-horizontal">🔍</span>
    </div>
  )
}

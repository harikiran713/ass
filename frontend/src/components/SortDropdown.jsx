import './SortDropdown.css'

function SortDropdown({ sortBy, sortOrder, onSortChange }) {
  const sortOptions = [
    { value: 'date', label: 'Date (Newest First)' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'customerName', label: 'Customer Name (A-Z)' }
  ]

  const handleChange = (e) => {
    const newSortBy = e.target.value
    onSortChange(newSortBy)
  }

  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={handleChange}
        className="sort-select"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {sortBy !== 'date' && (
        <button
          className="sort-order-toggle"
          onClick={() => onSortChange(sortBy)}
          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      )}
    </div>
  )
}

export default SortDropdown

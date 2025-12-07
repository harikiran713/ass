'use client'

import './Pagination.css'

export default function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage, totalItems } = pagination

  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    if (hasPreviousPage) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing page {currentPage} of {totalPages} ({totalItems} total items)
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrevious}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="pagination-page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  )
}


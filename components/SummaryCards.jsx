'use client'

import './SummaryCards.css'

export default function SummaryCards({ statistics }) {
  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    const num = parseFloat(amount)
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total units sold</span>
          <span className="summary-card-icon">ℹ️</span>
        </div>
        <div className="summary-card-value">
          {statistics.totalUnits || 0}
        </div>
        {statistics.totalUnits > 0 && (
          <div className="summary-card-subtext">
            {statistics.totalRecords || 0} records
          </div>
        )}
      </div>

      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total Amount</span>
          <span className="summary-card-icon">ℹ️</span>
        </div>
        <div className="summary-card-value">
          {formatCurrency(statistics.totalAmount)}
        </div>
        {statistics.totalAmount > 0 && (
          <div className="summary-card-subtext">
            {statistics.totalRecords || 0} records
          </div>
        )}
      </div>

      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total Discount</span>
          <span className="summary-card-icon">ℹ️</span>
        </div>
        <div className="summary-card-value">
          {formatCurrency(statistics.totalDiscount)}
        </div>
        {statistics.totalDiscount > 0 && (
          <div className="summary-card-subtext">
            {statistics.totalRecords || 0} records
          </div>
        )}
      </div>
    </div>
  )
}


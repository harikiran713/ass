import './SalesTable.css'

function SalesTable({ data }) {
  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00'
    const num = parseFloat(amount)
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Region</th>
            <th>Product</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price/Unit</th>
            <th>Discount</th>
            <th>Final Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{formatDate(row['Date'])}</td>
              <td className="customer-name">{row['Customer Name'] || 'N/A'}</td>
              <td>{row['Phone Number'] || 'N/A'}</td>
              <td>{row['Customer Region'] || 'N/A'}</td>
              <td className="product-name">{row['Product Name'] || 'N/A'}</td>
              <td>{row['Product Category'] || 'N/A'}</td>
              <td className="quantity">{row['Quantity'] || '0'}</td>
              <td>{formatCurrency(row['Price per Unit'])}</td>
              <td className="discount">{row['Discount Percentage'] || '0'}%</td>
              <td className="final-amount">{formatCurrency(row['Final Amount'])}</td>
              <td>{row['Payment Method'] || 'N/A'}</td>
              <td>
                <span className={`status-badge status-${(row['Order Status'] || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {row['Order Status'] || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SalesTable

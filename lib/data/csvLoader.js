import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let salesData = null;
let dataLoaded = false;
let loadingPromise = null;

// Process a single CSV row
function processRow(data) {
  const processedData = { ...data };
  
  // Convert numeric fields
  if (processedData['Age']) {
    processedData['Age'] = parseInt(processedData['Age']) || 0;
  }
  if (processedData['Quantity']) {
    processedData['Quantity'] = parseInt(processedData['Quantity']) || 0;
  }
  if (processedData['Price per Unit']) {
    processedData['Price per Unit'] = parseFloat(processedData['Price per Unit']) || 0;
  }
  if (processedData['Discount Percentage']) {
    processedData['Discount Percentage'] = parseFloat(processedData['Discount Percentage']) || 0;
  }
  if (processedData['Total Amount']) {
    processedData['Total Amount'] = parseFloat(processedData['Total Amount']) || 0;
  }
  if (processedData['Final Amount']) {
    processedData['Final Amount'] = parseFloat(processedData['Final Amount']) || 0;
  }
  
  // Convert date string to Date object
  if (processedData['Date']) {
    const date = new Date(processedData['Date']);
    processedData['Date'] = isNaN(date.getTime()) ? null : date;
  }
  
  return processedData;
}

// Load CSV data into memory
export async function loadSalesData() {
  if (dataLoaded && salesData) {
    return salesData;
  }
  
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = new Promise(async (resolve, reject) => {
    try {
      const dataFilePath = path.join(__dirname, '..', '..', 'data', 'sales_data.csv');
      
      if (!fs.existsSync(dataFilePath)) {
        throw new Error(`Data file not found at ${dataFilePath}`);
      }
      
      console.log('Loading CSV data into memory...');
      const results = [];
      
      await new Promise((resolveStream, rejectStream) => {
        fs.createReadStream(dataFilePath)
          .pipe(csv())
          .on('data', (data) => {
            results.push(processRow(data));
          })
          .on('end', resolveStream)
          .on('error', rejectStream);
      });
      
      salesData = results;
      dataLoaded = true;
      console.log(`Loaded ${salesData.length} records from CSV into memory`);
      resolve(salesData);
    } catch (error) {
      console.error('Error loading CSV data:', error);
      reject(error);
    } finally {
      loadingPromise = null;
    }
  });
  
  return loadingPromise;
}

// Get all sales data
export async function getAllSalesData() {
  await loadSalesData();
  return salesData;
}

// Filter data based on criteria
export function filterData(data, filters, searchTerm) {
  return data.filter(item => {
    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.trim().toLowerCase();
      const customerName = (item['Customer Name'] || '').toLowerCase();
      const phoneNumber = (item['Phone Number'] || '').toLowerCase();
      if (!customerName.includes(searchLower) && !phoneNumber.includes(searchLower)) {
        return false;
      }
    }
    
    // Region filter
    if (filters.regions && filters.regions.length > 0) {
      if (!filters.regions.includes(item['Customer Region'])) {
        return false;
      }
    }
    
    // Gender filter
    if (filters.genders && filters.genders.length > 0) {
      if (!filters.genders.includes(item['Gender'])) {
        return false;
      }
    }
    
    // Age range filter
    if (filters.ageRange) {
      const age = parseInt(item['Age']) || 0;
      if (filters.ageRange.min !== undefined && filters.ageRange.min !== '' && age < parseInt(filters.ageRange.min)) {
        return false;
      }
      if (filters.ageRange.max !== undefined && filters.ageRange.max !== '' && age > parseInt(filters.ageRange.max)) {
        return false;
      }
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item['Product Category'])) {
        return false;
      }
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const itemTags = (item['Tags'] || '').split(',').map(t => t.trim().toLowerCase());
      const hasTag = filters.tags.some(tag => 
        itemTags.some(itemTag => itemTag.includes(tag.toLowerCase()))
      );
      if (!hasTag) {
        return false;
      }
    }
    
    // Payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      if (!filters.paymentMethods.includes(item['Payment Method'])) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const itemDate = item['Date'] ? new Date(item['Date']) : null;
      if (itemDate) {
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (itemDate < startDate) {
            return false;
          }
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) {
            return false;
          }
        }
      }
    }
    
    return true;
  });
}

// Sort data
export function sortData(data, sortBy, sortOrder) {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'date':
        aVal = a['Date'] ? new Date(a['Date']) : new Date(0);
        bVal = b['Date'] ? new Date(b['Date']) : new Date(0);
        break;
      case 'quantity':
        aVal = parseInt(a['Quantity']) || 0;
        bVal = parseInt(b['Quantity']) || 0;
        break;
      case 'customerName':
        aVal = (a['Customer Name'] || '').toLowerCase();
        bVal = (b['Customer Name'] || '').toLowerCase();
        break;
      default:
        aVal = a['Date'] ? new Date(a['Date']) : new Date(0);
        bVal = b['Date'] ? new Date(b['Date']) : new Date(0);
    }
    
    if (sortBy === 'customerName') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  
  return sorted;
}

// Get filter options from data
export async function getFilterOptions() {
  const data = await getAllSalesData();
  
  const regions = new Set();
  const genders = new Set();
  const categories = new Set();
  const paymentMethods = new Set();
  const tags = new Set();
  let minAge = Infinity;
  let maxAge = -Infinity;
  let minDate = null;
  let maxDate = null;
  
  data.forEach(item => {
    if (item['Customer Region']) regions.add(item['Customer Region']);
    if (item['Gender']) genders.add(item['Gender']);
    if (item['Product Category']) categories.add(item['Product Category']);
    if (item['Payment Method']) paymentMethods.add(item['Payment Method']);
    
    if (item['Tags']) {
      const itemTags = item['Tags'].split(',').map(t => t.trim()).filter(Boolean);
      itemTags.forEach(tag => tags.add(tag));
    }
    
    const age = parseInt(item['Age']);
    if (!isNaN(age)) {
      minAge = Math.min(minAge, age);
      maxAge = Math.max(maxAge, age);
    }
    
    if (item['Date']) {
      const date = new Date(item['Date']);
      if (!isNaN(date.getTime())) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    }
  });
  
  return {
    regions: Array.from(regions).sort(),
    genders: Array.from(genders).sort(),
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    paymentMethods: Array.from(paymentMethods).sort(),
    ageRange: {
      min: minAge === Infinity ? 0 : minAge,
      max: maxAge === -Infinity ? 100 : maxAge
    },
    dateRange: {
      min: minDate ? minDate.toISOString().split('T')[0] : '',
      max: maxDate ? maxDate.toISOString().split('T')[0] : ''
    }
  };
}


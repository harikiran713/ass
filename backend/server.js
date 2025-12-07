import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import { getSalesCollection, createIndexes } from './models/Sales.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB on server start
let isConnected = false;

async function initializeDatabase() {
  try {
    await connectDatabase();
    await createIndexes();
    isConnected = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    isConnected = false;
  }
}

initializeDatabase();

// Helper function to build MongoDB query from filters
function buildQuery(filters, searchTerm) {
  const query = {};

  // Search query (case-insensitive)
  if (searchTerm && searchTerm.trim() !== '') {
    query.$or = [
      { 'Customer Name': { $regex: searchTerm.trim(), $options: 'i' } },
      { 'Phone Number': { $regex: searchTerm.trim(), $options: 'i' } }
    ];
  }

  // Customer Region
  if (filters.regions && filters.regions.length > 0) {
    query['Customer Region'] = { $in: filters.regions };
  }

  // Gender
  if (filters.genders && filters.genders.length > 0) {
    query['Gender'] = { $in: filters.genders };
  }

  // Age Range
  if (filters.ageRange) {
    query['Age'] = {};
    if (filters.ageRange.min !== undefined && filters.ageRange.min !== null && filters.ageRange.min !== '') {
      query['Age'].$gte = parseInt(filters.ageRange.min);
    }
    if (filters.ageRange.max !== undefined && filters.ageRange.max !== null && filters.ageRange.max !== '') {
      query['Age'].$lte = parseInt(filters.ageRange.max);
    }
    if (Object.keys(query['Age']).length === 0) {
      delete query['Age'];
    }
  }

  // Product Category
  if (filters.categories && filters.categories.length > 0) {
    query['Product Category'] = { $in: filters.categories };
  }

  // Tags - handle comma-separated tags
  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(tag => ({
      Tags: { $regex: tag, $options: 'i' }
    }));
    
    // If we have search, combine with $and
    if (query.$or && query.$or.length > 0) {
      query.$and = [
        { $or: query.$or },
        { $or: tagConditions }
      ];
      delete query.$or;
    } else {
      query.$or = tagConditions;
    }
  }

  // Payment Method
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query['Payment Method'] = { $in: filters.paymentMethods };
  }

  // Date Range
  if (filters.dateRange) {
    query['Date'] = {};
    if (filters.dateRange.start) {
      query['Date'].$gte = new Date(filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      query['Date'].$lte = endDate;
    }
    if (Object.keys(query['Date']).length === 0) {
      delete query['Date'];
    }
  }

  return query;
}

// Helper function to build sort object
function buildSort(sortBy, sortOrder) {
  const sort = {};
  
  switch (sortBy) {
    case 'date':
      sort['Date'] = sortOrder === 'desc' ? -1 : 1;
      break;
    case 'quantity':
      sort['Quantity'] = sortOrder === 'asc' ? 1 : -1;
      break;
    case 'customerName':
      sort['Customer Name'] = sortOrder === 'asc' ? 1 : -1;
      break;
    default:
      sort['Date'] = -1;
  }
  
  return sort;
}

// API endpoint to get sales data with search, filter, sort, and pagination
app.get('/api/sales', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      search = '',
      page = 1,
      pageSize = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateStart,
      dateEnd
    } = req.query;

    // Build filters object
    const filters = {};
    if (regions) filters.regions = Array.isArray(regions) ? regions : [regions];
    if (genders) filters.genders = Array.isArray(genders) ? genders : [genders];
    if (ageMin || ageMax) {
      filters.ageRange = {};
      if (ageMin && ageMin !== '' && !isNaN(parseInt(ageMin))) {
        filters.ageRange.min = parseInt(ageMin);
      }
      if (ageMax && ageMax !== '' && !isNaN(parseInt(ageMax))) {
        filters.ageRange.max = parseInt(ageMax);
      }
    }
    if (categories) filters.categories = Array.isArray(categories) ? categories : [categories];
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (paymentMethods) filters.paymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods];
    if (dateStart || dateEnd) {
      filters.dateRange = {};
      if (dateStart) filters.dateRange.start = dateStart;
      if (dateEnd) filters.dateRange.end = dateEnd;
    }

    const collection = await getSalesCollection();
    
    // Build MongoDB query
    const query = buildQuery(filters, search);
    const sort = buildSort(sortBy, sortOrder);

    // Calculate pagination
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const skip = (pageNum - 1) * size;

    // Get total count for pagination
    const totalItems = await collection.countDocuments(query);

    // Fetch paginated data
    const data = await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray();

    // Return response
    res.json({
      data,
      pagination: {
        currentPage: pageNum,
        pageSize: size,
        totalItems,
        totalPages: Math.ceil(totalItems / size),
        hasNextPage: skip + size < totalItems,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// API endpoint to get filter options (for populating filter dropdowns)
app.get('/api/filters', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const collection = await getSalesCollection();

    // Get distinct values for filters
    const [regions, genders, categories, paymentMethods] = await Promise.all([
      collection.distinct('Customer Region'),
      collection.distinct('Gender'),
      collection.distinct('Product Category'),
      collection.distinct('Payment Method')
    ]);

    // Get all unique tags
    const allSales = await collection.find({}, { projection: { Tags: 1 } }).toArray();
    const allTags = new Set();
    allSales.forEach(item => {
      if (item.Tags) {
        const tags = item.Tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => allTags.add(tag));
      }
    });

    // Get age range
    const ageStats = await collection.aggregate([
      {
        $match: { Age: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          minAge: { $min: { $toInt: '$Age' } },
          maxAge: { $max: { $toInt: '$Age' } }
        }
      }
    ]).toArray();

    const ageRange = ageStats.length > 0 
      ? { min: ageStats[0].minAge, max: ageStats[0].maxAge }
      : { min: 0, max: 100 };

    // Get date range
    const dateStats = await collection.aggregate([
      {
        $match: { Date: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          minDate: { $min: '$Date' },
          maxDate: { $max: '$Date' }
        }
      }
    ]).toArray();

    const dateRange = dateStats.length > 0
      ? {
          min: new Date(dateStats[0].minDate).toISOString().split('T')[0],
          max: new Date(dateStats[0].maxDate).toISOString().split('T')[0]
        }
      : { min: null, max: null };

    res.json({
      regions: regions.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
      categories: categories.filter(Boolean).sort(),
      tags: [...allTags].sort(),
      paymentMethods: paymentMethods.filter(Boolean).sort(),
      ageRange,
      dateRange
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({ status: 'error', message: 'Database not connected' });
    }
    const collection = await getSalesCollection();
    const count = await collection.countDocuments();
    res.json({ status: 'ok', records: count });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

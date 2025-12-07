import { NextResponse } from 'next/server';
import { getSalesCollection } from '@/lib/models/Sales';
import { connectDatabase } from '@/lib/config/database';

// Initialize database connection
let isConnecting = false;
let isConnected = false;

async function ensureDatabaseConnection() {
  if (isConnected) {
    return true;
  }
  
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return isConnected;
  }
  
  isConnecting = true;
  try {
    await connectDatabase();
    isConnected = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    isConnected = false;
    return false;
  } finally {
    isConnecting = false;
  }
}

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

export async function GET(request) {
  try {
    const connected = await ensureDatabaseConnection();
    
    if (!connected) {
      return NextResponse.json(
        { 
          error: 'Database not connected',
          message: 'Please ensure MongoDB connection is working'
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Handle array parameters - getAll returns array of all values with that key
    const regions = searchParams.getAll('regions');
    const genders = searchParams.getAll('genders');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const categories = searchParams.getAll('categories');
    const tags = searchParams.getAll('tags');
    const paymentMethods = searchParams.getAll('paymentMethods');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    // Build filters object
    const filters = {};
    if (regions.length > 0) filters.regions = regions;
    if (genders.length > 0) filters.genders = genders;
    if (ageMin || ageMax) {
      filters.ageRange = {};
      if (ageMin && ageMin !== '' && !isNaN(parseInt(ageMin))) {
        filters.ageRange.min = parseInt(ageMin);
      }
      if (ageMax && ageMax !== '' && !isNaN(parseInt(ageMax))) {
        filters.ageRange.max = parseInt(ageMax);
      }
    }
    if (categories.length > 0) filters.categories = categories;
    if (tags.length > 0) filters.tags = tags;
    if (paymentMethods.length > 0) filters.paymentMethods = paymentMethods;
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

    // Calculate statistics for filtered data
    const stats = await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: { $toInt: '$Quantity' } },
          totalAmount: { $sum: { $toDouble: '$Final Amount' } },
          totalAmountBeforeDiscount: { $sum: { $toDouble: '$Total Amount' } }
        }
      }
    ]).toArray();

    const statistics = stats.length > 0 ? {
      totalUnits: stats[0].totalUnits || 0,
      totalAmount: stats[0].totalAmount || 0,
      totalDiscount: (stats[0].totalAmountBeforeDiscount || 0) - (stats[0].totalAmount || 0)
    } : {
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0
    };

    // Return response
    return NextResponse.json({
      data,
      pagination: {
        currentPage: pageNum,
        pageSize: size,
        totalItems,
        totalPages: Math.ceil(totalItems / size),
        hasNextPage: skip + size < totalItems,
        hasPreviousPage: pageNum > 1
      },
      statistics: {
        ...statistics,
        totalRecords: totalItems
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

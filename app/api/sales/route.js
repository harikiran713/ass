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
      const ageRange = {};
      if (ageMin && ageMin !== '' && !isNaN(parseInt(ageMin))) {
        ageRange.min = parseInt(ageMin);
      }
      if (ageMax && ageMax !== '' && !isNaN(parseInt(ageMax))) {
        ageRange.max = parseInt(ageMax);
      }
      // Only add ageRange if it has at least one value
      if (Object.keys(ageRange).length > 0) {
        filters.ageRange = ageRange;
      }
    }
    if (categories.length > 0) filters.categories = categories;
    if (tags.length > 0) filters.tags = tags;
    if (paymentMethods.length > 0) filters.paymentMethods = paymentMethods;
    if (dateStart || dateEnd) {
      const dateRange = {};
      if (dateStart && dateStart.trim() !== '') {
        dateRange.start = dateStart;
      }
      if (dateEnd && dateEnd.trim() !== '') {
        dateRange.end = dateEnd;
      }
      // Only add dateRange if it has at least one value
      if (Object.keys(dateRange).length > 0) {
        filters.dateRange = dateRange;
      }
    }

    const collection = await getSalesCollection();
    
    // Build MongoDB query
    const query = buildQuery(filters, search);
    const sort = buildSort(sortBy, sortOrder);

    // Log query for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const skip = (pageNum - 1) * size;

    // Get total count for pagination
    let totalItems = 0;
    try {
      totalItems = await collection.countDocuments(query);
    } catch (countError) {
      console.error('Error counting documents:', countError);
      throw new Error(`Failed to count documents: ${countError.message}`);
    }

    // Fetch paginated data
    let data = [];
    try {
      data = await collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(size)
        .toArray();
    } catch (findError) {
      console.error('Error fetching data:', findError);
      throw new Error(`Failed to fetch data: ${findError.message}`);
    }

    // Calculate statistics for ALL filtered data (not just current page)
    let statistics = {
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0
    };

    try {
      // Use aggregation with safe type conversion
      const statsPipeline = [
        { $match: query },
        {
          $project: {
            quantity: {
              $cond: [
                { $eq: [{ $type: '$Quantity' }, 'number'] },
                '$Quantity',
                { $toInt: { $ifNull: ['$Quantity', 0] } }
              ]
            },
            finalAmount: {
              $cond: [
                { $eq: [{ $type: '$Final Amount' }, 'number'] },
                '$Final Amount',
                { $toDouble: { $ifNull: ['$Final Amount', 0] } }
              ]
            },
            totalAmount: {
              $cond: [
                { $eq: [{ $type: '$Total Amount' }, 'number'] },
                '$Total Amount',
                { $toDouble: { $ifNull: ['$Total Amount', 0] } }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$quantity' },
            totalAmount: { $sum: '$finalAmount' },
            totalAmountBeforeDiscount: { $sum: '$totalAmount' }
          }
        }
      ];

      const stats = await collection.aggregate(statsPipeline).toArray();

      if (stats.length > 0 && stats[0]) {
        const totalBeforeDiscount = stats[0].totalAmountBeforeDiscount || 0;
        const totalAfterDiscount = stats[0].totalAmount || 0;
        statistics = {
          totalUnits: stats[0].totalUnits || 0,
          totalAmount: totalAfterDiscount,
          totalDiscount: Math.max(0, totalBeforeDiscount - totalAfterDiscount)
        };
      }
    } catch (statsError) {
      console.error('Error calculating statistics:', statsError);
      console.error('Stats error details:', statsError.message);
      // Continue without statistics if aggregation fails - don't break the request
    }

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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

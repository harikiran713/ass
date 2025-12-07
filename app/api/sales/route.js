import { NextResponse } from 'next/server';
import { getAllSalesData, filterData, sortData } from '@/lib/data/csvLoader';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Handle array parameters
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

    // Get all data
    const allData = await getAllSalesData();
    
    // Filter data
    const filteredData = filterData(allData, filters, search);
    
    // Sort data
    const sortedData = sortData(filteredData, sortBy, sortOrder);
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const skip = (pageNum - 1) * size;
    const totalItems = sortedData.length;
    
    // Get paginated data
    const data = sortedData.slice(skip, skip + size);

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

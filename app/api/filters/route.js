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

export async function GET() {
  try {
    const connected = await ensureDatabaseConnection();
    
    if (!connected) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

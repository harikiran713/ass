import { NextResponse } from 'next/server';
import { getFilterOptions } from '@/lib/data/csvLoader';

export async function GET() {
  try {
    const filterOptions = await getFilterOptions();
    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error('Error getting filter options:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

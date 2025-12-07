import { NextResponse } from 'next/server';
import { getAllSalesData } from '@/lib/data/csvLoader';

export async function GET() {
  try {
    const data = await getAllSalesData();
    return NextResponse.json({ 
      status: 'ok', 
      records: data.length,
      source: 'CSV file'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

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
        { status: 'error', message: 'Database not connected' },
        { status: 503 }
      );
    }

    const collection = await getSalesCollection();
    const count = await collection.countDocuments();
    
    return NextResponse.json({ 
      status: 'ok', 
      records: count,
      source: 'MongoDB'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

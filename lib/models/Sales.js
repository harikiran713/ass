import { getDatabase } from '../config/database.js';

const COLLECTION_NAME = 'sales';

export async function getSalesCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION_NAME);
}

// Create indexes for better query performance
export async function createIndexes() {
  try {
    const collection = await getSalesCollection();
    
    // Create indexes for commonly queried fields
    await collection.createIndex({ 'Customer Name': 'text', 'Phone Number': 'text' });
    await collection.createIndex({ 'Customer Region': 1 });
    await collection.createIndex({ 'Gender': 1 });
    await collection.createIndex({ 'Age': 1 });
    await collection.createIndex({ 'Product Category': 1 });
    await collection.createIndex({ 'Payment Method': 1 });
    await collection.createIndex({ 'Date': -1 });
    await collection.createIndex({ 'Quantity': 1 });
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}


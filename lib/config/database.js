import { MongoClient } from 'mongodb';

// MongoDB connection string (hardcoded as requested)
const MONGODB_URI = 'mongodb+srv://harikiran:hari996633@iiitapp.wn142.mongodb.net/?retryWrites=true&w=majority&appName=iiitapp';
const DB_NAME = 'truestate_sales';

let client = null;
let db = null;

export async function connectDatabase() {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB: ${DB_NAME}`);
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getDatabase() {
  if (!db) {
    await connectDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

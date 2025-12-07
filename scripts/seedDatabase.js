import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { connectDatabase } from '../lib/config/database.js';
import { getSalesCollection, createIndexes } from '../lib/models/Sales.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    await createIndexes();
    
    const collection = await getSalesCollection();
    const dataFilePath = path.join(__dirname, '..', 'data', 'sales_data.csv');

    if (!fs.existsSync(dataFilePath)) {
      console.error(`Data file not found at ${dataFilePath}`);
      console.error('Please ensure sales_data.csv is in the data/ folder');
      process.exit(1);
    }

    console.log('Reading CSV file...');
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(dataFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Convert string numbers to actual numbers where appropriate
          const processedData = { ...data };
          
          // Convert numeric fields
          if (processedData['Age']) {
            processedData['Age'] = parseInt(processedData['Age']) || 0;
          }
          if (processedData['Quantity']) {
            processedData['Quantity'] = parseInt(processedData['Quantity']) || 0;
          }
          if (processedData['Price per Unit']) {
            processedData['Price per Unit'] = parseFloat(processedData['Price per Unit']) || 0;
          }
          if (processedData['Discount Percentage']) {
            processedData['Discount Percentage'] = parseFloat(processedData['Discount Percentage']) || 0;
          }
          if (processedData['Total Amount']) {
            processedData['Total Amount'] = parseFloat(processedData['Total Amount']) || 0;
          }
          if (processedData['Final Amount']) {
            processedData['Final Amount'] = parseFloat(processedData['Final Amount']) || 0;
          }
          
          // Convert date string to Date object
          if (processedData['Date']) {
            const date = new Date(processedData['Date']);
            processedData['Date'] = isNaN(date.getTime()) ? null : date;
          }

          results.push(processedData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${results.length} records from CSV`);

    // Clear existing data (optional - comment out if you want to append)
    console.log('Clearing existing data...');
    await collection.deleteMany({});

    // Insert data in batches for better performance
    console.log('Inserting data into MongoDB...');
    const batchSize = 1000;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      await collection.insertMany(batch);
      console.log(`Inserted ${Math.min(i + batchSize, results.length)} / ${results.length} records`);
    }

    console.log(`Successfully seeded ${results.length} records into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


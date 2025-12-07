# Quick Setup Guide - Next.js Version

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Environment Variables
A `.env` file has been created with default values:
```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=truestate_sales
PORT=3000
```

**If using MongoDB Atlas (cloud):**
1. Get your connection string from MongoDB Atlas
2. Update `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=truestate_sales
```

## Step 3: Ensure MongoDB is Running

**Local MongoDB:**
- Make sure MongoDB service is running
- On Windows: Check Services or run `mongod` in terminal

**MongoDB Atlas:**
- Your connection string should work if you've set it up correctly

## Step 4: Seed the Database
```bash
npm run seed
```

This will:
- Read the CSV file from `data/sales_data.csv`
- Import all records into MongoDB
- Create necessary indexes

**Expected output:**
```
Connecting to database...
Reading CSV file...
Loaded X records from CSV
Clearing existing data...
Inserting data into MongoDB...
Successfully seeded X records into MongoDB!
```

## Step 5: Start the Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## Troubleshooting

### "Database not connected" Error
1. Check if MongoDB is running
2. Verify `.env` file has correct `MONGODB_URI`
3. For local MongoDB, ensure it's running on port 27017
4. For Atlas, verify your connection string is correct

### "No sales records found" or Empty Filters
- Run the seed script: `npm run seed`
- Verify the CSV file exists at `data/sales_data.csv`
- Check MongoDB to see if data was imported

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

## Verify Setup

1. **Check Database Connection:**
   Visit: `http://localhost:3000/api/health`
   Should return: `{"status":"ok","records":X}`

2. **Check Filters:**
   Visit: `http://localhost:3000/api/filters`
   Should return filter options (regions, genders, etc.)

3. **Check Sales Data:**
   Visit: `http://localhost:3000/api/sales`
   Should return paginated sales data


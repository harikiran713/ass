# Setup Checklist - TruEstate Sales Management System

Follow these steps in order to get your system running:

## ✅ Step 1: Install MongoDB

**Option A - Local MongoDB:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install it on your system
3. Start MongoDB service (usually starts automatically on Windows)

**Option B - MongoDB Atlas (Cloud - Recommended for beginners):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## ✅ Step 2: Create Environment File

Create a file named `.env` in the `backend/` directory with this content:

```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=truestate_sales
PORT=5000
```

**If using MongoDB Atlas, replace MONGODB_URI with your Atlas connection string:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=truestate_sales
PORT=5000
```

## ✅ Step 3: Install Dependencies

Open terminal/command prompt and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## ✅ Step 4: Download and Place CSV File

1. Download the dataset from: https://drive.google.com/file/d/1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb/view?usp=sharing
2. Place the downloaded file as `sales_data.csv` in the `backend/data/` directory
3. Make sure the file is named exactly `sales_data.csv`

## ✅ Step 5: Seed the Database

Run the seeding script to import CSV data into MongoDB:

```bash
cd backend
npm run seed
```

You should see output like:
```
Connecting to database...
Reading CSV file...
Loaded X records from CSV
Clearing existing data...
Inserting data into MongoDB...
Successfully seeded X records into MongoDB!
```

## ✅ Step 6: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

You should see:
```
Connected to MongoDB: truestate_sales
MongoDB indexes created successfully
Database initialized successfully
Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

## ✅ Step 7: Open the Application

Open your browser and go to: **http://localhost:5173**

You should see the TruEstate Sales Management System with:
- Search bar
- Filter panel on the left
- Sales table in the center
- Pagination controls at the bottom

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Local MongoDB**: Make sure MongoDB service is running
- **MongoDB Atlas**: Check your connection string and network access settings
- Verify `.env` file has correct MONGODB_URI

### CSV File Not Found
- Make sure `sales_data.csv` is in `backend/data/` directory
- Check the file name is exactly `sales_data.csv` (case-sensitive)

### Port Already in Use
- Backend: Change `PORT=5000` to another port (e.g., `PORT=5001`) in `.env`
- Frontend: Vite will automatically use the next available port

### Database Not Connected
- Check MongoDB is running
- Verify connection string in `.env`
- Check firewall/network settings for MongoDB Atlas

## 📝 Quick Commands Reference

```bash
# Seed database (after placing CSV file)
cd backend && npm run seed

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Development mode (auto-reload)
cd backend && npm run dev
```

## ✨ You're All Set!

Once both servers are running, you can:
- Search for customers by name or phone
- Apply multiple filters
- Sort by date, quantity, or customer name
- Navigate through pages
- All data is stored in MongoDB!

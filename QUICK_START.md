# Quick Start Guide 🚀

## Step 1: Get Google Gemini API Key (Required)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Open `backend/.env` file
6. Replace `your_gemini_api_key_here` with your actual API key

Example:
```env
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

## Step 2: Install MongoDB (if not installed)

### Option A: Local MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017/careerflow`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env` with your connection string

Example:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerflow
```

## Step 3: Start the Backend Server

Open Terminal 1:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server is running on http://localhost:5000
```

## Step 4: Start the Frontend

Open Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 5: Open in Browser

Visit: http://localhost:3000

## Testing the Features

### Test Career Navigator:
1. Click "Career Navigator" in the navbar
2. Enter target role: "Full Stack Developer"
3. Add current skills: "JavaScript, React, Node.js"
4. Click "Generate AI Skills Roadmap"
5. View your personalized roadmap with spider chart!

### Test Resume Scorer:
1. Click "Resume Scorer" in the navbar
2. Enter target role: "Full Stack Developer"
3. Upload a PDF resume (create a sample if needed)
4. Click "Generate AI Skills Data"
5. View detailed analysis with scores and recommendations!

## Common Issues

### Issue: MongoDB connection error
**Solution:** Make sure MongoDB is running locally or update the connection string

### Issue: Gemini API error
**Solution:** Verify your API key is correct in `backend/.env`

### Issue: Port already in use
**Solution:** 
- Backend: Change PORT in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

## Need Help?

Check the main README.md for detailed documentation!

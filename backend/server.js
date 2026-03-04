import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import careerRoutes from './routes/careerRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stressRoutes from './routes/stressRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('❌ MongoDB initial connection failed:', err.message);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/stress', stressRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CareerFlow AI Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

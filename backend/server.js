import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import connectDB from './config/database.js';
import configurePassport from './config/passport.js';
import careerRoutes from './routes/careerRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stressRoutes from './routes/stressRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import { warmupStressModel } from './services/stressMlService.js';
import { warmupPlacementModel } from './services/placementMlService.js';

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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/placement', placementRoutes);

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
  if (process.env.STRESS_MODEL_WARMUP === 'true') {
    setImmediate(() => warmupStressModel());
  }
  setImmediate(() => warmupPlacementModel());
});

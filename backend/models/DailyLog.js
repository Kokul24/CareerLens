import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'mock-user-001',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  Study_Hours_Per_Day: {
    type: Number,
    required: [true, 'Study hours is required'],
    min: 0,
    max: 24,
  },
  Extracurricular_Hours_Per_Day: {
    type: Number,
    required: [true, 'Extracurricular hours is required'],
    min: 0,
    max: 24,
  },
  Sleep_Hours_Per_Day: {
    type: Number,
    required: [true, 'Sleep hours is required'],
    min: 0,
    max: 24,
  },
  Social_Hours_Per_Day: {
    type: Number,
    required: [true, 'Social hours is required'],
    min: 0,
    max: 24,
  },
  Physical_Activity_Hours_Per_Day: {
    type: Number,
    required: [true, 'Physical activity hours is required'],
    min: 0,
    max: 24,
  },
  predictedStressLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
  },
  suggestions: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('DailyLog', dailyLogSchema);

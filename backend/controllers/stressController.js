import DailyLog from '../models/DailyLog.js';
import { predictStress } from '../services/stressMlService.js';

const FEATURE_KEYS = [
  'Study_Hours_Per_Day',
  'Extracurricular_Hours_Per_Day',
  'Sleep_Hours_Per_Day',
  'Social_Hours_Per_Day',
  'Physical_Activity_Hours_Per_Day',
];

// ─── Helper: extract feature array from body ───
function extractFeatures(body) {
  return FEATURE_KEYS.map((k) => {
    const val = parseFloat(body[k]);
    if (isNaN(val)) throw new Error(`Invalid or missing value for ${k}`);
    return val;
  });
}

// ─── CREATE  POST /api/stress/log ───
export const createLog = async (req, res) => {
  try {
    const features = extractFeatures(req.body);
    const { predictedStressLevel, suggestions } = await predictStress(features);

    const log = await DailyLog.create({
      ...Object.fromEntries(FEATURE_KEYS.map((k, i) => [k, features[i]])),
      predictedStressLevel,
      suggestions,
      userId: req.body.userId || 'mock-user-001',
      date: req.body.date || Date.now(),
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Create log error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ALL  GET /api/stress/logs ───
export const getLogs = async (req, res) => {
  try {
    const userId = req.query.userId || 'mock-user-001';
    const logs = await DailyLog.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Get logs error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE  GET /api/stress/log/:id ───
export const getLogById = async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error('Get log error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE  PUT /api/stress/log/:id ───
export const updateLog = async (req, res) => {
  try {
    const existing = await DailyLog.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Log not found' });

    const features = extractFeatures(req.body);
    const { predictedStressLevel, suggestions } = await predictStress(features);

    const updated = await DailyLog.findByIdAndUpdate(
      req.params.id,
      {
        ...Object.fromEntries(FEATURE_KEYS.map((k, i) => [k, features[i]])),
        predictedStressLevel,
        suggestions,
        date: req.body.date || existing.date,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update log error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE  DELETE /api/stress/log/:id ───
export const deleteLog = async (req, res) => {
  try {
    const log = await DailyLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error('Delete log error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SEARCH  GET /api/stress/search ───
export const searchLogs = async (req, res) => {
  try {
    const userId = req.query.userId || 'mock-user-001';
    const filter = { userId };

    if (req.query.stressLevel) {
      filter.predictedStressLevel = req.query.stressLevel;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const logs = await DailyLog.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Search logs error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

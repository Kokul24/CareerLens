import PlacementPrediction from '../models/PlacementPrediction.js';
import { predictPlacement } from '../services/placementMlService.js';

const FEATURE_KEYS = [
  'branch',
  'cgpa',
  'internship_count',
  'project_count',
  'certifications_count',
  'coding_skills_score',
  'communication_skills_score',
  'soft_skills_score',
  'hackathon_participation',
];

// ─── Helper: convert qualitative skill level to numeric score ───
function skillLevelToScore(level) {
  const ranges = {
    'Poor':      [10, 25],
    'Fair':      [26, 45],
    'Good':      [46, 65],
    'Very Good': [66, 85],
    'Excellent': [86, 100],
  };
  const range = ranges[level];
  if (!range) throw new Error(`Invalid skill level "${level}". Must be one of: Poor, Fair, Good, Very Good, Excellent`);
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Helper: extract & validate features ───
function extractFeatures(body) {
  // Convert qualitative skill levels to numeric scores when provided
  const processedBody = { ...body };
  if (processedBody.coding_skill_level !== undefined) {
    processedBody.coding_skills_score = skillLevelToScore(processedBody.coding_skill_level);
  }
  if (processedBody.communication_skill_level !== undefined) {
    processedBody.communication_skills_score = skillLevelToScore(processedBody.communication_skill_level);
  }
  if (processedBody.soft_skill_level !== undefined) {
    processedBody.soft_skills_score = skillLevelToScore(processedBody.soft_skill_level);
  }

  const payload = {};
  for (const k of FEATURE_KEYS) {
    const val = parseFloat(processedBody[k]);
    if (isNaN(val)) throw new Error(`Invalid or missing value for ${k}`);
    payload[k] = val;
  }

  // Specific validations
  if (![1, 2, 3, 4, 5, 6].includes(payload.branch)) throw new Error('Branch must be 1-6');
  if (payload.cgpa < 0 || payload.cgpa > 10) throw new Error('CGPA must be between 0 and 10');
  if (payload.coding_skills_score < 0 || payload.coding_skills_score > 100) throw new Error('Coding skills score must be 0-100');
  if (payload.communication_skills_score < 0 || payload.communication_skills_score > 100) throw new Error('Communication skills score must be 0-100');
  if (payload.soft_skills_score < 0 || payload.soft_skills_score > 100) throw new Error('Soft skills score must be 0-100');
  if (![0, 1].includes(payload.hackathon_participation)) throw new Error('Hackathon participation must be 0 or 1');
  if (payload.internship_count < 0) throw new Error('Internship count cannot be negative');
  if (payload.project_count < 0) throw new Error('Project count cannot be negative');
  if (payload.certifications_count < 0) throw new Error('Certifications count cannot be negative');

  return payload;
}

// ─── CREATE (Predict)  POST /api/placement/predict ───
export const createPrediction = async (req, res) => {
  try {
    const features = extractFeatures(req.body);
    const { placement_probability, feature_contributions, suggestions } = await predictPlacement(features);

    const prediction = await PlacementPrediction.create({
      ...features,
      placement_probability,
      feature_contributions,
      suggestions,
      userId: req.body.userId || 'mock-user-001',
    });

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ALL  GET /api/placement/predictions ───
export const getPredictions = async (req, res) => {
  try {
    const userId = req.query.userId || 'mock-user-001';
    const predictions = await PlacementPrediction.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Get predictions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE  GET /api/placement/prediction/:id ───
export const getPredictionById = async (req, res) => {
  try {
    const prediction = await PlacementPrediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Get prediction error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE  PUT /api/placement/prediction/:id ───
export const updatePrediction = async (req, res) => {
  try {
    const existing = await PlacementPrediction.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Prediction not found' });

    const features = extractFeatures(req.body);
    const { placement_probability, feature_contributions, suggestions } = await predictPlacement(features);

    const updated = await PlacementPrediction.findByIdAndUpdate(
      req.params.id,
      {
        ...features,
        placement_probability,
        feature_contributions,
        suggestions,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update prediction error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE  DELETE /api/placement/prediction/:id ───
export const deletePrediction = async (req, res) => {
  try {
    const prediction = await PlacementPrediction.findByIdAndDelete(req.params.id);
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error('Delete prediction error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SEARCH  GET /api/placement/search ───
export const searchPredictions = async (req, res) => {
  try {
    const userId = req.query.userId || 'mock-user-001';
    const filter = { userId };

    if (req.query.branch) {
      filter.branch = parseInt(req.query.branch);
    }

    if (req.query.minCgpa || req.query.maxCgpa) {
      filter.cgpa = {};
      if (req.query.minCgpa) filter.cgpa.$gte = parseFloat(req.query.minCgpa);
      if (req.query.maxCgpa) filter.cgpa.$lte = parseFloat(req.query.maxCgpa);
    }

    if (req.query.minProbability || req.query.maxProbability) {
      filter.placement_probability = {};
      if (req.query.minProbability) filter.placement_probability.$gte = parseInt(req.query.minProbability);
      if (req.query.maxProbability) filter.placement_probability.$lte = parseInt(req.query.maxProbability);
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const predictions = await PlacementPrediction.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Search predictions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

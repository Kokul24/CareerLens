import mongoose from 'mongoose';

const placementPredictionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'mock-user-001',
  },
  branch: {
    type: Number,
    required: [true, 'Branch is required'],
    enum: [1, 2, 3, 4, 5, 6],
  },
  cgpa: {
    type: Number,
    required: [true, 'CGPA is required'],
    min: 0,
    max: 10,
  },
  internship_count: {
    type: Number,
    required: [true, 'Internship count is required'],
    min: 0,
  },
  project_count: {
    type: Number,
    required: [true, 'Project count is required'],
    min: 0,
  },
  certifications_count: {
    type: Number,
    required: [true, 'Certifications count is required'],
    min: 0,
  },
  coding_skills_score: {
    type: Number,
    required: [true, 'Coding skills score is required'],
    min: 0,
    max: 100,
  },
  communication_skills_score: {
    type: Number,
    required: [true, 'Communication skills score is required'],
    min: 0,
    max: 100,
  },
  soft_skills_score: {
    type: Number,
    required: [true, 'Soft skills score is required'],
    min: 0,
    max: 100,
  },
  hackathon_participation: {
    type: Number,
    required: [true, 'Hackathon participation is required'],
    enum: [0, 1],
  },
  placement_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  feature_contributions: {
    type: Array,
    default: [],
  },
  suggestions: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model('PlacementPrediction', placementPredictionSchema);

import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: false,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  analysis: {
    atsCompatibility: {
      score: Number,
      issues: [String],
    },
    contentQuality: {
      score: Number,
      feedback: [String],
    },
    keywordOptimization: {
      score: Number,
      matchedKeywords: [String],
      missingKeywords: [String],
    },
    formatting: {
      score: Number,
      feedback: [String],
    },
    experienceRelevance: {
      score: Number,
      feedback: [String],
    }
  },
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
  industryComparison: String,
  // Skills/profile text used for re-analysis
  skills: {
    type: String,
    default: '',
  },
  // Snapshot of the previous analysis (before latest update)
  previousAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

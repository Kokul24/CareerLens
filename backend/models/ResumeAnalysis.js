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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  currentSkills: [{
    name: String,
    level: Number, // 0-10
  }],
  skillsToLearn: [{
    name: String,
    priority: String, // 'Critical', 'Important', 'Optional'
    estimatedTime: String,
    marketDemand: Number, // 0-10
    salaryImpact: String,
    resources: [{
      title: String,
      provider: String,
      url: String,
      level: String,
      duration: String,
      price: String, // 'Free' or 'Paid'
    }]
  }],
  overallProgress: {
    type: Number,
    default: 0,
  },
  completedSkills: {
    type: [Boolean],
    default: [false, false, false, false, false, false],
  },
  estimatedCompletionTime: String,
  salaryBoost: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Roadmap', roadmapSchema);

import { getGeminiModel } from '../config/gemini.js';
import Roadmap from '../models/Roadmap.js';

// Get All Roadmaps (READ ALL) - user-specific
export const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: roadmaps
    });

  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roadmaps',
      error: error.message
    });
  }
};

// Get Single Roadmap by ID (READ ONE) - user-specific
export const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roadmap',
      error: error.message
    });
  }
};

// Update Roadmap (UPDATE) - user-specific
export const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      message: 'Roadmap updated successfully',
      data: roadmap
    });

  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update roadmap',
      error: error.message
    });
  }
};

// Delete Roadmap (DELETE) - user-specific
export const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      message: 'Roadmap deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete roadmap',
      error: error.message
    });
  }
};

// Generate AI Skills Roadmap
export const generateRoadmap = async (req, res) => {
  try {
    const { targetRole, currentSkills, experienceLevel } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    const model = getGeminiModel();

    // Create detailed prompt for Gemini
    const prompt = `You are a specialized career advisor AI for college students preparing for campus placements. Generate a comprehensive skills roadmap for a student targeting the role: "${targetRole}".

Current skills: ${currentSkills?.join(', ') || 'None specified'}
Experience level: ${experienceLevel || 'Fresher/Entry-Level'}

Please provide a detailed JSON response with the following structure:
{
  "skillsToLearn": [
    {
      "name": "Skill name",
      "priority": "Critical/Important/Optional",
      "currentDemand": 8,
      "estimatedTime": "3-6 months",
      "salaryImpact": "+₹3L",
      "description": "Why this skill matters for placements"
    }
  ],
  "currentSkillsAssessment": [
    {
      "name": "Skill name",
      "level": 7,
      "marketDemand": 9
    }
  ],
  "estimatedCompletionTime": "6 months",
  "salaryBoost": "+₹3-5 LPA",
  "careerPath": "Brief description of the career path for a fresher"
}

Focus on CURRENT placement trends (2025-2026), key technologies asked in interview rounds, and foundational skills (DSA, System Design Basics) required for freshers. Include 15 trending skills and 5 foundational skills. Be specific with time estimates and salary impacts in Indian Rupees (₹ LPA).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Parse JSON from response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const aiData = JSON.parse(text);

    // Save to database with user ID
    const roadmap = new Roadmap({
      userId: req.user._id,
      targetRole,
      currentSkills: aiData.currentSkillsAssessment || [],
      skillsToLearn: aiData.skillsToLearn || [],
      estimatedCompletionTime: aiData.estimatedCompletionTime,
      salaryBoost: aiData.salaryBoost,
      overallProgress: 0,
    });

    await roadmap.save();

    res.json({
      success: true,
      data: {
        roadmapId: roadmap._id,
        ...aiData
      }
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roadmap',
      error: error.message
    });
  }
};

// Get Learning Resources for a Skill
export const getLearningResources = async (req, res) => {
  try {
    const { skillName } = req.params;

    const model = getGeminiModel();

    const prompt = `Generate a curated list of learning resources for the skill: "${skillName}".

Provide a JSON response with this structure:
{
  "resources": [
    {
      "title": "Course name",
      "provider": "Platform name (Udemy, Coursera, YouTube, etc.)",
      "level": "Beginner/Intermediate/Advanced",
      "duration": "40 hours",
      "price": "Free/Paid",
      "description": "Brief description",
      "url": "https://example.com"
    }
  ]
}

Include at least 6 resources from various platforms (Udemy, Coursera, freeCodeCamp, YouTube channels, Official Docs).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const aiData = JSON.parse(text);

    res.json({
      success: true,
      data: aiData
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

// Get Career Path Analysis
export const getCareerPath = async (req, res) => {
  try {
    const { currentRole, targetRole, yearsOfExperience } = req.body;

    const model = getGeminiModel();

    const prompt = `Analyze the career transition path from "${currentRole}" to "${targetRole}" with ${yearsOfExperience} years of experience.

Provide a JSON response:
{
  "feasibility": "High/Medium/Low",
  "timeframe": "12-18 months",
  "keySteps": ["Step 1", "Step 2", "Step 3"],
  "skillGaps": ["Gap 1", "Gap 2"],
  "averageSalaryRange": "₹15L - ₹25L",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const aiData = JSON.parse(text);

    res.json({
      success: true,
      data: aiData
    });

  } catch (error) {
    console.error('Error analyzing career path:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze career path',
      error: error.message
    });
  }
};

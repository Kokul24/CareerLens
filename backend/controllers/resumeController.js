import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { getGeminiModel } from '../config/gemini.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Analyze Resume
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      });
    }

    const { targetRole, jobDescription } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    // Parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // Delete uploaded file after parsing
    fs.unlinkSync(req.file.path);

    const model = getGeminiModel();

    // Create detailed prompt for Gemini
    const prompt = `You are an expert Campus Placement Recruiter and ATS reviewer. Analyze this college student's resume for the entry-level role: "${targetRole}".

Resume Content:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overallScore": 75,
  "atsCompatibility": {
    "score": 85,
    "issues": ["Issue 1", "Issue 2"]
  },
  "contentQuality": {
    "score": 70,
    "feedback": ["Feedback 1", "Feedback 2"]
  },
  "keywordOptimization": {
    "score": 60,
    "matchedKeywords": ["Java", "DSA", "SQL"],
    "missingKeywords": ["System Design Basics", "Git", "Project Keywords"]
  },
  "formatting": {
    "score": 90,
    "feedback": ["Feedback on layout", "Font readability"]
  },
  "experienceRelevance": {
    "score": 65,
    "feedback": ["Feedback on Internships/Projects"]
  },
  "strengths": [
    "Strong academic project in MERN stack",
    "Good understanding of Data Structures & Algorithms",
    " Internship experience at XYZ Corp"
  ],
  "areasForImprovement": [
    "Lack of deployed project links (GitHub/Live Demo)",
    "Vague project descriptions without tech stack details",
    "Missing coding profile links (LeetCode/CodeChef)"
  ],
  "recommendations": [
    "Add GitHub links to all projects",
    "Mention specific technologies used in projects",
    "Include LeetCode/CodeChef ratings"
  ],
  "industryComparison": "This resume is [Above Average/Average/Below Average] for a campus placement candidate. Top candidates typically have 2+ good projects and 1 internship."
}

Score out of 100.
Critical Focus Areas for Students:
1. PROJECTS (Complexity & Tech Stack)
2. INTERNSHIPS (Real-world experience)
3. SKILLS (relevance to ${targetRole})
4. CODING PROFILES (DSA proficiency)
5. FORMATTING (Professional one-page layout)

Be strict but constructive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Parse JSON from response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const aiData = JSON.parse(text);

    // Save to database with user ID
    const analysis = new ResumeAnalysis({
      userId: req.user._id,
      fileName: req.file.originalname,
      targetRole,
      jobDescription: jobDescription || '',
      overallScore: aiData.overallScore,
      analysis: {
        atsCompatibility: aiData.atsCompatibility,
        contentQuality: aiData.contentQuality,
        keywordOptimization: aiData.keywordOptimization,
        formatting: aiData.formatting,
        experienceRelevance: aiData.experienceRelevance
      },
      strengths: aiData.strengths,
      areasForImprovement: aiData.areasForImprovement,
      recommendations: aiData.recommendations,
      industryComparison: aiData.industryComparison
    });

    await analysis.save();

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        ...aiData
      }
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
};

// Get Resume Analysis History (for current user only)
export const getResumeHistory = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume history',
      error: error.message
    });
  }
};

// Get Single Resume Analysis by ID (READ) - user-specific
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await ResumeAnalysis.findOne({ _id: id, userId: req.user._id });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error fetching resume analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume analysis',
      error: error.message
    });
  }
};

// Update Resume Analysis (UPDATE) - user-specific
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume analysis updated successfully',
      data: analysis
    });

  } catch (error) {
    console.error('Error updating resume analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume analysis',
      error: error.message
    });
  }
};

// Delete Resume Analysis (DELETE) - user-specific
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await ResumeAnalysis.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume analysis deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error('Error deleting resume analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume analysis',
      error: error.message
    });
  }
};

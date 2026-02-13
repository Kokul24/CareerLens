import express from 'express';
import { 
  generateRoadmap, 
  getLearningResources, 
  getCareerPath,
  getAllRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap
} from '../controllers/careerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// POST /api/career/roadmap - Generate skills roadmap (CREATE)
router.post('/roadmap', generateRoadmap);

// GET /api/career/roadmaps - Get all roadmaps (READ ALL)
router.get('/roadmaps', getAllRoadmaps);

// GET /api/career/roadmap/:id - Get single roadmap (READ ONE)
router.get('/roadmap/:id', getRoadmapById);

// PUT /api/career/roadmap/:id - Update roadmap (UPDATE)
router.put('/roadmap/:id', updateRoadmap);

// DELETE /api/career/roadmap/:id - Delete roadmap (DELETE)
router.delete('/roadmap/:id', deleteRoadmap);

// GET /api/career/resources/:skillName - Get learning resources for a skill
router.get('/resources/:skillName', getLearningResources);

// POST /api/career/path - Analyze career path
router.post('/path', getCareerPath);

export default router;

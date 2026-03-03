import express from 'express';
import { 
  analyzeResume, 
  upload,
  getResumeHistory,
  getResumeById,
  updateResume,
  deleteResume,
  reanalyzeResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// POST /api/resume/analyze - Upload and analyze resume (CREATE)
router.post('/analyze', upload.single('resume'), analyzeResume);

// GET /api/resume/history - Get resume analysis history (READ ALL)
router.get('/history', getResumeHistory);

// GET /api/resume/:id - Get single resume analysis (READ ONE)
router.get('/:id', getResumeById);

// POST /api/resume/:id/reanalyze - Re-analyze resume with new skills (UPDATE via AI)
router.post('/:id/reanalyze', reanalyzeResume);

// PUT /api/resume/:id - Update resume analysis (UPDATE)
router.put('/:id', updateResume);

// DELETE /api/resume/:id - Delete resume analysis (DELETE)
router.delete('/:id', deleteResume);

export default router;

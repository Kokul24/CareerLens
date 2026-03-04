import express from 'express';
import {
  createLog,
  getLogs,
  getLogById,
  updateLog,
  deleteLog,
  searchLogs,
} from '../controllers/stressController.js';

const router = express.Router();

// POST   /api/stress/log      → Create a new daily log
router.post('/log', createLog);

// GET    /api/stress/logs      → Fetch all logs (sorted by date)
router.get('/logs', getLogs);

// GET    /api/stress/search    → Search/filter logs
router.get('/search', searchLogs);

// GET    /api/stress/log/:id   → Fetch single log
router.get('/log/:id', getLogById);

// PUT    /api/stress/log/:id   → Update a log (re-predicts stress)
router.put('/log/:id', updateLog);

// DELETE /api/stress/log/:id   → Delete a log
router.delete('/log/:id', deleteLog);

export default router;

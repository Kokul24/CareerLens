import express from 'express';
import {
  createPrediction,
  getPredictions,
  getPredictionById,
  updatePrediction,
  deletePrediction,
  searchPredictions,
} from '../controllers/placementController.js';

const router = express.Router();

// POST   /api/placement/predict          → Create prediction
router.post('/predict', createPrediction);

// GET    /api/placement/predictions       → Fetch all predictions
router.get('/predictions', getPredictions);

// GET    /api/placement/search            → Search/filter predictions
router.get('/search', searchPredictions);

// GET    /api/placement/prediction/:id    → Fetch single prediction
router.get('/prediction/:id', getPredictionById);

// PUT    /api/placement/prediction/:id    → Update a prediction (re-predicts)
router.put('/prediction/:id', updatePrediction);

// DELETE /api/placement/prediction/:id    → Delete a prediction
router.delete('/prediction/:id', deletePrediction);

export default router;

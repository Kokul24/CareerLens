import express from 'express';
import passport from 'passport';
import { register, login, getMe, logout, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=oauth_failed',
    session: false,
  }),
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

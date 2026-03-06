import express from 'express';
import passport from 'passport';
import { register, login, getMe, logout, googleCallback, githubCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/oauth/failure', (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendURL}/oauth/callback?error=oauth_failed`);
});

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
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
  }),
  googleCallback
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false,
}));

router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
  }),
  githubCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

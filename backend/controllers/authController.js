import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const redirectOAuthSuccess = (res, user) => {
  const token = generateToken(user._id);
  const frontendURL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const userData = encodeURIComponent(JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    authProvider: user.authProvider || 'local',
  }));

  return res.redirect(`${frontendURL}/oauth/callback?token=${token}&user=${userData}`);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, college, degree, graduationYear } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (password is automatically encrypted by the model)
    const user = await User.create({
      name,
      email,
      password,
      college,
      degree,
      graduationYear
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'local',
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    return redirectOAuthSuccess(res, req.user);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendURL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    res.redirect(`${frontendURL}/oauth/callback?error=oauth_failed`);
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = async (req, res) => {
  try {
    return redirectOAuthSuccess(res, req.user);
  } catch (error) {
    console.error('GitHub callback error:', error);
    const frontendURL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    res.redirect(`${frontendURL}/oauth/callback?error=oauth_failed`);
  }
};

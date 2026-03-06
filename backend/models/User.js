import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password in queries
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // allows multiple null values
  },
  avatar: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  degree: {
    type: String,
    trim: true,
    default: ''
  },
  graduationYear: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password exists and is modified
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

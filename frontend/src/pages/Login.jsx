import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { login, clearError } from '../redux/slices/authSlice';
import { ParticleField, GlowOrbs } from '../components/AnimatedBackground';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Github } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  // Google Icon Component since it's not in Lucide
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#020617] text-white overflow-hidden font-sans">

      {/* 🏷️ LEFT SECTION — PROJECT IDENTITY */}
      <div className="w-full lg:w-[60%] relative flex flex-col justify-center items-start p-8 lg:p-20 overflow-hidden min-h-[400px] lg:min-h-screen order-1 lg:order-1">

        {/* Ambient Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e1b4b] opacity-90" />
          <GlowOrbs className="absolute inset-0 z-0 overflow-hidden opacity-60" />
          <ParticleField className="absolute inset-0 z-10 opacity-40" />

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-2xl w-full">
          {/* Project Name */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_35px_rgba(139,92,246,0.5)]">
                CareerLens
              </span>
            </h1>
          </motion.div>

          {/* Subtitle / Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <p className="text-xl lg:text-3xl text-slate-300 font-light tracking-wide">
              Navigate your career with <span className="text-cyan-400 font-medium glow-cyan">AI Precision</span>
            </p>

            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mt-2" />
          </motion.div>
        </div>
      </div>

      {/* 📦 RIGHT SECTION — LOGIN CARD */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-12 relative z-20 bg-[#020617]/50 lg:bg-transparent min-h-[600px] lg:min-h-screen order-2 lg:order-2">

        {/* Subtle background for mobile section distinction */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-transparent to-[#020617]" />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="w-full max-w-md relative z-30"
        >
          {/* Glassmorphism Card */}
          <div className="glass-card p-8 sm:p-10 shadow-2xl border border-white/10 backdrop-blur-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">

            {/* Card Background Noise Texture (Subtle) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-500" />

            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                <p className="text-slate-400">Enter your credentials to access your dashboard</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="group/input">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 group-focus-within/input:text-indigo-400 transition-colors">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 pl-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group/input">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300 group-focus-within/input:text-indigo-400 transition-colors">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3.5 pl-11 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-2 focus:ring-purple-500/30 shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group/btn"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In to Account
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                <span className="text-slate-500 text-sm font-medium">Or continue with</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2.5 px-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition-colors"
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'}
                >
                  <GoogleIcon />
                  <span className="text-sm font-medium text-slate-300">Google</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2.5 px-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition-colors"
                  type="button"
                >
                  <Github className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-slate-300">GitHub</span>
                </motion.button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-slate-400 mt-8">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline underline-offset-4">
                  Register for free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

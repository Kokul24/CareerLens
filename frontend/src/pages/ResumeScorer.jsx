import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem, CircularGauge, SkeletonCard } from '../components/UIComponents';
import { analyzeResume, clearAnalysis } from '../redux/slices/resumeSlice';
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Target,
  Sparkles,
  TrendingUp,
  Shield,
  Award,
  FileSearch,
  Lightbulb,
  X,
  BarChart3,
  Zap,
} from 'lucide-react';

const ResumeScorer = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const dispatch = useDispatch();
  const { analysis, loading, error } = useSelector((state) => state.resume);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 50);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !targetRole.trim()) return;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    dispatch(analyzeResume(formData));
  };

  const handleReset = () => {
    dispatch(clearAnalysis());
    setFile(null);
    setTargetRole('');
    setJobDescription('');
    setUploadProgress(0);
  };

  const scoreCategories = analysis
    ? [
        { key: 'atsCompatibility', label: 'ATS Compatibility', icon: Shield, color: '#6366f1' },
        { key: 'contentQuality', label: 'Content Quality', icon: Award, color: '#06b6d4' },
        { key: 'keywordOptimization', label: 'Keyword Optimization', icon: Target, color: '#a855f7' },
        { key: 'formatting', label: 'Formatting', icon: FileSearch, color: '#f59e0b' },
        { key: 'experienceRelevance', label: 'Experience Relevance', icon: TrendingUp, color: '#22c55e' },
      ]
    : [];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Resume Scorer</h1>
            </div>
            <p className="text-slate-400 ml-[52px]">AI-powered ATS analysis and scoring by Google Gemini</p>
          </motion.div>

          {/* Upload Form */}
          {!analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 sm:p-8 mb-8 max-w-3xl"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Dropzone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Resume (PDF) *</label>
                  <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : file
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {uploadProgress < 100 && (
                          <div className="w-48 h-1.5 rounded-full bg-white/[0.06] mt-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setUploadProgress(0);
                          }}
                          className="mt-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          Remove file
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-slate-500 mb-3" />
                        <p className="text-sm text-slate-400 mb-1">
                          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume or click to browse'}
                        </p>
                        <p className="text-xs text-slate-600">PDF only, max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Role *</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="input-glass"
                    placeholder="e.g., Full Stack Developer, Product Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description (optional)</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="input-glass min-h-[100px] resize-y"
                    placeholder="Paste the job description to get more accurate analysis..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || !file || !targetRole.trim()}
                  className="btn-primary w-full sm:w-auto py-3.5 px-8 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Resume
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-4"
                  />
                  <p className="text-sm text-slate-400">AI is analyzing your resume...</p>
                  <p className="text-xs text-slate-600 mt-1">This may take 10-15 seconds</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 border-red-500/20 flex items-center gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {analysis && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Reset */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    New Analysis
                  </motion.button>
                </div>

                {/* Overall Score + Category Scores */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Overall Score */}
                  <ScrollReveal>
                    <div className="glass-card p-6 flex flex-col items-center justify-center">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Overall Score</h3>
                      <CircularGauge value={analysis.overallScore || 0} color="auto" size={200} strokeWidth={12} />
                      <p className="text-sm text-slate-400 mt-4 text-center">
                        {analysis.overallScore >= 80
                          ? 'Excellent! Your resume is well-optimized.'
                          : analysis.overallScore >= 60
                          ? 'Good, but there\'s room for improvement.'
                          : analysis.overallScore >= 40
                          ? 'Needs significant improvements.'
                          : 'Major overhaul recommended.'}
                      </p>
                    </div>
                  </ScrollReveal>

                  {/* Category Scores */}
                  <ScrollReveal delay={0.1} className="lg:col-span-2">
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        Score Breakdown
                      </h3>
                      <div className="space-y-4">
                        {scoreCategories.map((cat, i) => {
                          const score = analysis[cat.key]?.score || analysis.analysis?.[cat.key]?.score || 0;
                          return (
                            <div key={cat.key}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                                  <span className="text-sm text-slate-300">{cat.label}</span>
                                </div>
                                <span className="text-sm font-semibold text-white">{score}</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 1, delay: i * 0.15 }}
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(to right, ${cat.color}, ${cat.color}88)` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Keywords Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Matched Keywords */}
                  <ScrollReveal>
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Matched Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(analysis.keywordOptimization?.matchedKeywords || analysis.analysis?.keywordOptimization?.matchedKeywords || []).map((kw, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400"
                          >
                            {kw}
                          </motion.span>
                        ))}
                        {(analysis.keywordOptimization?.matchedKeywords || analysis.analysis?.keywordOptimization?.matchedKeywords || []).length === 0 && (
                          <p className="text-sm text-slate-500">No matched keywords found</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Missing Keywords */}
                  <ScrollReveal delay={0.1}>
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(analysis.keywordOptimization?.missingKeywords || analysis.analysis?.keywordOptimization?.missingKeywords || []).map((kw, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"
                          >
                            {kw}
                          </motion.span>
                        ))}
                        {(analysis.keywordOptimization?.missingKeywords || analysis.analysis?.keywordOptimization?.missingKeywords || []).length === 0 && (
                          <p className="text-sm text-slate-500">No missing keywords — great job!</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <ScrollReveal>
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        Strengths
                      </h3>
                      <ul className="space-y-3">
                        {(analysis.strengths || []).map((s, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{s}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.1}>
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-3">
                        {(analysis.areasForImprovement || []).map((a, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2.5"
                          >
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{a}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Recommendations */}
                <ScrollReveal>
                  <div className="glass-card p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                      Personalized Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(analysis.recommendations || []).map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                          </div>
                          <span className="text-sm text-slate-300">{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Industry Comparison */}
                {analysis.industryComparison && (
                  <ScrollReveal>
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        Industry Comparison
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{analysis.industryComparison}</p>
                    </div>
                  </ScrollReveal>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResumeScorer;

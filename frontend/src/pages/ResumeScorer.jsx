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
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';

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
            <p className="text-slate-400 ml-[52px]">AI-powered ATS analysis and scoring</p>
          </motion.div>

          {/* Upload Form */}
          {!analysis && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                {/* Left Column: Upload (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 sm:p-8"
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Dropzone */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Resume (PDF) *</label>
                        <div
                          {...getRootProps()}
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
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

                  {/* Trust Signals */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: CheckCircle2, text: "Built for college placements" },
                      { icon: Shield, text: "Works for internships & entry-level" },
                      { icon: Zap, text: "AI trained on real campus resumes" }
                    ].map((badge, index) => (
                      <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                        <badge.icon className="w-3.5 h-3.5 text-indigo-400" />
                        {badge.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Preview & Mistakes (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* What You'll Learn Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Target className="w-24 h-24 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      What You'll Learn
                    </h3>
                    <div className="space-y-4 relative z-10">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10 blur-[1px] select-none">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-300">ATS Score</span>
                          <span className="text-lg font-bold text-green-400">85/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-green-500 rounded-full" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10 blur-[1px] select-none">
                        <div className="text-sm font-medium text-slate-300 mb-1">Missing Keywords</div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300">React</span>
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300">Node.js</span>
                        </div>
                      </div>
                      <p className="text-xs text-cyan-400 font-medium mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Designed for freshers & students — no experience required
                      </p>
                    </div>
                  </motion.div>

                  {/* Common Mistakes */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Common Student Mistakes</h3>
                    <div className="space-y-3">
                      {[
                        { title: "Listing subjects, not skills", fix: "Focus on tools (e.g. VS Code, Git)" },
                        { title: "No projects section", fix: "Add academic projects & labs" },
                        { title: "Generic objectives", fix: "Replace with a role-specific summary" },
                        { title: "Poor formatting", fix: "Use standard single-column layout" }
                      ].map((item, i) => (
                        <div key={i} className="group p-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all cursor-default">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.title}</span>
                            <XCircle className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
                          </div>
                          <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-2 transition-all">
                            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {item.fix}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* How This Helps Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-16"
              >
                <h3 className="text-xl font-bold text-white text-center mb-8">How it works for Students</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { number: "01", title: "Upload your resume", desc: "Upload your current college resume PDF." },
                    { number: "02", title: "AI finds gaps", desc: "Our AI identifies missing keywords & weak spots." },
                    { number: "03", title: "Get improvement tips", desc: "Receive actionable steps to boost your score." }
                  ].map((step, i) => (
                    <div key={i} className="glass-card p-6 relative group hover:border-indigo-500/30 transition-colors">
                      <div className="text-6xl font-bold text-white/[0.03] absolute top-4 right-4 group-hover:text-indigo-500/10 transition-colors">
                        {step.number}
                      </div>
                      <div className="relative z-10">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                          {i === 0 ? <Upload className="w-5 h-5" /> : i === 1 ? <FileSearch className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                        <p className="text-sm text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
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

                <ResumeAnalysisResult analysis={analysis} />
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

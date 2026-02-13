import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem, SkeletonCard } from '../components/UIComponents';
import { generateRoadmap, clearRoadmap } from '../redux/slices/careerSlice';
import {
  Compass,
  Loader2,
  Zap,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  BookOpen,
  DollarSign,
  BarChart3,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import RoadmapResult from '../components/RoadmapResult';

const CareerNavigator = () => {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const dispatch = useDispatch();
  const { roadmap, loading, error } = useSelector((state) => state.career);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    const skills = currentSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    dispatch(generateRoadmap({ targetRole, currentSkills: skills, experienceLevel }));
  };

  const handleReset = () => {
    dispatch(clearRoadmap());
    setTargetRole('');
    setCurrentSkills('');
    setExperienceLevel('Intermediate');
  };

  // Prepare radar chart data from current skills
  const radarData = roadmap?.currentSkillsAssessment
    ? roadmap.currentSkillsAssessment.slice(0, 8).map((s) => ({
      skill: s.name?.length > 12 ? s.name.slice(0, 12) + '..' : s.name,
      level: s.level || 0,
      demand: s.marketDemand || 0,
    }))
    : [];

  // Categorize skills
  const criticalSkills = roadmap?.skillsToLearn?.filter((s) => s.priority === 'Critical') || [];
  const importantSkills = roadmap?.skillsToLearn?.filter((s) => s.priority === 'Important') || [];
  const optionalSkills = roadmap?.skillsToLearn?.filter((s) => s.priority === 'Optional') || [];

  // Summary counts
  const totalSkills = roadmap?.skillsToLearn?.length || 0;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Career Navigator</h1>
            </div>
            <p className="text-slate-400 ml-[52px]">AI-powered skill roadmap generation with market analysis</p>
          </motion.div>

          {/* Input Form */}
          {!roadmap && (
            <div className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Input Form (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 sm:p-8"
                  >
                    <form onSubmit={handleGenerate} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Role *</label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="input-glass"
                          placeholder="e.g., Full Stack Developer, Data Scientist"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Skills (comma-separated)</label>
                        <input
                          type="text"
                          value={currentSkills}
                          onChange={(e) => setCurrentSkills(e.target.value)}
                          className="input-glass"
                          placeholder="e.g., JavaScript, React, Python, SQL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience Level</label>
                        <div className="flex gap-3">
                          {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                            <motion.button
                              key={level}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setExperienceLevel(level)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${experienceLevel === level
                                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                                : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white'
                                }`}
                            >
                              {level}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading || !targetRole.trim()}
                        className="btn-primary w-full sm:w-auto py-3.5 px-8 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Roadmap...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate AI Roadmap
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>

                  {/* Motivation Block */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-indigo-200">
                      <span className="font-semibold">Did you know?</span> Students who start skill planning in their 2nd year get internships 3x faster.
                    </p>
                  </motion.div>
                </div>

                {/* Right Column: Info Panels (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Unsure Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30"
                  >
                    <h3 className="text-lg font-bold text-white mb-2">Unsure about your career?</h3>
                    <p className="text-sm text-slate-300 mb-4">Not sure what role fits you yet? We'll help you figure it out based on your interests.</p>
                    <button className="text-sm font-semibold text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all">
                      Explore career paths <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>

                  {/* Placement Trends & Facts */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Placement Trends 2025-26
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Fact 1 */}
                      <div className="glass-card p-4 border-l-4 border-l-green-500">
                        <p className="text-xs text-slate-400 mb-1">Internship Conversion</p>
                        <p className="text-sm text-white font-medium">
                          <span className="text-green-400 font-bold">68%</span> of PPOs (Pre-Placement Offers) come from summer internships.
                        </p>
                      </div>

                      {/* Fact 2 */}
                      <div className="glass-card p-4 border-l-4 border-l-cyan-500">
                        <p className="text-xs text-slate-400 mb-1">Top Skill Demand</p>
                        <p className="text-sm text-white font-medium">
                          Full-stack development & Cloud (AWS/Azure) are the <span className="text-cyan-400 font-bold">top 2</span> requested skills.
                        </p>
                      </div>

                      {/* Fact 3 */}
                      <div className="glass-card p-4 border-l-4 border-l-purple-500">
                        <p className="text-xs text-slate-400 mb-1">Salary Trends</p>
                        <p className="text-sm text-white font-medium">
                          Average fresher package for product roles rose by <span className="text-purple-400 font-bold">12%</span> this year.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
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
            {roadmap && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Reset button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Roadmap for <span className="gradient-text">{roadmap.targetRole || targetRole}</span>
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    New Search
                  </motion.button>
                </div>

                {/* Summary Cards, Radar Chart, Career Path, and Skills */}
                <RoadmapResult roadmap={roadmap} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerNavigator;

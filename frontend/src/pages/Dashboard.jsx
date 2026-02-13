import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter, SkeletonCard } from '../components/UIComponents';
import { getAllRoadmaps } from '../redux/slices/careerSlice';
import { getResumeHistory } from '../redux/slices/resumeSlice';
import {
  Compass,
  FileText,
  TrendingUp,
  Target,
  Clock,
  Star,
  ArrowRight,
  Zap,
  BarChart3,
  Activity,
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { roadmaps, loading: roadmapLoading } = useSelector((state) => state.career);
  const { history, loading: resumeLoading } = useSelector((state) => state.resume);

  useEffect(() => {
    dispatch(getAllRoadmaps());
    dispatch(getResumeHistory());
  }, [dispatch]);

  const latestRoadmap = roadmaps?.[0];
  const latestResume = history?.[0];
  const avgScore = history?.length
    ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || 0), 0) / history.length)
    : 0;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
            </h1>
            <p className="text-slate-400">Here's your career intelligence overview.</p>
          </motion.div>

          {/* Quick Stats */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10" staggerDelay={0.1}>
            {[
              {
                label: 'Resume Analyses',
                value: history?.length || 0,
                icon: FileText,
                color: 'from-indigo-500 to-blue-500',
                suffix: '',
              },
              {
                label: 'Avg Resume Score',
                value: avgScore,
                icon: Target,
                color: 'from-cyan-500 to-teal-500',
                suffix: '/100',
              },
              {
                label: 'Roadmaps Created',
                value: roadmaps?.length || 0,
                icon: Compass,
                color: 'from-purple-500 to-pink-500',
                suffix: '',
              },
              {
                label: 'Skills Tracked',
                value: latestRoadmap?.skillsToLearn?.length || 0,
                icon: TrendingUp,
                color: 'from-amber-500 to-orange-500',
                suffix: '',
              },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -3 }} className="glass-card-hover p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-slate-400">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quick Actions */}
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <Link to="/career-navigator">
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-card-hover p-6 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Compass className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Career Navigator</h3>
                    <p className="text-sm text-slate-400">Generate AI-powered skill roadmaps with salary projections</p>
                  </div>
                </motion.div>
              </Link>
              <Link to="/resume-scorer">
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-card-hover p-6 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Resume Scorer</h3>
                    <p className="text-sm text-slate-400">Upload your resume for AI-powered ATS analysis</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </ScrollReveal>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Resume Analysis */}
            <ScrollReveal delay={0.1}>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Latest Resume Analysis
                  </h3>
                  <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    View All
                  </Link>
                </div>

                {resumeLoading ? (
                  <SkeletonCard />
                ) : latestResume ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{latestResume.targetRole}</p>
                        <p className="text-xs text-slate-500">{latestResume.fileName}</p>
                      </div>
                      <div className={`text-2xl font-bold ${
                        latestResume.overallScore >= 80 ? 'text-green-400' :
                        latestResume.overallScore >= 60 ? 'text-cyan-400' :
                        latestResume.overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {latestResume.overallScore}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {['atsCompatibility', 'contentQuality', 'keywordOptimization', 'formatting', 'experienceRelevance'].map((key) => {
                        const score = latestResume.analysis?.[key]?.score || 0;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">{label}</span>
                              <span className="text-slate-300">{score}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No resume analyses yet</p>
                    <Link to="/resume-scorer" className="text-xs text-indigo-400 mt-2 inline-block hover:text-indigo-300">
                      Analyze your first resume →
                    </Link>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Latest Roadmap */}
            <ScrollReveal delay={0.2}>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Latest Career Roadmap
                  </h3>
                  <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    View All
                  </Link>
                </div>

                {roadmapLoading ? (
                  <SkeletonCard />
                ) : latestRoadmap ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{latestRoadmap.targetRole}</p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {latestRoadmap.estimatedCompletionTime}
                      </span>
                    </div>

                    {/* Top skills */}
                    <div className="space-y-2">
                      {(latestRoadmap.skillsToLearn || []).slice(0, 5).map((skill, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              skill.priority === 'Critical' ? 'bg-red-400' :
                              skill.priority === 'Important' ? 'bg-amber-400' : 'bg-green-400'
                            }`} />
                            <span className="text-sm text-slate-300">{skill.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            skill.priority === 'Critical'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : skill.priority === 'Important'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {skill.priority}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {latestRoadmap.salaryBoost && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Potential Salary Boost: {latestRoadmap.salaryBoost}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No roadmaps generated yet</p>
                    <Link to="/career-navigator" className="text-xs text-indigo-400 mt-2 inline-block hover:text-indigo-300">
                      Generate your first roadmap →
                    </Link>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

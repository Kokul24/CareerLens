import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem, SkeletonCard } from '../components/UIComponents';
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';
import RoadmapResult from '../components/RoadmapResult';
import { getAllRoadmaps, deleteRoadmap } from '../redux/slices/careerSlice';
import { getResumeHistory, deleteResume } from '../redux/slices/resumeSlice';
import {
  History as HistoryIcon,
  FileText,
  Compass,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  X,
  Maximize2
} from 'lucide-react';

const History = () => {
  const [tab, setTab] = useState('resumes');
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useDispatch();
  const { roadmaps, loading: roadmapLoading } = useSelector((state) => state.career);
  const { history, loading: resumeLoading } = useSelector((state) => state.resume);

  useEffect(() => {
    dispatch(getAllRoadmaps());
    dispatch(getResumeHistory());
  }, [dispatch]);

  const handleDeleteRoadmap = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this roadmap?')) dispatch(deleteRoadmap(id));
  };

  const handleDeleteResume = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this resume analysis?')) dispatch(deleteResume(id));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const loading = tab === 'resumes' ? resumeLoading : roadmapLoading;

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">History</h1>
            </div>
            <p className="text-slate-400 ml-[52px]">View all your past analyses and generated roadmaps</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'resumes', label: 'Resume Analyses', icon: FileText, count: history?.length },
              { key: 'roadmaps', label: 'Career Roadmaps', icon: Compass, count: roadmaps?.length },
            ].map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab(t.key)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${tab === t.key
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white bg-white/[0.03]'
                  }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/[0.08]">{t.count}</span>
                )}
                {tab === t.key && (
                  <motion.div
                    layoutId="history-tab"
                    className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.08]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Resume History */}
          <AnimatePresence mode="wait">
            {tab === 'resumes' && !loading && (
              <motion.div
                key="resumes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {history?.length > 0 ? (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.05}>
                    {history.map((item) => (
                      <StaggerItem key={item._id}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          onClick={() => setSelectedItem({ type: 'resume', data: item })}
                          className="glass-card-hover p-5 group cursor-pointer relative"
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-1.5 bg-white/10 rounded-lg">
                              <Maximize2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-3 pr-8">
                            <div>
                              <h3 className="text-sm font-semibold text-white line-clamp-1">{item.targetRole}</h3>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.fileName}</p>
                            </div>
                            <div className={`text-2xl font-bold ${item.overallScore >= 80 ? 'text-green-400' :
                              item.overallScore >= 60 ? 'text-cyan-400' :
                                item.overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                              {item.overallScore}
                            </div>
                          </div>

                          {/* Mini bars */}
                          <div className="space-y-1.5 mb-3">
                            {['atsCompatibility', 'contentQuality', 'keywordOptimization'].map((key) => {
                              const score = item.analysis?.[key]?.score || 0;
                              return (
                                <div key={key} className="h-1 rounded-full bg-white/[0.06]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteResume(e, item._id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all z-20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-2">No resume analyses yet</p>
                    <Link to="/resume-scorer" className="text-sm text-indigo-400 hover:text-indigo-300">
                      Analyze your first resume →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'roadmaps' && !loading && (
              <motion.div
                key="roadmaps"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {roadmaps?.length > 0 ? (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.05}>
                    {roadmaps.map((item) => (
                      <StaggerItem key={item._id}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          onClick={() => setSelectedItem({ type: 'roadmap', data: item })}
                          className="glass-card-hover p-5 group cursor-pointer relative"
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-1.5 bg-white/10 rounded-lg">
                              <Maximize2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-3 pr-8">
                            <h3 className="text-sm font-semibold text-white line-clamp-1">{item.targetRole}</h3>
                            <Compass className="w-4 h-4 text-indigo-400" />
                          </div>

                          <div className="flex flex-wrap gap-3 mb-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {item.skillsToLearn?.length || 0} skills
                            </span>
                            {item.estimatedCompletionTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.estimatedCompletionTime}
                              </span>
                            )}
                          </div>

                          {/* Top skills preview */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(item.skillsToLearn || []).slice(0, 4).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.06] text-xs text-slate-400">
                                {skill.name}
                              </span>
                            ))}
                            {(item.skillsToLearn?.length || 0) > 4 && (
                              <span className="px-2 py-0.5 rounded-md text-xs text-slate-500">
                                +{item.skillsToLearn.length - 4} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteRoadmap(e, item._id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all z-20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-2">No roadmaps generated yet</p>
                    <Link to="/career-navigator" className="text-sm text-indigo-400 hover:text-indigo-300">
                      Generate your first roadmap →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-card border border-white/10 shadow-2xl rounded-2xl bg-[#0f172a] outline-none"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedItem.data.targetRole}
                  </h2>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    {selectedItem.type === 'resume' ? 'Resume Analysis' : 'Career Roadmap'}
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    {formatDate(selectedItem.data.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedItem.type === 'resume' ? (
                  <ResumeAnalysisResult analysis={selectedItem.data} />
                ) : (
                  <RoadmapResult roadmap={selectedItem.data} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default History;

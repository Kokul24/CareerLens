import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { StaggerContainer, StaggerItem, SkeletonCard } from '../components/UIComponents';
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';
import RoadmapResult from '../components/RoadmapResult';
import { getAllRoadmaps, deleteRoadmap } from '../redux/slices/careerSlice';
import { getResumeHistory, deleteResume, reanalyzeResume } from '../redux/slices/resumeSlice';
import {
  History as HistoryIcon,
  FileText,
  Compass,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  X,
  Maximize2,
  Edit2,
  RefreshCw,
  GitCompare,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

const SCORE_LABELS = {
  atsCompatibility: 'ATS Compatibility',
  contentQuality: 'Content Quality',
  keywordOptimization: 'Keyword Optimization',
  formatting: 'Formatting',
  experienceRelevance: 'Experience Relevance',
};

const computeDiff = (prev, curr) => {
  const scoreKeys = Object.keys(SCORE_LABELS);
  const scoreDiffs = scoreKeys.map((key) => ({
    key,
    label: SCORE_LABELS[key],
    prev: prev.analysis?.[key]?.score ?? 0,
    curr: curr.analysis?.[key]?.score ?? 0,
    delta: (curr.analysis?.[key]?.score ?? 0) - (prev.analysis?.[key]?.score ?? 0),
  }));
  const prevMatched = new Set(prev.analysis?.keywordOptimization?.matchedKeywords || []);
  const currMatched = new Set(curr.analysis?.keywordOptimization?.matchedKeywords || []);
  const addedKeywords = [...currMatched].filter((k) => !prevMatched.has(k));
  const removedKeywords = [...prevMatched].filter((k) => !currMatched.has(k));
  const prevMissing = new Set(prev.analysis?.keywordOptimization?.missingKeywords || []);
  const currMissing = new Set(curr.analysis?.keywordOptimization?.missingKeywords || []);
  const fixedKeywords = [...prevMissing].filter((k) => !currMissing.has(k));
  const newMissingKeywords = [...currMissing].filter((k) => !prevMissing.has(k));
  const prevStrengths = new Set(prev.strengths || []);
  const currStrengths = new Set(curr.strengths || []);
  const newStrengths = [...currStrengths].filter((s) => !prevStrengths.has(s));
  const lostStrengths = [...prevStrengths].filter((s) => !currStrengths.has(s));
  const prevAreas = new Set(prev.areasForImprovement || []);
  const currAreas = new Set(curr.areasForImprovement || []);
  const resolvedAreas = [...prevAreas].filter((s) => !currAreas.has(s));
  const newAreas = [...currAreas].filter((s) => !prevAreas.has(s));
  return {
    scoreDiffs, addedKeywords, removedKeywords, fixedKeywords, newMissingKeywords,
    newStrengths, lostStrengths, resolvedAreas, newAreas,
    overallDelta: (curr.overallScore ?? 0) - (prev.overallScore ?? 0),
  };
};

// ─── DeltaBadge ──────────────────────────────────────────────────────────────

const DeltaBadge = ({ delta }) => {
  if (delta === 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-slate-500">
        <Minus className="w-3 h-3" /> 0
      </span>
    );
  return delta > 0 ? (
    <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-semibold">
      <ArrowUp className="w-3 h-3" />+{delta}
    </span>
  ) : (
    <span className="flex items-center gap-0.5 text-xs text-red-400 font-semibold">
      <ArrowDown className="w-3 h-3" />{delta}
    </span>
  );
};

const DiffChip = ({ label, type }) => {
  const styles = {
    added: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    removed: 'bg-red-500/10 border-red-500/20 text-red-400',
    fixed: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    new: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };
  const icons = {
    added: <Plus className="w-3 h-3" />,
    removed: <XCircle className="w-3 h-3" />,
    fixed: <CheckCircle2 className="w-3 h-3" />,
    new: <Plus className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs ${styles[type]}`}>
      {icons[type]}{label}
    </span>
  );
};

// ─── ResumeDiffView ───────────────────────────────────────────────────────────

const ResumeDiffView = ({ current, previous }) => {
  const diff = computeDiff(previous, current);
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const noChange =
    diff.overallDelta === 0 &&
    diff.scoreDiffs.every((s) => s.delta === 0) &&
    diff.addedKeywords.length === 0 && diff.removedKeywords.length === 0 &&
    diff.newStrengths.length === 0 && diff.lostStrengths.length === 0;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Previous: <span className="text-white font-medium">{fmt(previous?.snapshotDate)}</span></span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span>Updated: <span className="text-white font-medium">{fmt(current.updatedAt)}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Overall:</span>
          <span className={`text-2xl font-bold ${
            current.overallScore >= 80 ? 'text-green-400' : current.overallScore >= 60 ? 'text-cyan-400'
              : current.overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
          }`}>{current.overallScore}</span>
          <span className="text-slate-500 text-sm">(was <span className="text-white/70">{previous?.overallScore ?? '—'}</span>)</span>
          <DeltaBadge delta={diff.overallDelta} />
        </div>
      </div>

      {/* Score bars comparison */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />Score Breakdown
        </h3>
        <div className="space-y-3">
          {diff.scoreDiffs.map(({ key, label, prev, curr, delta }) => (
            <div key={key} className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{prev} → {curr}</span>
                  <DeltaBadge delta={delta} />
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="absolute h-full rounded-full bg-white/20" style={{ width: `${prev}%` }} />
                <motion.div
                  className={`absolute h-full rounded-full ${
                    delta >= 0 ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-gradient-to-r from-red-500 to-amber-400'
                  }`}
                  initial={{ width: `${prev}%` }}
                  animate={{ width: `${curr}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords diff */}
      {(diff.addedKeywords.length > 0 || diff.removedKeywords.length > 0 ||
        diff.fixedKeywords.length > 0 || diff.newMissingKeywords.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />Keyword Changes
          </h3>
          <div className="glass-card p-4 space-y-3">
            {diff.fixedKeywords.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Now Matched (previously missing)</p>
                <div className="flex flex-wrap gap-1.5">{diff.fixedKeywords.map((k) => <DiffChip key={k} label={k} type="fixed" />)}</div>
              </div>
            )}
            {diff.addedKeywords.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">New Matched Keywords</p>
                <div className="flex flex-wrap gap-1.5">{diff.addedKeywords.map((k) => <DiffChip key={k} label={k} type="added" />)}</div>
              </div>
            )}
            {diff.removedKeywords.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">No Longer Matched</p>
                <div className="flex flex-wrap gap-1.5">{diff.removedKeywords.map((k) => <DiffChip key={k} label={k} type="removed" />)}</div>
              </div>
            )}
            {diff.newMissingKeywords.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Newly Missing Keywords</p>
                <div className="flex flex-wrap gap-1.5">{diff.newMissingKeywords.map((k) => <DiffChip key={k} label={k} type="new" />)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths diff */}
      {(diff.newStrengths.length > 0 || diff.lostStrengths.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />Strengths Changes
          </h3>
          <div className="glass-card p-4 space-y-3">
            {diff.newStrengths.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">New Strengths Gained</p>
                <ul className="space-y-1">{diff.newStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-400">
                    <Plus className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}</ul>
              </div>
            )}
            {diff.lostStrengths.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Strengths No Longer Listed</p>
                <ul className="space-y-1">{diff.lostStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                    <Minus className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}</ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Areas for improvement diff */}
      {(diff.resolvedAreas.length > 0 || diff.newAreas.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-cyan-400" />Areas for Improvement Changes
          </h3>
          <div className="glass-card p-4 space-y-3">
            {diff.resolvedAreas.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Resolved Areas</p>
                <ul className="space-y-1">{diff.resolvedAreas.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-cyan-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}</ul>
              </div>
            )}
            {diff.newAreas.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">New Areas Identified</p>
                <ul className="space-y-1">{diff.newAreas.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-400">
                    <Plus className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}</ul>
              </div>
            )}
          </div>
        </div>
      )}

      {noChange && (
        <div className="glass-card p-8 text-center text-slate-500 text-sm">
          No notable changes detected between the two versions.
        </div>
      )}
    </div>
  );
};

// ─── UpdateResumeModal ────────────────────────────────────────────────────────

const UpdateResumeModal = ({ item, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.resume);
  const [targetRole, setTargetRole] = useState(item.targetRole || '');
  const [skills, setSkills] = useState(item.skills || '');
  const [jobDescription, setJobDescription] = useState(item.jobDescription || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) { setError('Target role is required'); return; }
    if (!skills.trim()) { setError('Please describe your skills and profile'); return; }
    setError('');
    const result = await dispatch(reanalyzeResume({ id: item._id, data: { targetRole, skills, jobDescription } }));
    if (reanalyzeResume.fulfilled.match(result)) onSuccess(result.payload);
    else setError(result.payload || 'Re-analysis failed. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-card border border-white/10 rounded-2xl bg-[#0f172a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Re-Analyze Resume</h2>
              <p className="text-xs text-slate-400">Update skills to regenerate analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Target Role <span className="text-red-400">*</span>
            </label>
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Analyst…"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Skills &amp; Profile <span className="text-red-400">*</span>
            </label>
            <textarea rows={6} value={skills} onChange={(e) => setSkills(e.target.value)}
              placeholder={`Describe your updated skills, technologies, projects, and experience.\n\nExample:\nProficient in React, Node.js, TypeScript\n3 internships in web development\nBuilt 4 full-stack projects with GitHub links\nLeetCode rating: 1800 | DSA proficient`}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
            <p className="text-xs text-slate-600 mt-1">The AI will use this as your profile to generate an updated analysis.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Job Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea rows={3} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description for better keyword matching…"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 text-sm font-medium transition-all border border-white/[0.06]">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (<><RefreshCw className="w-4 h-4 animate-spin" />Analyzing…</>) : (<><Sparkles className="w-4 h-4" />Re-Analyze</>)}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const History = () => {
  const [tab, setTab] = useState('resumes');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalTab, setModalTab] = useState('result'); // 'result' | 'changes'
  const [updateItem, setUpdateItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resumeSort, setResumeSort] = useState('newest');
  const [roadmapSort, setRoadmapSort] = useState('newest');
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

  const handleEditResume = (e, item) => {
    e.stopPropagation();
    setUpdateItem(item);
  };

  const handleUpdateSuccess = (updatedData) => {
    setUpdateItem(null);
    setSelectedItem({ type: 'resume', data: updatedData });
    if (updatedData.previousAnalysis) setModalTab('changes');
    else setModalTab('result');
  };

  const handleOpenItem = (item, type) => {
    setSelectedItem({ type, data: item });
    setModalTab('result');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const loading = tab === 'resumes' ? resumeLoading : roadmapLoading;

  // ── filtered + sorted lists ──────────────────────────────────────────────
  const q = searchQuery.trim().toLowerCase();

  const filteredResumes = (history || [])
    .filter((r) =>
      !q ||
      r.targetRole?.toLowerCase().includes(q) ||
      r.fileName?.toLowerCase().includes(q) ||
      r.jobDescription?.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      if (resumeSort === 'newest') return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      if (resumeSort === 'oldest') return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      if (resumeSort === 'score-desc') return (b.overallScore || 0) - (a.overallScore || 0);
      if (resumeSort === 'score-asc') return (a.overallScore || 0) - (b.overallScore || 0);
      if (resumeSort === 'az') return (a.targetRole || '').localeCompare(b.targetRole || '');
      return 0;
    });

  const filteredRoadmaps = (roadmaps || [])
    .filter((r) =>
      !q ||
      r.targetRole?.toLowerCase().includes(q) ||
      (r.skillsToLearn || []).some((s) => s.name?.toLowerCase().includes(q))
    )
    .sort((a, b) => {
      if (roadmapSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (roadmapSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (roadmapSort === 'skills') return (b.skillsToLearn?.length || 0) - (a.skillsToLearn?.length || 0);
      if (roadmapSort === 'az') return (a.targetRole || '').localeCompare(b.targetRole || '');
      return 0;
    });

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

          {/* Tabs + Search + Sort */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Tab row */}
            <div className="flex gap-2">
              {[
                { key: 'resumes', label: 'Resume Analyses', icon: FileText, count: history?.length },
                { key: 'roadmaps', label: 'Career Roadmaps', icon: Compass, count: roadmaps?.length },
              ].map((t) => (
                <motion.button
                  key={t.key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTab(t.key); setSearchQuery(''); }}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    tab === t.key ? 'text-white' : 'text-slate-400 hover:text-white bg-white/[0.03]'
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

            {/* Search + Sort row */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    tab === 'resumes'
                      ? 'Search by role or filename…'
                      : 'Search by role or skill…'
                  }
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <select
                  value={tab === 'resumes' ? resumeSort : roadmapSort}
                  onChange={(e) =>
                    tab === 'resumes'
                      ? setResumeSort(e.target.value)
                      : setRoadmapSort(e.target.value)
                  }
                  className="pl-8 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer transition-all hover:bg-white/[0.06]"
                >
                  {tab === 'resumes' ? (
                    <>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="score-desc">Score: High → Low</option>
                      <option value="score-asc">Score: Low → High</option>
                      <option value="az">A → Z</option>
                    </>
                  ) : (
                    <>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="skills">Most skills</option>
                      <option value="az">A → Z</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Result count when searching */}
            {searchQuery && !loading && (
              <p className="text-xs text-slate-500">
                {tab === 'resumes'
                  ? `${filteredResumes.length} of ${history?.length || 0} results`
                  : `${filteredRoadmaps.length} of ${roadmaps?.length || 0} results`}
              </p>
            )}
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
                {history?.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-2">No resume analyses yet</p>
                    <Link to="/resume-scorer" className="text-sm text-indigo-400 hover:text-indigo-300">
                      Analyze your first resume →
                    </Link>
                  </div>
                ) : filteredResumes.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-1">No results for &ldquo;{searchQuery}&rdquo;</p>
                    <button onClick={() => setSearchQuery('')} className="text-sm text-indigo-400 hover:text-indigo-300">Clear search</button>
                  </div>
                ) : (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.05}>
                    {filteredResumes.map((item) => (
                      <StaggerItem key={item._id}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          onClick={() => handleOpenItem(item, 'resume')}
                          className="glass-card-hover p-5 group cursor-pointer relative"
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-1.5 bg-white/10 rounded-lg">
                              <Maximize2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          {/* Updated badge */}
                          {item.previousAnalysis && (
                            <div className="absolute top-3 left-3">
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-[10px] font-medium">
                                <GitCompare className="w-2.5 h-2.5" />Updated
                              </span>
                            </div>
                          )}

                          <div className={`flex items-start justify-between mb-3 pr-8 ${item.previousAnalysis ? 'mt-5' : ''}`}>
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
                              {item.updatedAt ? `Updated ${formatDate(item.updatedAt)}` : formatDate(item.createdAt)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleEditResume(e, item)}
                                title="Re-analyze with updated skills"
                                className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-all z-20"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteResume(e, item._id)}
                                title="Delete"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all z-20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
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
                {roadmaps?.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-2">No roadmaps generated yet</p>
                    <Link to="/career-navigator" className="text-sm text-indigo-400 hover:text-indigo-300">
                      Generate your first roadmap →
                    </Link>
                  </div>
                ) : filteredRoadmaps.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-1">No results for &ldquo;{searchQuery}&rdquo;</p>
                    <button onClick={() => setSearchQuery('')} className="text-sm text-indigo-400 hover:text-indigo-300">Clear search</button>
                  </div>
                ) : (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.05}>
                    {filteredRoadmaps.map((item) => (
                      <StaggerItem key={item._id}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          onClick={() => handleOpenItem(item, 'roadmap')}
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
              <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedItem.data.targetRole}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                      {selectedItem.type === 'resume' ? 'Resume Analysis' : 'Career Roadmap'}
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      {selectedItem.data.updatedAt
                        ? `Updated ${formatDate(selectedItem.data.updatedAt)}`
                        : `Created ${formatDate(selectedItem.data.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItem.type === 'resume' && (
                      <button
                        onClick={() => setUpdateItem(selectedItem.data)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />Re-analyze
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub-tabs: only for resume with previousAnalysis */}
                {selectedItem.type === 'resume' && selectedItem.data.previousAnalysis && (
                  <div className="flex gap-1 mt-3">
                    {[
                      { key: 'result', label: 'Current Analysis', icon: FileText },
                      { key: 'changes', label: 'What Changed', icon: GitCompare },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setModalTab(t.key)}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          modalTab === t.key
                            ? 'text-white bg-white/[0.08] border border-white/[0.1]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                        {t.key === 'changes' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedItem.type === 'resume' ? (
                  modalTab === 'result' || !selectedItem.data.previousAnalysis ? (
                    <ResumeAnalysisResult analysis={selectedItem.data} />
                  ) : (
                    <ResumeDiffView
                      current={selectedItem.data}
                      previous={selectedItem.data.previousAnalysis}
                    />
                  )
                ) : (
                  <RoadmapResult roadmap={selectedItem.data} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update / Re-analyze Modal */}
      <AnimatePresence>
        {updateItem && (
          <UpdateResumeModal
            item={updateItem}
            onClose={() => setUpdateItem(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default History;

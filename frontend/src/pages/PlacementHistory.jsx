import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  getPlacementPredictions,
  deletePlacementPrediction,
  searchPlacementPredictions,
  updatePlacementPrediction,
} from '../redux/slices/placementSlice';
import {
  History as HistoryIcon,
  Trash2,
  Search,
  SlidersHorizontal,
  GraduationCap,
  Edit2,
  X,
  Eye,
  TrendingUp,
  BarChart3,
  Calendar,
  Lightbulb,
} from 'lucide-react';

const BRANCH_MAP = {
  1: 'CSE', 2: 'Civil', 3: 'ECE', 4: 'EEE', 5: 'IT', 6: 'Mechanical',
};

const FEATURE_LABELS = {
  branch: 'Branch',
  cgpa: 'CGPA',
  internship_count: 'Internships',
  project_count: 'Projects',
  certifications_count: 'Certifications',
  coding_skills_score: 'Coding Skills',
  communication_skills_score: 'Communication',
  soft_skills_score: 'Soft Skills',
  hackathon_participation: 'Hackathons',
};

const FIELDS = [
  { key: 'branch', label: 'Branch', type: 'select', options: Object.entries(BRANCH_MAP).map(([v, l]) => ({ value: v, label: l })) },
  { key: 'cgpa', label: 'CGPA', type: 'number', min: 0, max: 10, step: 0.01 },
  { key: 'internship_count', label: 'Internship Count', type: 'number', min: 0, max: 20, step: 1 },
  { key: 'project_count', label: 'Project Count', type: 'number', min: 0, max: 20, step: 1 },
  { key: 'certifications_count', label: 'Certifications Count', type: 'number', min: 0, max: 20, step: 1 },
  { key: 'coding_skills_score', label: 'Coding Skills Score', type: 'number', min: 0, max: 100, step: 1 },
  { key: 'communication_skills_score', label: 'Communication Skills Score', type: 'number', min: 0, max: 100, step: 1 },
  { key: 'soft_skills_score', label: 'Soft Skills Score', type: 'number', min: 0, max: 100, step: 1 },
  { key: 'hackathon_participation', label: 'Hackathon Participation', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

export default function PlacementHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { history, loading } = useSelector((state) => state.placement);

  // Search filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    branch: '', minCgpa: '', maxCgpa: '', minProbability: '', maxProbability: '', startDate: '', endDate: '',
  });

  // View / Edit modal
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    dispatch(getPlacementPredictions());
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    const params = {};
    if (filters.branch) params.branch = filters.branch;
    if (filters.minCgpa) params.minCgpa = filters.minCgpa;
    if (filters.maxCgpa) params.maxCgpa = filters.maxCgpa;
    if (filters.minProbability) params.minProbability = filters.minProbability;
    if (filters.maxProbability) params.maxProbability = filters.maxProbability;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    if (Object.keys(params).length === 0) {
      dispatch(getPlacementPredictions());
    } else {
      dispatch(searchPlacementPredictions(params));
    }
  }, [dispatch, filters]);

  const clearFilters = () => {
    setFilters({ branch: '', minCgpa: '', maxCgpa: '', minProbability: '', maxProbability: '', startDate: '', endDate: '' });
    dispatch(getPlacementPredictions());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prediction?')) return;
    dispatch(deletePlacementPrediction(id));
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      branch: String(item.branch),
      cgpa: String(item.cgpa),
      internship_count: String(item.internship_count),
      project_count: String(item.project_count),
      certifications_count: String(item.certifications_count),
      coding_skills_score: String(item.coding_skills_score),
      communication_skills_score: String(item.communication_skills_score),
      soft_skills_score: String(item.soft_skills_score),
      hackathon_participation: String(item.hackathon_participation),
    });
  };

  const handleUpdate = async () => {
    const payload = {};
    for (const f of FIELDS) {
      payload[f.key] = parseFloat(editForm[f.key]);
    }
    await dispatch(updatePlacementPrediction({ id: editItem._id, data: payload })).unwrap();
    setEditItem(null);
    dispatch(getPlacementPredictions());
  };

  const probBadge = (prob) => {
    if (prob >= 70) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (prob >= 40) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
              <HistoryIcon className="w-4 h-4" />
              Prediction History
            </span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Placement Prediction History
            </h1>
            <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
              View, search, update, and manage all your past placement predictions.
            </p>
          </div>

          {/* Search / Filter Section */}
          <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                Search & Filter
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Branch</label>
                      <select
                        value={filters.branch}
                        onChange={(e) => setFilters((p) => ({ ...p, branch: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value="" className="bg-slate-900">All Branches</option>
                        {Object.entries(BRANCH_MAP).map(([v, l]) => (
                          <option key={v} value={v} className="bg-slate-900">{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">CGPA Range</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" min="0" max="10" step="0.1"
                          value={filters.minCgpa}
                          onChange={(e) => setFilters((p) => ({ ...p, minCgpa: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <input type="number" placeholder="Max" min="0" max="10" step="0.1"
                          value={filters.maxCgpa}
                          onChange={(e) => setFilters((p) => ({ ...p, maxCgpa: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Probability Range</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min %" min="0" max="100"
                          value={filters.minProbability}
                          onChange={(e) => setFilters((p) => ({ ...p, minProbability: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <input type="number" placeholder="Max %" min="0" max="100"
                          value={filters.maxProbability}
                          onChange={(e) => setFilters((p) => ({ ...p, maxProbability: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Date Range</label>
                      <div className="flex gap-2">
                        <input type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <input type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
                          className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSearch}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-medium transition-all flex items-center gap-2">
                      <Search className="w-4 h-4" /> Search
                    </button>
                    <button onClick={clearFilters}
                      className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium transition-all">
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {loading ? 'Loading...' : `${history.length} prediction${history.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Predictions Table / Cards */}
          {history.length === 0 && !loading ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No predictions yet</h3>
              <p className="text-gray-500 mt-2">Make your first placement prediction to see it here.</p>
              <button
                onClick={() => navigate('/placement-predictor')}
                className="mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all"
              >
                Make Prediction
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-xs text-gray-500">Branch</span>
                        <p className="text-sm font-medium">{BRANCH_MAP[item.branch] || item.branch}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">CGPA</span>
                        <p className="text-sm font-medium">{item.cgpa}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Coding</span>
                        <p className="text-sm font-medium">{item.coding_skills_score}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Date</span>
                        <p className="text-sm font-medium">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>

                    {/* Center: Probability */}
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${probBadge(item.placement_probability)}`}>
                        {item.placement_probability}%
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewItem(item)}
                        className="p-2 rounded-lg border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View Detail Modal */}
          <AnimatePresence>
            {viewItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setViewItem(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                      Prediction Details
                    </h3>
                    <button onClick={() => setViewItem(null)} className="p-2 rounded-lg hover:bg-white/10 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Probability */}
                  <div className={`text-center px-6 py-4 rounded-xl border mb-6 ${probBadge(viewItem.placement_probability)}`}>
                    <div className="text-4xl font-bold">{viewItem.placement_probability}%</div>
                    <div className="text-sm opacity-80 mt-1">Placement Probability</div>
                  </div>

                  {/* Input Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      ['Branch', BRANCH_MAP[viewItem.branch]],
                      ['CGPA', viewItem.cgpa],
                      ['Internships', viewItem.internship_count],
                      ['Projects', viewItem.project_count],
                      ['Certifications', viewItem.certifications_count],
                      ['Coding', viewItem.coding_skills_score],
                      ['Communication', viewItem.communication_skills_score],
                      ['Soft Skills', viewItem.soft_skills_score],
                      ['Hackathon', viewItem.hackathon_participation === 1 ? 'Yes' : 'No'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white/5 rounded-lg p-3 border border-white/[0.06]">
                        <span className="text-xs text-gray-500">{label}</span>
                        <p className="text-sm font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* SHAP Chart */}
                  {viewItem.feature_contributions?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Feature Importance
                      </h4>
                      <div className="h-64 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={viewItem.feature_contributions.map((c) => ({
                              name: FEATURE_LABELS[c.feature] || c.feature,
                              value: c.absContribution,
                              contribution: c.contribution,
                            }))}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 90, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={85} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {viewItem.feature_contributions.map((c, i) => (
                                <Cell key={i} fill={c.contribution >= 0 ? '#6366f1' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {viewItem.suggestions?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        Suggestions
                      </h4>
                      <div className="space-y-2">
                        {viewItem.suggestions.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(viewItem.createdAt)}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {editItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setEditItem(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-amber-400" />
                      Edit Prediction
                    </h3>
                    <button onClick={() => setEditItem(null)} className="p-2 rounded-lg hover:bg-white/10 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {FIELDS.map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm text-gray-300 mb-1">{f.label}</label>
                        {f.type === 'select' ? (
                          <select
                            value={editForm[f.key]}
                            onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          >
                            {f.options.map((o) => (
                              <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            min={f.min}
                            max={f.max}
                            step={f.step}
                            value={editForm[f.key]}
                            onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update & Re-predict'}
                    </button>
                    <button
                      onClick={() => setEditItem(null)}
                      className="px-6 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}

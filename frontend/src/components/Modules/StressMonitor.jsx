import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '../Navbar';
import Footer from '../Footer';

const API = 'http://localhost:5001/api/stress';

const FIELDS = [
  { key: 'Study_Hours_Per_Day', label: 'Study Hours', icon: '📚', max: 16 },
  { key: 'Extracurricular_Hours_Per_Day', label: 'Extracurricular Hours', icon: '🎭', max: 10 },
  { key: 'Sleep_Hours_Per_Day', label: 'Sleep Hours', icon: '😴', max: 14 },
  { key: 'Social_Hours_Per_Day', label: 'Social Hours', icon: '👥', max: 10 },
  { key: 'Physical_Activity_Hours_Per_Day', label: 'Physical Activity Hours', icon: '🏃', max: 10 },
];

const EMPTY_FORM = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

const STRESS_BADGE = {
  Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  Moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  High: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export default function StressMonitor() {
  const location = useLocation();
  // ─── State ───
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ─── Handle edit navigation from History page ───
  useEffect(() => {
    if (location.state?.editLog) {
      const log = location.state.editLog;
      setEditingId(log._id);
      setForm(Object.fromEntries(FIELDS.map((f) => [f.key, log[f.key]?.toString() || ''])));
      setSelectedLog(log);
      // Clear navigation state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ─── Fetch logs ───
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/logs`);
      setLogs(data.data || []);
      if (!selectedLog && data.data?.length > 0) setSelectedLog(data.data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedLog]);

  useEffect(() => { fetchLogs(); }, []);

  // ─── Form handlers ───
  const onChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        FIELDS.map((f) => [f.key, parseFloat(form[f.key])])
      );
      if (FIELDS.some((f) => isNaN(payload[f.key]) || payload[f.key] < 0)) {
        setError('Please fill all fields with valid positive numbers.');
        setSubmitting(false);
        return;
      }

      let res;
      if (editingId) {
        res = await axios.put(`${API}/log/${editingId}`, payload);
      } else {
        res = await axios.post(`${API}/log`, payload);
      }
      setSelectedLog(res.data.data);
      resetForm();
      await fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (log) => {
    setEditingId(log._id);
    setForm(Object.fromEntries(FIELDS.map((f) => [f.key, log[f.key]?.toString() || ''])));
    setSelectedLog(log);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try {
      await axios.delete(`${API}/log/${id}`);
      if (selectedLog?._id === id) setSelectedLog(null);
      await fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };
  const downloadPDF = async () => {
    const el = document.getElementById('stress-report-container');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`stress-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ─── Radar data ───
  const radarData = selectedLog
    ? FIELDS.map((f) => ({
        metric: f.label,
        value: selectedLog[f.key] || 0,
        max: f.max,
      }))
    : [];

  // ────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-4">
            🧠 ML-Powered Analysis
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Student Well-being &amp; Stress Monitor
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Log your daily habits and get AI-powered stress predictions with actionable insights to improve your well-being.
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            TOP SECTION — INPUT / EDIT FORM
        ═══════════════════════════════════════════ */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            {editingId ? '✏️ Update Daily Log' : '📝 New Daily Log'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {editingId
              ? 'Modify the values below and save to re-predict your stress level.'
              : 'Enter how many hours you spent on each activity today.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-300 mb-1">
                    {f.icon} {f.label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    placeholder="0"
                    value={form[f.key]}
                    onChange={(e) => onChange(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '⏳ Predicting…' : editingId ? '💾 Update & Re-predict' : '🔮 Predict Stress Level'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ═══════════════════════════════════════════
            MIDDLE SECTION — VISUAL INSIGHTS & PDF
        ═══════════════════════════════════════════ */}
        {selectedLog && (
          <section id="stress-report-container" className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  📊 AI Stress Insights
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Logged on {new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Stress Badge */}
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-lg font-bold ${STRESS_BADGE[selectedLog.predictedStressLevel] || ''}`}>
                {selectedLog.predictedStressLevel === 'Low' && '😊'}
                {selectedLog.predictedStressLevel === 'Moderate' && '😐'}
                {selectedLog.predictedStressLevel === 'High' && '😰'}
                Stress Level: {selectedLog.predictedStressLevel}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Work / Life Balance Radar</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar
                      name="Hours"
                      dataKey="value"
                      stroke="#a78bfa"
                      fill="#a78bfa"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex-1">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">💡 Actionable Suggestions</h3>
                  <div className="space-y-3">
                    {selectedLog.suggestions?.split('. ').filter(Boolean).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <span className="text-purple-400 mt-0.5">▸</span>
                        <p className="text-gray-300 text-sm leading-relaxed">{tip.endsWith('.') ? tip : `${tip}.`}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics summary cards */}
                <div className="grid grid-cols-5 gap-2">
                  {FIELDS.map((f) => (
                    <div key={f.key} className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                      <div className="text-lg">{f.icon}</div>
                      <div className="text-white font-bold text-sm">{selectedLog[f.key]}h</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{f.label.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PDF Download Button (outside the capture area so the button itself isn't in the PDF) */}
        {selectedLog && (
          <div className="flex justify-center mb-10">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-medium transition-all shadow-lg shadow-cyan-500/20"
            >
              📄 Download AI Insights (PDF)
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

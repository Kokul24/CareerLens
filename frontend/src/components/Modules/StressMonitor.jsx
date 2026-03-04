import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import AnimatedBackground from '../AnimatedBackground';
import Navbar from '../Navbar';
import Footer from '../Footer';

const API = '/api/stress';

const FIELDS = [
  { key: 'Study_Hours_Per_Day', label: 'Study Hours', max: 16 },
  { key: 'Extracurricular_Hours_Per_Day', label: 'Extracurricular Hours', max: 10 },
  { key: 'Sleep_Hours_Per_Day', label: 'Sleep Hours', max: 14 },
  { key: 'Social_Hours_Per_Day', label: 'Social Hours', max: 10 },
  { key: 'Physical_Activity_Hours_Per_Day', label: 'Physical Activity Hours', max: 10 },
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
  const [fieldErrors, setFieldErrors] = useState({});
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

  // ─── Computed total hours ───
  const totalHours = useMemo(() => {
    return FIELDS.reduce((sum, f) => {
      const v = parseFloat(form[f.key]);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  }, [form]);

  const totalExceeded = totalHours > 24;

  // ─── Real-time field validation ───
  const validateField = (key, value) => {
    const num = parseFloat(value);
    if (value === '') return null; // empty is handled by required
    if (isNaN(num)) return 'Enter a valid number';
    if (num < 0) return 'Cannot be negative';
    if (num > 24) return 'Cannot exceed 24 hours';
    if (!/^\d+(\.\d{1,1})?$/.test(value) && value !== '') return 'Max 1 decimal place';
    return null;
  };

  // ─── Form handlers ───
  const onChange = (key, val) => {
    // Block non-numeric characters except . and empty
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
    setForm((p) => ({ ...p, [key]: val }));
    const err = validateField(key, val);
    setFieldErrors((p) => ({ ...p, [key]: err }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Build payload and validate every field
    const payload = {};
    const errors = {};
    let hasError = false;

    for (const f of FIELDS) {
      const raw = form[f.key];
      if (raw === '' || raw === undefined || raw === null) {
        errors[f.key] = 'This field is required';
        hasError = true;
        continue;
      }
      const num = parseFloat(raw);
      if (isNaN(num)) {
        errors[f.key] = 'Enter a valid number';
        hasError = true;
      } else if (num < 0) {
        errors[f.key] = 'Cannot be negative';
        hasError = true;
      } else if (num > 24) {
        errors[f.key] = 'Cannot exceed 24 hours';
        hasError = true;
      } else {
        payload[f.key] = Math.round(num * 10) / 10; // round to 1 decimal
      }
    }

    if (hasError) {
      setFieldErrors(errors);
      setError('Please fix the highlighted errors above.');
      return;
    }

    // Check total hours
    const sum = Object.values(payload).reduce((a, b) => a + b, 0);
    if (sum > 24) {
      setError(`Total hours (${sum.toFixed(1)}h) exceed 24 hours in a day. Please adjust your values.`);
      return;
    }

    if (sum === 0) {
      setError('At least one activity must have hours greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
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

  // ─── Professional PDF Report ───
  const downloadPDF = async () => {
    if (!selectedLog) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 15;

    // ── Helper: horizontal line ──
    const drawLine = (yPos, color = [100, 116, 139]) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, W - margin, yPos);
    };

    // ══ HEADER ══
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, W, 45, 'F');
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 45, W, 1.5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CareerLens', margin, 20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Student Well-being & Stress Monitor — AI Report', margin, 28);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 36);

    // ── Stress level badge (right side of header) ──
    const level = selectedLog.predictedStressLevel;
    const badgeColors = { Low: [16, 185, 129], Moderate: [245, 158, 11], High: [239, 68, 68] };
    const badgeBg = { Low: [6, 78, 59], Moderate: [120, 53, 15], High: [127, 29, 29] };
    const bc = badgeBg[level] || [50, 50, 50];
    const tc = badgeColors[level] || [200, 200, 200];
    const badgeText = `Stress Level: ${level}`;
    const badgeW = pdf.getTextWidth(badgeText) + 16;
    pdf.setFillColor(...bc);
    pdf.roundedRect(W - margin - badgeW, 14, badgeW, 10, 2, 2, 'F');
    pdf.setTextColor(...tc);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badgeText, W - margin - badgeW + 8, 21);

    y = 55;

    // ══ LOGGED DATE ══
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Log Date:', margin, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(
      new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      margin + 25, y
    );
    y += 10;
    drawLine(y);
    y += 8;

    // ══ DAILY ACTIVITY BREAKDOWN TABLE ══
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Daily Activity Breakdown', margin, y);
    y += 8;

    // Table header
    const colW = (W - 2 * margin) / 3;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, W - 2 * margin, 9, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Activity', margin + 4, y + 6);
    pdf.text('Hours', margin + colW + 4, y + 6);
    pdf.text('% of Day', margin + colW * 2 + 4, y + 6);
    y += 9;

    // Table rows
    const totalLogged = FIELDS.reduce((s, f) => s + (selectedLog[f.key] || 0), 0);
    FIELDS.forEach((f, i) => {
      const val = selectedLog[f.key] || 0;
      const pct = ((val / 24) * 100).toFixed(1);
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y, W - 2 * margin, 8, 'F');
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(f.label, margin + 4, y + 5.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${val}h`, margin + colW + 4, y + 5.5);
      // Mini progress bar
      const barX = margin + colW * 2 + 4;
      const barMaxW = colW - 30;
      pdf.setFillColor(226, 232, 240);
      pdf.roundedRect(barX, y + 2, barMaxW, 4, 1, 1, 'F');
      const fillColor = val > 10 ? [239, 68, 68] : val > 6 ? [245, 158, 11] : [16, 185, 129];
      pdf.setFillColor(...fillColor);
      pdf.roundedRect(barX, y + 2, Math.max(1, (val / 24) * barMaxW), 4, 1, 1, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${pct}%`, barX + barMaxW + 3, y + 5.5);
      y += 8;
    });

    // Total row
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, W - 2 * margin, 9, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Total Logged', margin + 4, y + 6);
    pdf.text(`${totalLogged.toFixed(1)}h / 24h`, margin + colW + 4, y + 6);
    pdf.text(`${((totalLogged / 24) * 100).toFixed(1)}%`, margin + colW * 2 + 4, y + 6);
    y += 14;
    drawLine(y);
    y += 8;

    // ══ RADAR CHART IMAGE ══
    const chartEl = document.querySelector('#stress-report-container .recharts-wrapper');
    if (chartEl) {
      try {
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Work / Life Balance Radar', margin, y);
        y += 4;
        const chartCanvas = await html2canvas(chartEl, { backgroundColor: '#ffffff', scale: 2 });
        const chartImg = chartCanvas.toDataURL('image/png');
        const chartW = W - 2 * margin - 20;
        const chartH = (chartCanvas.height * chartW) / chartCanvas.width;
        pdf.addImage(chartImg, 'PNG', margin + 10, y, chartW, chartH);
        y += chartH + 8;
      } catch (e) {
        console.warn('Could not capture radar chart', e);
      }
    }

    // ══ AI SUGGESTIONS ══
    if (y > 240) { pdf.addPage(); y = 20; }
    drawLine(y);
    y += 8;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI-Powered Suggestions', margin, y);
    y += 7;

    const suggestions = selectedLog.suggestions?.split('. ').filter(Boolean) || [];
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    suggestions.forEach((tip, i) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      const text = tip.endsWith('.') ? tip : `${tip}.`;
      // Bullet point
      pdf.setFillColor(99, 102, 241);
      pdf.circle(margin + 2.5, y - 1, 1.2, 'F');
      pdf.setTextColor(51, 65, 85);
      const lines = pdf.splitTextToSize(text, W - 2 * margin - 10);
      pdf.text(lines, margin + 7, y);
      y += lines.length * 4.5 + 3;
    });

    // ══ FOOTER ══
    y += 5;
    if (y > 270) { pdf.addPage(); y = 20; }
    drawLine(y, [203, 213, 225]);
    y += 6;
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CareerLens — Student Well-being & Stress Monitor', margin, y);
    pdf.text('This report was generated using ML-powered analysis. For informational purposes only.', margin, y + 4);
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, W - margin - 20, y);

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
    <div className="relative min-h-screen flex flex-col text-white">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-4">
            ML-Powered Analysis
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
            {editingId ? 'Update Daily Log' : 'New Daily Log'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {editingId
              ? 'Modify the values below and save to re-predict your stress level.'
              : 'Enter how many hours you spent on each activity today.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {FIELDS.map((f) => {
                const hasErr = !!fieldErrors[f.key];
                return (
                  <div key={f.key}>
                    <label className="block text-sm text-gray-300 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={form[f.key]}
                      onChange={(e) => onChange(f.key, e.target.value)}
                      onBlur={() => {
                        if (form[f.key] === '') setFieldErrors((p) => ({ ...p, [f.key]: 'This field is required' }));
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                        hasErr
                          ? 'border-red-500/60 focus:ring-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                      }`}
                    />
                    {hasErr && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors[f.key]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Real-time total hours indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Total Hours Logged</span>
                <span className={`text-xs font-semibold ${
                  totalExceeded ? 'text-red-400' : totalHours > 20 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {totalHours.toFixed(1)}h / 24h
                  {totalExceeded && ' — exceeds 24 hours!'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalExceeded
                      ? 'bg-gradient-to-r from-red-500 to-red-400'
                      : totalHours > 20
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min((totalHours / 24) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || totalExceeded}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Predicting...' : editingId ? 'Update & Re-predict' : 'Predict Stress Level'}
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
                  AI Stress Insights
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Logged on {new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Stress Badge */}
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-lg font-bold ${STRESS_BADGE[selectedLog.predictedStressLevel] || ''}`}>
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
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Actionable Suggestions</h3>
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
                      <div className="text-white font-bold text-sm">{selectedLog[f.key]}h</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{f.label.replace(' Hours', '')}</div>
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
              Download AI Insights (PDF)
            </button>
          </div>
        )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

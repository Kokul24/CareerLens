import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createPlacementPrediction, clearPrediction } from '../redux/slices/placementSlice';
import {
  GraduationCap, Send, RotateCcw, Download, TrendingUp, Lightbulb, BarChart3,
} from 'lucide-react';

const BRANCH_MAP = {
  1: 'CSE', 2: 'Civil', 3: 'ECE', 4: 'EEE', 5: 'IT', 6: 'Mechanical',
};

const SKILL_LEVEL_OPTIONS = [
  { value: 'Poor', label: 'Poor' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Good', label: 'Good' },
  { value: 'Very Good', label: 'Very Good' },
  { value: 'Excellent', label: 'Excellent' },
];

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
  { key: 'cgpa', label: 'CGPA', type: 'number', min: 0, max: 10, step: 0.01, placeholder: 'e.g. 8.5' },
  { key: 'internship_count', label: 'Internship Count', type: 'number', min: 0, max: 20, step: 1, placeholder: 'e.g. 2' },
  { key: 'project_count', label: 'Project Count', type: 'number', min: 0, max: 20, step: 1, placeholder: 'e.g. 3' },
  { key: 'certifications_count', label: 'Certifications Count', type: 'number', min: 0, max: 20, step: 1, placeholder: 'e.g. 2' },
  { key: 'coding_skill_level', label: 'Coding Skills', type: 'select', skillLevel: true, options: SKILL_LEVEL_OPTIONS },
  { key: 'communication_skill_level', label: 'Communication Skills', type: 'select', skillLevel: true, options: SKILL_LEVEL_OPTIONS },
  { key: 'soft_skill_level', label: 'Soft Skills', type: 'select', skillLevel: true, options: SKILL_LEVEL_OPTIONS },
  { key: 'hackathon_participation', label: 'Hackathon Participation', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

const EMPTY_FORM = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

export default function PlacementPredictor() {
  const dispatch = useDispatch();
  const { prediction, loading } = useSelector((state) => state.placement);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  const onChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setFieldErrors((p) => ({ ...p, [key]: null }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
    dispatch(clearPrediction());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    let hasError = false;
    for (const f of FIELDS) {
      if (form[f.key] === '' || form[f.key] === undefined) {
        errors[f.key] = 'This field is required';
        hasError = true;
      }
    }
    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    const payload = {};
    for (const f of FIELDS) {
      payload[f.key] = f.skillLevel ? form[f.key] : parseFloat(form[f.key]);
    }

    try {
      const result = await dispatch(createPlacementPrediction(payload)).unwrap();
      if (!result) setError('Prediction failed');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Prediction failed');
    }
  };

  // ─── PDF Report ───
  const downloadPDF = useCallback(async () => {
    if (!prediction) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 15;

    const drawLine = (yPos, color = [100, 116, 139]) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, W - margin, yPos);
    };

    // Header
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
    pdf.text('Placement Prediction — ML Analysis Report', margin, 28);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 36);

    // Probability badge (right side)
    const prob = prediction.placement_probability;
    const badgeColor = prob >= 70 ? [16, 185, 129] : prob >= 40 ? [245, 158, 11] : [239, 68, 68];
    const badgeBg = prob >= 70 ? [6, 78, 59] : prob >= 40 ? [120, 53, 15] : [127, 29, 29];
    const badgeText = `Placement Probability: ${prob}%`;
    const badgeW = pdf.getTextWidth(badgeText) + 16;
    pdf.setFillColor(...badgeBg);
    pdf.roundedRect(W - margin - badgeW, 14, badgeW, 10, 2, 2, 'F');
    pdf.setTextColor(...badgeColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badgeText, W - margin - badgeW + 8, 21);

    y = 55;

    // Student Input Summary
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student Input Summary', margin, y);
    y += 8;

    const colW = (W - 2 * margin) / 2;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, W - 2 * margin, 9, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Feature', margin + 4, y + 6);
    pdf.text('Value', margin + colW + 4, y + 6);
    y += 9;

    const inputItems = [
      ['Branch', BRANCH_MAP[prediction.branch] || prediction.branch],
      ['CGPA', prediction.cgpa],
      ['Internship Count', prediction.internship_count],
      ['Project Count', prediction.project_count],
      ['Certifications Count', prediction.certifications_count],
      ['Coding Skills Score', prediction.coding_skills_score],
      ['Communication Skills Score', prediction.communication_skills_score],
      ['Soft Skills Score', prediction.soft_skills_score],
      ['Hackathon Participation', prediction.hackathon_participation === 1 ? 'Yes' : 'No'],
    ];

    inputItems.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y, W - 2 * margin, 8, 'F');
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(label, margin + 4, y + 5.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(String(value), margin + colW + 4, y + 5.5);
      y += 8;
    });
    y += 6;
    drawLine(y);
    y += 8;

    // Predicted Probability
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Predicted Placement Probability', margin, y);
    y += 8;
    pdf.setFontSize(28);
    pdf.setTextColor(...badgeColor);
    pdf.text(`${prob}%`, margin, y + 2);
    y += 14;
    drawLine(y);
    y += 8;

    // SHAP Chart
    const chartEl = document.querySelector('#shap-chart-container .recharts-wrapper');
    if (chartEl) {
      try {
        if (y + 10 > 265) { pdf.addPage(); y = 20; }
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Feature Importance (SHAP Analysis)', margin, y);
        y += 4;
        const chartCanvas = await html2canvas(chartEl, { backgroundColor: '#ffffff', scale: 2 });
        const chartImg = chartCanvas.toDataURL('image/png');
        const chartW = W - 2 * margin - 10;
        let chartH = (chartCanvas.height * chartW) / chartCanvas.width;
        if (chartH > 80) chartH = 80;
        if (y + chartH > 275) { pdf.addPage(); y = 20; }
        pdf.addImage(chartImg, 'PNG', margin + 5, y, chartW, chartH);
        y += chartH + 8;
      } catch (e) {
        console.warn('Could not capture SHAP chart', e);
      }
    }

    // Suggestions
    if (y > 240) { pdf.addPage(); y = 20; }
    drawLine(y);
    y += 8;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Improvement Suggestions', margin, y);
    y += 7;

    const suggestions = prediction.suggestions || [];
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    suggestions.forEach((tip) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFillColor(99, 102, 241);
      pdf.circle(margin + 2.5, y - 1, 1.2, 'F');
      pdf.setTextColor(51, 65, 85);
      const lines = pdf.splitTextToSize(tip, W - 2 * margin - 10);
      pdf.text(lines, margin + 7, y);
      y += lines.length * 4.5 + 3;
    });

    // Footer
    y += 5;
    if (y > 270) { pdf.addPage(); y = 20; }
    drawLine(y, [203, 213, 225]);
    y += 6;
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CareerLens — Placement Prediction Module', margin, y);
    pdf.text('This report was generated using ML-powered analysis. For informational purposes only.', margin, y + 4);

    pdf.save('placement_prediction_report.pdf');
  }, [prediction]);

  // ─── SHAP chart data ───
  const shapData = prediction?.feature_contributions?.map((c) => ({
    name: FEATURE_LABELS[c.feature] || c.feature,
    value: c.absContribution,
    contribution: c.contribution,
  })) || [];

  const probColor = prediction
    ? prediction.placement_probability >= 70 ? 'text-emerald-400'
    : prediction.placement_probability >= 40 ? 'text-amber-400' : 'text-red-400'
    : '';

  const probBg = prediction
    ? prediction.placement_probability >= 70 ? 'bg-emerald-500/20 border-emerald-500/40'
    : prediction.placement_probability >= 40 ? 'bg-amber-500/20 border-amber-500/40' : 'bg-red-500/20 border-red-500/40'
    : '';

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              ML-Powered Prediction
            </span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Placement Probability Predictor
            </h1>
            <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
              Enter your academic and skill details to get an AI-powered placement probability prediction with actionable insights.
            </p>
          </div>

          {/* Form Section */}
          <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-10">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Student Profile
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Fill in your academic, technical, and extracurricular details below.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {FIELDS.map((f) => {
                  const hasErr = !!fieldErrors[f.key];
                  return (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-300 mb-1">{f.label}</label>
                      {f.type === 'select' ? (
                        <select
                          value={form[f.key]}
                          onChange={(e) => onChange(f.key, e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white focus:outline-none focus:ring-2 transition-all ${
                            hasErr
                              ? 'border-red-500/60 focus:ring-red-500/50'
                              : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                          }`}
                        >
                          <option value="" className="bg-slate-900">Select...</option>
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
                          placeholder={f.placeholder}
                          value={form[f.key]}
                          onChange={(e) => onChange(f.key, e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                            hasErr
                              ? 'border-red-500/60 focus:ring-red-500/50'
                              : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                          }`}
                        />
                      )}
                      {hasErr && <p className="mt-1 text-xs text-red-400">{fieldErrors[f.key]}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Predicting...
                    </>
                  ) : (
                    <><Send className="w-4 h-4" /> Predict Placement</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-medium transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            </form>
          </section>

          {/* Results Section */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="prediction-result"
            >
              {/* Probability Display */}
              <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Prediction Result
                    </h2>
                    <p className="text-gray-400 text-sm">Based on your profile, here is your predicted placement probability.</p>
                  </div>
                  <div className={`text-center px-8 py-4 rounded-2xl border ${probBg}`}>
                    <div className={`text-5xl font-bold ${probColor}`}>
                      {prediction.placement_probability}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Placement Probability</div>
                  </div>
                </div>
              </section>

              {/* SHAP Feature Importance */}
              <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-8" id="shap-chart-container">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Feature Importance (SHAP Analysis)
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  This bar chart shows which features influence your placement probability the most.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 12 }} width={95} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(value, name, props) => [
                          `${props.payload.contribution > 0 ? '+' : ''}${props.payload.contribution.toFixed(4)}`,
                          'Contribution',
                        ]}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {shapData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.contribution >= 0 ? '#6366f1' : '#ef4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Suggestions */}
              {prediction.suggestions?.length > 0 && (
                <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Improvement Suggestions
                  </h2>
                  <div className="space-y-3">
                    {prediction.suggestions.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs text-indigo-400 font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-gray-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Download PDF */}
              <div className="text-center">
                <button
                  onClick={downloadPDF}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 font-medium transition-all flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Download PDF Report
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

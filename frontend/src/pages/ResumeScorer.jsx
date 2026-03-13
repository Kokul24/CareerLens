import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { useDropzone } from 'react-dropzone';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer, StaggerItem, CircularGauge, SkeletonCard } from '../components/UIComponents';
import { SearchableDropdown, TARGET_ROLES } from '../components/FormInputs';
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
  Download,
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

  const downloadPDF = () => {
    if (!analysis) return;
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
    pdf.setFillColor(6, 182, 212);
    pdf.rect(0, 45, W, 1.5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CareerLens', margin, 20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Resume Analyser — AI Scoring Report', margin, 28);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 36);

    // Score badge
    const score = analysis.overallScore || 0;
    const badgeColor = score >= 70 ? [16, 185, 129] : score >= 40 ? [245, 158, 11] : [239, 68, 68];
    const badgeBg = score >= 70 ? [6, 78, 59] : score >= 40 ? [120, 53, 15] : [127, 29, 29];
    const badgeText = `Overall Score: ${score}/100`;
    const badgeW = pdf.getTextWidth(badgeText) + 16;
    pdf.setFillColor(...badgeBg);
    pdf.roundedRect(W - margin - badgeW, 14, badgeW, 10, 2, 2, 'F');
    pdf.setTextColor(...badgeColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badgeText, W - margin - badgeW + 8, 21);

    y = 55;

    if (targetRole) {
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Analysis for: ${targetRole}`, margin, y);
      y += 10;
      drawLine(y);
      y += 8;
    }

    // Overall score
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Resume Score', margin, y);
    y += 8;
    pdf.setFontSize(28);
    pdf.setTextColor(...badgeColor);
    pdf.text(`${score}/100`, margin, y + 2);
    y += 14;
    drawLine(y);
    y += 8;

    // Score breakdown table
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score Breakdown', margin, y);
    y += 7;
    const cats = [
      { key: 'atsCompatibility', label: 'ATS Compatibility' },
      { key: 'contentQuality', label: 'Content Quality' },
      { key: 'keywordOptimization', label: 'Keyword Optimization' },
      { key: 'formatting', label: 'Formatting' },
      { key: 'experienceRelevance', label: 'Experience Relevance' },
    ];
    const colW = (W - 2 * margin) / 2;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, W - 2 * margin, 9, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Category', margin + 4, y + 6);
    pdf.text('Score', margin + colW + 4, y + 6);
    y += 9;
    cats.forEach(({ key, label }, i) => {
      const catScore = analysis[key]?.score ?? analysis.analysis?.[key]?.score ?? 0;
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y, W - 2 * margin, 8, 'F');
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(label, margin + 4, y + 5.5);
      const sc = catScore >= 70 ? [16, 185, 129] : catScore >= 40 ? [245, 158, 11] : [239, 68, 68];
      pdf.setTextColor(...sc);
      pdf.text(`${catScore}/100`, margin + colW + 4, y + 5.5);
      const barX = margin + colW + 35;
      const barMaxW = W - margin - barX - 5;
      pdf.setFillColor(226, 232, 240);
      pdf.roundedRect(barX, y + 2, barMaxW, 4, 1, 1, 'F');
      pdf.setFillColor(...sc);
      pdf.roundedRect(barX, y + 2, Math.max(1, (catScore / 100) * barMaxW), 4, 1, 1, 'F');
      y += 8;
    });
    y += 6;
    drawLine(y);
    y += 8;

    // Keywords
    const matchedKws = analysis.keywordOptimization?.matchedKeywords ?? analysis.analysis?.keywordOptimization?.matchedKeywords ?? [];
    const missingKws = analysis.keywordOptimization?.missingKeywords ?? analysis.analysis?.keywordOptimization?.missingKeywords ?? [];
    if (matchedKws.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Matched Keywords', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      const kwLines = pdf.splitTextToSize(matchedKws.join('  •  '), W - 2 * margin - 10);
      pdf.text(kwLines, margin + 4, y);
      y += kwLines.length * 5 + 6;
    }
    if (missingKws.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Missing Keywords', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(239, 68, 68);
      const kwLines = pdf.splitTextToSize(missingKws.join('  •  '), W - 2 * margin - 10);
      pdf.text(kwLines, margin + 4, y);
      y += kwLines.length * 5 + 6;
    }

    // Strengths
    const strengths = analysis.strengths || [];
    if (strengths.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Strengths', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      strengths.forEach((s) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFillColor(16, 185, 129);
        pdf.circle(margin + 2.5, y - 1, 1.2, 'F');
        pdf.setTextColor(51, 65, 85);
        const lines = pdf.splitTextToSize(s, W - 2 * margin - 10);
        pdf.text(lines, margin + 7, y);
        y += lines.length * 4.5 + 3;
      });
      y += 3;
    }

    // Areas for Improvement
    const areas = analysis.areasForImprovement || [];
    if (areas.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Areas for Improvement', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      areas.forEach((a) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFillColor(239, 68, 68);
        pdf.circle(margin + 2.5, y - 1, 1.2, 'F');
        pdf.setTextColor(51, 65, 85);
        const lines = pdf.splitTextToSize(a, W - 2 * margin - 10);
        pdf.text(lines, margin + 7, y);
        y += lines.length * 4.5 + 3;
      });
      y += 3;
    }

    // Recommendations
    const recs = analysis.recommendations || [];
    if (recs.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      recs.forEach((r) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFillColor(99, 102, 241);
        pdf.circle(margin + 2.5, y - 1, 1.2, 'F');
        pdf.setTextColor(51, 65, 85);
        const lines = pdf.splitTextToSize(r, W - 2 * margin - 10);
        pdf.text(lines, margin + 7, y);
        y += lines.length * 4.5 + 3;
      });
      y += 3;
    }

    // Industry Comparison
    if (analysis.industryComparison) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Industry Comparison', margin, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      const lines = pdf.splitTextToSize(String(analysis.industryComparison), W - 2 * margin - 5);
      pdf.text(lines, margin, y);
      y += lines.length * 4.5 + 6;
    }

    // Footer
    if (y + 15 > 280) { pdf.addPage(); y = 20; }
    drawLine(y, [203, 213, 225]);
    y += 6;
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CareerLens — Resume Analyser Module', margin, y);
    pdf.text('This report was generated using AI-powered analysis. For informational purposes only.', margin, y + 4);
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, W - margin - 24, y);
    pdf.save(`resume-analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
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
                          <SearchableDropdown
                            options={TARGET_ROLES}
                            value={targetRole}
                            onChange={setTargetRole}
                            placeholder="Select a target role"
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
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadPDF}
                      className="text-sm px-4 py-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 font-medium transition-all text-white"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </motion.button>
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

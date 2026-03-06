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
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
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

  const downloadPDF = () => {
    if (!roadmap) return;
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
    pdf.text('Career Navigator — AI Skill Roadmap Report', margin, 28);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 36);

    // Experience badge
    const badgeText = `${experienceLevel} Level`;
    const badgeW = pdf.getTextWidth(badgeText) + 16;
    pdf.setFillColor(49, 46, 129);
    pdf.roundedRect(W - margin - badgeW, 14, badgeW, 10, 2, 2, 'F');
    pdf.setTextColor(165, 180, 252);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badgeText, W - margin - badgeW + 8, 21);

    y = 55;

    const role = roadmap.targetRole || targetRole;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Career Roadmap: ${role}`, margin, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Experience Level: ${experienceLevel}`, margin, y);
    y += 8;
    drawLine(y);
    y += 8;

    // Critical Skills
    const criticalSkills = roadmap.skillsToLearn?.filter((s) => s.priority === 'Critical') || [];
    if (criticalSkills.length > 0) {
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Critical Skills to Learn', margin, y);
      y += 7;
      const colW = (W - 2 * margin) / 3;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, y, W - 2 * margin, 9, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Skill', margin + 4, y + 6);
      pdf.text('Est. Time', margin + colW + 4, y + 6);
      pdf.text('Market Demand', margin + colW * 2 + 4, y + 6);
      y += 9;
      criticalSkills.slice(0, 10).forEach((skill, i) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        if (i % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, y, W - 2 * margin, 8, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(skill.name || ''), margin + 4, y + 5.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text(String(skill.estimatedTime || '2–3 weeks'), margin + colW + 4, y + 5.5);
        pdf.setTextColor(99, 102, 241);
        pdf.text(skill.marketDemand ? `${skill.marketDemand}/10` : 'High', margin + colW * 2 + 4, y + 5.5);
        y += 8;
      });
      y += 6;
    }

    // Important Skills
    const importantSkills = roadmap.skillsToLearn?.filter((s) => s.priority === 'Important') || [];
    if (importantSkills.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Important Skills', margin, y);
      y += 7;
      const colW = (W - 2 * margin) / 2;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, y, W - 2 * margin, 9, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Skill', margin + 4, y + 6);
      pdf.text('Est. Time', margin + colW + 4, y + 6);
      y += 9;
      importantSkills.slice(0, 8).forEach((skill, i) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        if (i % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, y, W - 2 * margin, 8, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(skill.name || ''), margin + 4, y + 5.5);
        pdf.setTextColor(245, 158, 11);
        pdf.text(String(skill.estimatedTime || '1–2 weeks'), margin + colW + 4, y + 5.5);
        y += 8;
      });
      y += 6;
    }

    // Current Skills Assessment
    if (roadmap.currentSkillsAssessment?.length > 0) {
      if (y + 10 > 270) { pdf.addPage(); y = 20; }
      drawLine(y);
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Current Skills Assessment', margin, y);
      y += 7;
      const colW = (W - 2 * margin) / 3;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, y, W - 2 * margin, 9, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Skill', margin + 4, y + 6);
      pdf.text('Your Level', margin + colW + 4, y + 6);
      pdf.text('Market Demand', margin + colW * 2 + 4, y + 6);
      y += 9;
      roadmap.currentSkillsAssessment.slice(0, 8).forEach((skill, i) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        if (i % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, y, W - 2 * margin, 8, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(skill.name || ''), margin + 4, y + 5.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text(skill.level != null ? `${skill.level}/10` : 'N/A', margin + colW + 4, y + 5.5);
        pdf.setTextColor(99, 102, 241);
        pdf.text(skill.marketDemand != null ? `${skill.marketDemand}/10` : 'N/A', margin + colW * 2 + 4, y + 5.5);
        y += 8;
      });
      y += 6;
    }

    // Footer
    if (y + 15 > 280) { pdf.addPage(); y = 20; }
    drawLine(y, [203, 213, 225]);
    y += 6;
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CareerLens — Career Navigator Module', margin, y);
    pdf.text('This report was generated using AI-powered analysis. For informational purposes only.', margin, y + 4);
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, W - margin - 24, y);
    pdf.save(`career-roadmap-${(role || 'report').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
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
                      New Search
                    </motion.button>
                  </div>
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

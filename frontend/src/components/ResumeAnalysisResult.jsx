import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, CircularGauge } from './UIComponents';
import {
    BarChart3,
    Shield,
    Award,
    Target,
    FileSearch,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Zap,
    AlertCircle,
    Lightbulb,
} from 'lucide-react';

const ResumeAnalysisResult = ({ analysis }) => {
    if (!analysis) return null;

    const scoreCategories = [
        { key: 'atsCompatibility', label: 'ATS Compatibility', icon: Shield, color: '#6366f1' },
        { key: 'contentQuality', label: 'Content Quality', icon: Award, color: '#06b6d4' },
        { key: 'keywordOptimization', label: 'Keyword Optimization', icon: Target, color: '#a855f7' },
        { key: 'formatting', label: 'Formatting', icon: FileSearch, color: '#f59e0b' },
        { key: 'experienceRelevance', label: 'Experience Relevance', icon: TrendingUp, color: '#22c55e' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Overall Score + Category Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Score */}
                <ScrollReveal>
                    <div className="glass-card p-6 flex flex-col items-center justify-center h-full">
                        <h3 className="text-sm font-medium text-slate-400 mb-4">Overall Score</h3>
                        <CircularGauge value={analysis.overallScore || 0} color="auto" size={200} strokeWidth={12} />
                        <p className="text-sm text-slate-400 mt-4 text-center">
                            {analysis.overallScore >= 80
                                ? 'Excellent! Your resume is well-optimized.'
                                : analysis.overallScore >= 60
                                    ? 'Good, but there\'s room for improvement.'
                                    : analysis.overallScore >= 40
                                        ? 'Needs significant improvements.'
                                        : 'Major overhaul recommended.'}
                        </p>
                    </div>
                </ScrollReveal>

                {/* Category Scores */}
                <ScrollReveal delay={0.1} className="lg:col-span-2">
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Score Breakdown
                        </h3>
                        <div className="space-y-4">
                            {scoreCategories.map((cat, i) => {
                                const score = analysis[cat.key]?.score || analysis.analysis?.[cat.key]?.score || 0;
                                return (
                                    <div key={cat.key}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                                                <span className="text-sm text-slate-300">{cat.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">{score}</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${score}%` }}
                                                transition={{ duration: 1, delay: i * 0.15 }}
                                                className="h-full rounded-full"
                                                style={{ background: `linear-gradient(to right, ${cat.color}, ${cat.color}88)` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Keywords Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                <ScrollReveal>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            Matched Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.keywordOptimization?.matchedKeywords || analysis.analysis?.keywordOptimization?.matchedKeywords || []).map((kw, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400"
                                >
                                    {kw}
                                </motion.span>
                            ))}
                            {(analysis.keywordOptimization?.matchedKeywords || analysis.analysis?.keywordOptimization?.matchedKeywords || []).length === 0 && (
                                <p className="text-sm text-slate-500">No matched keywords found</p>
                            )}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Missing Keywords */}
                <ScrollReveal delay={0.1}>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.keywordOptimization?.missingKeywords || analysis.analysis?.keywordOptimization?.missingKeywords || []).map((kw, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"
                                >
                                    {kw}
                                </motion.span>
                            ))}
                            {(analysis.keywordOptimization?.missingKeywords || analysis.analysis?.keywordOptimization?.missingKeywords || []).length === 0 && (
                                <p className="text-sm text-slate-500">No missing keywords — great job!</p>
                            )}
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollReveal>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {(analysis.strengths || []).map((s, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2.5"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-300">{s}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {(analysis.areasForImprovement || []).map((a, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2.5"
                                >
                                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-300">{a}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </ScrollReveal>
            </div>

            {/* Recommendations */}
            <ScrollReveal>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-indigo-400" />
                        Personalized Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(analysis.recommendations || []).map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                            >
                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                                </div>
                                <span className="text-sm text-slate-300">{r}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ScrollReveal>

            {/* Industry Comparison */}
            {analysis.industryComparison && (
                <ScrollReveal>
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            Industry Comparison
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{analysis.industryComparison}</p>
                    </div>
                </ScrollReveal>
            )}
        </div>
    );
};

export default ResumeAnalysisResult;

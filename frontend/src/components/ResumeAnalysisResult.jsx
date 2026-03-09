import React from 'react';
import { motion } from 'framer-motion';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts';
import { ScrollReveal } from './UIComponents';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Zap,
    AlertCircle,
    Lightbulb,
    Gauge,
} from 'lucide-react';

const clampScore = (value) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return 0;
    return Math.max(0, Math.min(100, numeric));
};

const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
};

const toDisplayData = (analysis) => {
    const atsScore = clampScore(
        analysis?.ats_score ??
            analysis?.overallScore ??
            analysis?.analysis?.atsCompatibility?.score ??
            analysis?.atsCompatibility?.score
    );

    const sectionScores = analysis?.section_scores || {
        technical_skills: clampScore(analysis?.analysis?.keywordOptimization?.score ?? analysis?.keywordOptimization?.score),
        projects: clampScore(analysis?.analysis?.experienceRelevance?.score ?? analysis?.experienceRelevance?.score),
        certifications: clampScore(analysis?.analysis?.contentQuality?.score ?? analysis?.contentQuality?.score),
        experience: clampScore(analysis?.analysis?.experienceRelevance?.score ?? analysis?.experienceRelevance?.score),
        communication: clampScore(analysis?.analysis?.contentQuality?.score ?? analysis?.contentQuality?.score),
        resume_structure: clampScore(analysis?.analysis?.formatting?.score ?? analysis?.formatting?.score),
    };

    const matched =
        analysis?.keyword_analysis?.matched ??
        analysis?.analysis?.keywordOptimization?.matchedKeywords?.length ??
        analysis?.keywordOptimization?.matchedKeywords?.length ??
        0;

    const missing =
        analysis?.keyword_analysis?.missing ??
        analysis?.analysis?.keywordOptimization?.missingKeywords?.length ??
        analysis?.keywordOptimization?.missingKeywords?.length ??
        0;

    const suggested =
        analysis?.keyword_analysis?.suggested ??
        analysis?.recommendations?.length ??
        0;

    return { atsScore, sectionScores, matched, missing, suggested };
};

const ATSGauge = ({ score }) => {
    const size = 220;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const gaugeColor = getScoreColor(score);

    return (
        <div className="glass-card p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                ATS Score Gauge
            </h3>

            <div className="flex items-center justify-center">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={gaugeColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${progress} ${circumference - progress}`}
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${progress} ${circumference - progress}` }}
                            transition={{ duration: 1.1, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor}55)` }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white">{score}%</span>
                        <span className="text-xs mt-1" style={{ color: gaugeColor }}>
                            {score >= 70
                                ? 'Strong ATS Readiness'
                                : score >= 40
                                    ? 'Moderate ATS Readiness'
                                    : 'Low ATS Readiness'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-5 mt-4 text-xs">
                <span className="text-green-400">70-100: Green</span>
                <span className="text-amber-400">40-69: Yellow</span>
                <span className="text-red-400">0-39: Red</span>
            </div>
        </div>
    );
};

const ResumeAnalysisResult = ({ analysis }) => {
    if (!analysis) return null;

    const { atsScore, sectionScores, matched, missing, suggested } = toDisplayData(analysis);
    const sectionBarData = [
        { name: 'Technical Skills', value: clampScore(sectionScores.technical_skills), color: '#22c55e' },
        { name: 'Projects', value: clampScore(sectionScores.projects), color: '#06b6d4' },
        { name: 'Certifications', value: clampScore(sectionScores.certifications), color: '#818cf8' },
        { name: 'Experience', value: clampScore(sectionScores.experience), color: '#f59e0b' },
        { name: 'Communication', value: clampScore(sectionScores.communication), color: '#a78bfa' },
        { name: 'Resume Structure', value: clampScore(sectionScores.resume_structure), color: '#38bdf8' },
    ];

    const keywordData = [
        { name: 'Matched Keywords', value: matched, color: '#22c55e' },
        { name: 'Missing Keywords', value: missing, color: '#ef4444' },
        { name: 'Suggested Keywords', value: suggested, color: '#06b6d4' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ScrollReveal>
                    <ATSGauge score={atsScore} />
                </ScrollReveal>

                <ScrollReveal delay={0.08}>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Resume Strength Bar Chart
                        </h3>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sectionBarData} barCategoryGap={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                                    <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={55} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15,23,42,0.96)',
                                            border: '1px solid rgba(148,163,184,0.25)',
                                            borderRadius: 10,
                                            color: '#e2e8f0',
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {sectionBarData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={0.1}>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        Keyword Match Bar Chart
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywordData} barCategoryGap={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                                <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15,23,42,0.96)',
                                        border: '1px solid rgba(148,163,184,0.25)',
                                        borderRadius: 10,
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {keywordData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-3 text-green-300 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Matched: {matched}
                        </div>
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-red-300 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Missing: {missing}
                        </div>
                        <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3 text-cyan-300 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> Suggested: {suggested}
                        </div>
                    </div>
                </div>
            </ScrollReveal>

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
                        Suggestions for Improvement
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

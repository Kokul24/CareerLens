import React from 'react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip,
} from 'recharts';
import { StaggerContainer, StaggerItem, ScrollReveal } from './UIComponents';
import {
    Target,
    AlertCircle,
    Clock,
    DollarSign,
    BarChart3,
    TrendingUp,
    Zap,
    BookOpen,
} from 'lucide-react';

const RoadmapResult = ({ roadmap }) => {
    if (!roadmap) return null;

    // Prepare radar chart data
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

    const totalSkills = roadmap?.skillsToLearn?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
                {[
                    { label: 'Total Skills', value: totalSkills, icon: Target, color: 'text-indigo-400' },
                    { label: 'Critical', value: criticalSkills.length, icon: AlertCircle, color: 'text-red-400' },
                    { label: 'Est. Time', value: roadmap.estimatedCompletionTime || 'N/A', icon: Clock, color: 'text-cyan-400', isText: true },
                    { label: 'Salary Boost', value: roadmap.salaryBoost || 'N/A', icon: DollarSign, color: 'text-green-400', isText: true },
                ].map((card, i) => (
                    <StaggerItem key={i}>
                        <motion.div whileHover={{ y: -2 }} className="glass-card p-4 text-center h-full flex flex-col justify-center">
                            <card.icon className={`w-5 h-5 ${card.color} mx-auto mb-2`} />
                            <div className="text-xl font-bold text-white">{card.isText ? card.value : card.value}</div>
                            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
                        </motion.div>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Radar Chart + Career Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                {radarData.length > 0 && (
                    <ScrollReveal>
                        <div className="glass-card p-6 h-full">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-400" />
                                Skills Assessment
                            </h3>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                        <PolarAngleAxis
                                            dataKey="skill"
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={30}
                                            domain={[0, 10]}
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Skill Level"
                                            dataKey="level"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                            animationDuration={1500}
                                        />
                                        <Radar
                                            name="Market Demand"
                                            dataKey="demand"
                                            stroke="#06b6d4"
                                            fill="#06b6d4"
                                            fillOpacity={0.1}
                                            strokeWidth={2}
                                            animationDuration={1500}
                                            animationBegin={300}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                color: '#e2e8f0',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="text-xs text-slate-400">Skill Level</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                                    <span className="text-xs text-slate-400">Market Demand</span>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* Career Path */}
                <ScrollReveal delay={0.1}>
                    <div className="glass-card p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Career Path
                        </h3>
                        {roadmap.careerPath && (
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">{roadmap.careerPath}</p>
                        )}

                        {/* Market demand bars */}
                        <div className="space-y-3">
                            {criticalSkills.slice(0, 6).map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300">{skill.name}</span>
                                        <span className="text-slate-500">{skill.salaryImpact}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(skill.currentDemand || 7) * 10}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Skills by Priority */}
            {[
                { title: 'Critical Skills', skills: criticalSkills, color: 'red', icon: AlertCircle },
                { title: 'Important Skills', skills: importantSkills, color: 'amber', icon: Zap },
                { title: 'Optional Skills', skills: optionalSkills, color: 'green', icon: BookOpen },
            ].map((section) => (
                section.skills.length > 0 && (
                    <ScrollReveal key={section.title}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                            {section.title}
                            <span className="text-xs text-slate-500 font-normal">({section.skills.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.skills.map((skill, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -3 }}
                                    className="glass-card-hover p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-sm font-medium text-white">{skill.name}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${section.color}-500/10 text-${section.color}-400 border border-${section.color}-500/20`}>
                                            {skill.priority}
                                        </span>
                                    </div>
                                    {skill.description && (
                                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{skill.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {skill.estimatedTime && (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Clock className="w-3 h-3" /> {skill.estimatedTime}
                                            </span>
                                        )}
                                        {skill.salaryImpact && (
                                            <span className="flex items-center gap-1 text-green-400">
                                                <TrendingUp className="w-3 h-3" /> {skill.salaryImpact}
                                            </span>
                                        )}
                                    </div>
                                    {/* Demand bar */}
                                    {skill.currentDemand && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Market Demand</span>
                                                <span className="text-slate-400">{skill.currentDemand}/10</span>
                                            </div>
                                            <div className="h-1 rounded-full bg-white/[0.06]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.currentDemand * 10}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className={`h-full rounded-full bg-gradient-to-r from-${section.color}-500 to-${section.color}-400`}
                                                    style={{
                                                        background: section.color === 'red'
                                                            ? 'linear-gradient(to right, #ef4444, #f87171)'
                                                            : section.color === 'amber'
                                                                ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                                                                : 'linear-gradient(to right, #22c55e, #4ade80)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </ScrollReveal>
                )
            ))}
        </div>
    );
};

export default RoadmapResult;

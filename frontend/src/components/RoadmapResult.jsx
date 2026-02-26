import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Target,
    AlertCircle,
    Clock,
    BarChart3,
    Zap,
    BookOpen,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    Award,
    TrendingUp
} from 'lucide-react';

const RoadmapResult = ({ roadmap }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSkills, setCompletedSkills] = useState(new Set());

    if (!roadmap) return null;

    // Categorize skills
    const criticalSkills = roadmap?.skillsToLearn?.filter((s) => s.priority === 'Critical') || [];
    const importantSkills = roadmap?.skillsToLearn?.filter((s) => s.priority === 'Important') || [];

    // Page 1 Data: Top 5 Critical and 3 Important
    const topCritical = criticalSkills.slice(0, 5);
    const topImportant = importantSkills.slice(0, 3);
    const page1Skills = [...topCritical, ...topImportant];

    // Progress Calculation
    const toggleSkill = (skillName) => {
        const newCompleted = new Set(completedSkills);
        if (newCompleted.has(skillName)) {
            newCompleted.delete(skillName);
        } else {
            newCompleted.add(skillName);
        }
        setCompletedSkills(newCompleted);
    };

    const progress = page1Skills.length > 0 ? Math.round((completedSkills.size / page1Skills.length) * 100) : 0;

    // Page 2 Data: Visualization with Fallback
    const rawRadarData = roadmap?.currentSkillsAssessment?.length > 0
        ? roadmap.currentSkillsAssessment
        : (roadmap?.skillsToLearn?.length > 0 ? roadmap.skillsToLearn : [
            { name: "System Design", marketDemand: 9 },
            { name: "Cloud Arch", marketDemand: 8 },
            { name: "DevOps", marketDemand: 7 },
            { name: "Security", marketDemand: 9 },
            { name: "AI/ML", marketDemand: 8 },
            { name: "Frontend", marketDemand: 6 }
        ]);

    const radarData = rawRadarData.slice(0, 6).map((s) => ({
        skill: s.name?.length > 10 ? s.name.slice(0, 10) + '..' : (s.name || 'Skill'),
        level: s.level || Math.floor(Math.random() * 5) + 3,
        demand: s.marketDemand || Math.floor(Math.random() * 4) + 6, // Ensure demand is visible (6-10)
    }));

    // Simple mock data for gap analysis based on critical skills
    const skillGapData = topCritical.length > 0 ? topCritical.map(s => ({
        name: s.name.length > 10 ? s.name.slice(0, 10) + '..' : s.name,
        required: 9,
        current: Math.floor(Math.random() * 4) + 2
    })) : [
        { name: "System Design", required: 9, current: 4 },
        { name: "Cloud AWS", required: 9, current: 3 },
        { name: "Microservices", required: 8, current: 5 },
    ];

    // Page 3 Data: Courses (Mock)
    const courses = [
        { title: 'The Complete Web Developer Bootcamp', platform: 'Udemy', link: 'https://www.udemy.com/', color: 'from-purple-500 to-pink-500', logo: 'https://logo.clearbit.com/udemy.com' },
        { title: 'Machine Learning Specialization', platform: 'Coursera', link: 'https://www.coursera.org/', color: 'from-blue-500 to-cyan-500', logo: 'https://logo.clearbit.com/coursera.org' },
        { title: 'CS50: Introduction to Computer Science', platform: 'Harvard (edX)', link: 'https://www.edx.org/', color: 'from-neutral-700 to-neutral-500', logo: 'https://logo.clearbit.com/edx.org' },
        { title: 'Data Science Fundamentals', platform: 'Khan Academy', link: 'https://www.khanacademy.org/', color: 'from-green-500 to-emerald-500', logo: 'https://logo.clearbit.com/khanacademy.org' },
        { title: 'React - The Complete Guide', platform: 'Udemy', link: 'https://www.udemy.com/', color: 'from-blue-400 to-indigo-500', logo: 'https://logo.clearbit.com/udemy.com' },
        { title: 'Google Data Analytics Certificate', platform: 'Coursera', link: 'https://www.coursera.org/', color: 'from-yellow-500 to-orange-500', logo: 'https://logo.clearbit.com/coursera.org' },
        { title: 'AWS Certified Solutions Architect', platform: 'Udemy', link: 'https://www.udemy.com/', color: 'from-orange-400 to-red-500', logo: 'https://logo.clearbit.com/udemy.com' },
        { title: 'Introduction to Artificial Intelligence', platform: 'Udacity', link: 'https://www.udacity.com/', color: 'from-teal-500 to-green-500', logo: 'https://logo.clearbit.com/udacity.com' },
        { title: 'Full Stack Open', platform: 'University of Helsinki', link: 'https://fullstackopen.com/en/', color: 'from-indigo-600 to-purple-600', logo: 'https://logo.clearbit.com/helsinki.fi' },
        { title: 'Python for Everybody', platform: 'Coursera', link: 'https://www.coursera.org/', color: 'from-blue-600 to-blue-400', logo: 'https://logo.clearbit.com/coursera.org' }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Steps Indicator */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-2 rounded-full border border-white/10">
                    {[1, 2, 3].map(step => (
                        <button
                            key={step}
                            onClick={() => setCurrentStep(step)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-110'
                                : 'bg-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {step}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {/* PAGE 1: Skills & Progress */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Target className="w-6 h-6 text-indigo-400" />
                                            Your Learning Path
                                        </h3>
                                        <p className="text-slate-400 text-sm">Track your progress on top priority skills</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-indigo-400">{progress}%</span>
                                        <span className="text-xs text-slate-500 block uppercase tracking-wider">Completed</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden relative mb-2">
                                    <motion.div
                                        className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, type: "spring" }}
                                    />
                                    {/* Stripes/Pattern overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-30" />
                                </div>
                                <p className="text-xs text-slate-500 text-right">
                                    {completedSkills.size} of {page1Skills.length} skills mastered
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {/* Critical Skills */}
                                <div>
                                    <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Critical Difficulty (Top 5)
                                    </h4>
                                    <div className="space-y-3">
                                        {topCritical.length > 0 ? topCritical.map((skill, i) => (
                                            <motion.div
                                                key={skill.name}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`glass-card p-4 flex items-center gap-4 transition-all ${completedSkills.has(skill.name)
                                                    ? 'border-green-500/30 bg-green-500/5'
                                                    : 'border-white/10 hover:border-indigo-500/30'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleSkill(skill.name)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${completedSkills.has(skill.name)
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-slate-500 hover:border-indigo-400'
                                                        }`}
                                                >
                                                    {completedSkills.has(skill.name) && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                                <div className="flex-1">
                                                    <h5 className={`font-medium ${completedSkills.has(skill.name) ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                        {skill.name}
                                                    </h5>
                                                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                                                        {skill.description && <span className="line-clamp-1">{skill.description}</span>}
                                                        <span className="text-indigo-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {skill.estimatedTime || '2 weeks'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <p className="text-slate-500 text-sm">No critical skills found.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Important Skills */}
                                <div>
                                    <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Next Tier (Important)
                                    </h4>
                                    <div className="space-y-3">
                                        {topImportant.length > 0 ? topImportant.map((skill, i) => (
                                            <motion.div
                                                key={skill.name}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + (i * 0.1) }}
                                                className={`glass-card p-4 flex items-center gap-4 transition-all opacity-90 hover:opacity-100 ${completedSkills.has(skill.name)
                                                    ? 'border-green-500/30 bg-green-500/5'
                                                    : 'border-white/10 hover:border-amber-500/30'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleSkill(skill.name)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${completedSkills.has(skill.name)
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-slate-500 hover:border-amber-400'
                                                        }`}
                                                >
                                                    {completedSkills.has(skill.name) && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                                <div className="flex-1">
                                                    <h5 className={`font-medium ${completedSkills.has(skill.name) ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                        {skill.name}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 mt-1">Secondary Priority</p>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <p className="text-slate-500 text-sm">No additional important skills found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PAGE 2: Visualizations */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CARD 1: Skill Profile (Radar) */}
                                <div className="glass-card p-6 flex flex-col h-full">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Target className="w-5 h-5 text-blue-400" />
                                            Market Trend Analysis
                                        </h3>
                                        <p className="text-sm text-slate-400">Skills in high demand for this role</p>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis
                                                    dataKey="skill"
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={30}
                                                    domain={[0, 10]}
                                                    tick={false}
                                                    axisLine={false}
                                                />
                                                <Radar
                                                    name="Market Demand"
                                                    dataKey="demand"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fill="#3b82f6"
                                                    fillOpacity={0.3}
                                                    isAnimationActive={false}
                                                    dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                                    label={{ fill: '#e2e8f0', fontSize: 10, position: 'top' }}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                    }}
                                                    itemStyle={{ color: '#e2e8f0' }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Info Section beneath */}
                                    <div className="mt-auto grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
                                        <div>
                                            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Trending Now
                                            </h4>
                                            <ul className="text-xs text-slate-300 space-y-1.5">
                                                {radarData.filter(d => d.demand >= 8).slice(0, 3).map(d => (
                                                    <li key={d.skill} className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                        {d.skill}
                                                    </li>
                                                ))}
                                                {radarData.filter(d => d.demand >= 8).length === 0 && <li>All skills balanced.</li>}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Peak Demand
                                            </h4>
                                            <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2 border border-white/5">
                                                The market highly values <span className="text-white font-medium block mt-1">{radarData.reduce((prev, current) => (prev.demand > current.demand) ? prev : current, { demand: 0, skill: 'Core Skills' }).skill}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: Strategic Gaps (Bar) */}
                                <div className="glass-card p-6 flex flex-col h-full">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-red-400" />
                                            Critical Gaps
                                        </h3>
                                        <p className="text-sm text-slate-400">High priority skills to acquire</p>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={skillGapData.map(d => ({
                                                    ...d,
                                                    gap: 10 - d.current
                                                }))}
                                                layout="vertical"
                                                margin={{ left: 40, right: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis type="number" domain={[0, 10]} hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                    width={100}
                                                />
                                                <RechartsTooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="current"
                                                    name="Current Proficiency"
                                                    stackId="a"
                                                    fill="#6366f1"
                                                    radius={[0, 0, 0, 0]}
                                                    barSize={20}
                                                    isAnimationActive={false}
                                                />
                                                <Bar
                                                    dataKey="gap"
                                                    name="Skill Gap"
                                                    stackId="a"
                                                    fill="#1e293b"
                                                    radius={[0, 4, 4, 0]}
                                                    barSize={20}
                                                    isAnimationActive={false}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Restored Legend */}
                                    <div className="flex items-center justify-center gap-6 mt-[-10px] mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                                            <span className="text-xs text-slate-400">Prior Knowledge</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-slate-800" />
                                            <span className="text-xs text-slate-400">Learning Gap</span>
                                        </div>
                                    </div>

                                    {/* Info Section beneath */}
                                    <div className="mt-auto grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
                                        <div>
                                            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Difficulty
                                            </h4>
                                            <ul className="text-xs text-slate-300 space-y-1.5">
                                                {/* Assuming 'Critical' implies difficulty or importance */}
                                                {topCritical.slice(0, 3).map(s => (
                                                    <li key={s.name} className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-sm bg-red-400"></div>
                                                        {s.name}
                                                    </li>
                                                ))}
                                                {topCritical.length === 0 && <li>No critical gaps.</li>}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Impact
                                            </h4>
                                            <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2 border border-white/5">
                                                Mastering <span className="text-white font-medium">{topCritical[0]?.name || "these skills"}</span> is crucial. The dark gap shows what you need to learn.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PAGE 3: Recommended Courses */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-400" />
                                Top Recommended Courses
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {courses.map((course, i) => (
                                    <motion.div
                                        key={course.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="group relative overflow-hidden rounded-xl glass-card border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
                                        onClick={() => window.open(course.link, '_blank')}
                                    >
                                        <div className={`h-28 bg-gradient-to-br ${course.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative`}>
                                            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg p-3">
                                                <img
                                                    src={course.logo}
                                                    alt={course.platform}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                                <BookOpen className="w-8 h-8 text-black hidden" style={{ display: 'none' }} />
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">
                                                {course.platform}
                                            </div>
                                            <h4 className="text-white font-medium leading-snug mb-3">
                                                {course.title}
                                            </h4>
                                            <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors">
                                                Go to course <ExternalLink className="w-3 h-3 ml-2" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${currentStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex gap-2">
                    {/* Indicator dots */}
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`w-2 h-2 rounded-full transition-all ${currentStep === step ? 'bg-indigo-500 w-6' : 'bg-slate-700'}`} />
                    ))}
                </div>
                <button
                    onClick={nextStep}
                    disabled={currentStep === 3}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all ${currentStep === 3
                        ? 'opacity-0 pointer-events-none'
                        : 'opacity-100 shadow-lg shadow-indigo-500/20'
                        }`}
                >
                    Next Step <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default RoadmapResult;

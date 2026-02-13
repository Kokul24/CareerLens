import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from '../components/UIComponents';
import {
  Sparkles,
  Zap,
  Brain,
  FileSearch,
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  Compass,
  FileText,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Mail,
} from 'lucide-react';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEmailSubmitted(true);
      setTimeout(() => setEmailSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-300">AI-Powered Career Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Navigate Your</span>
            <br />
            <span className="gradient-text">Career Path</span>
            <br />
            <span className="text-white">with AI Precision</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Analyze your resume with AI, discover skill gaps, and get a personalized
            career roadmap — all powered by Google Gemini.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-base px-8 py-4 flex items-center gap-2 shadow-glow-md"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Hero glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6" staggerDelay={0.15}>
            {[
              { value: 200, suffix: '+', label: 'Active Users', icon: Star, color: 'from-indigo-500 to-purple-500' },
              { value: 0, suffix: '', label: 'AI-Powered', icon: Brain, color: 'from-cyan-500 to-blue-500', isText: true, text: 'Gemini' },
              { value: 0, suffix: '', label: 'Resume Intelligence', icon: Shield, color: 'from-purple-500 to-pink-500', isText: true, text: 'ATS' },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-card-hover p-6 text-center"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.isText ? stat.text : <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
                  </div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Everything You Need to <span className="gradient-text">Succeed</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Comprehensive AI-driven tools to analyze, plan, and accelerate your career growth.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {[
              {
                icon: FileSearch,
                title: 'ATS Resume Scoring',
                description: 'Get your resume scored against real ATS systems with detailed category breakdowns and actionable fixes.',
                color: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Compass,
                title: 'AI Career Navigator',
                description: 'Generate personalized skill roadmaps with priority rankings, time estimates, and salary projections.',
                color: 'from-cyan-500 to-teal-500',
              },
              {
                icon: Target,
                title: 'Keyword Optimization',
                description: 'Discover matched and missing keywords to ensure your resume passes automated screening.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: BarChart3,
                title: 'Spider Chart Analysis',
                description: 'Visual radar charts showing your skill distribution across critical, important, and optional categories.',
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: TrendingUp,
                title: 'Salary Impact Projections',
                description: 'See projected salary boosts for each skill you learn, with market demand analysis.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Brain,
                title: 'Gemini AI Integration',
                description: 'Powered by Google\'s Gemini AI for deep, contextual analysis and personalized recommendations.',
                color: 'from-rose-500 to-red-500',
              },
            ].map((feature, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="glass-card-hover p-6 h-full group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-shadow`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] mb-4">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">How It Works</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Three Steps to <span className="gradient-text-alt">Career Clarity</span>
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className="space-y-8" staggerDelay={0.2}>
            {[
              {
                step: '01',
                title: 'Upload & Analyze',
                description: 'Upload your resume or enter your target role. Our AI analyzes every detail against industry standards.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Get AI Insights',
                description: 'Receive comprehensive scoring, skill gap analysis, and personalized recommendations powered by Gemini AI.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Level Up',
                description: 'Follow your customized roadmap, track progress, and watch your career readiness score climb.',
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ x: 8 }}
                  className="glass-card-hover p-6 sm:p-8 flex items-start gap-6"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold gradient-text">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      {item.title}
                      <item.icon className="w-5 h-5 text-indigo-400" />
                    </h3>
                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-sm text-slate-500 mb-8 uppercase tracking-wider font-medium">Built With Modern Tech</p>
          </ScrollReveal>
          <StaggerContainer className="flex flex-wrap items-center justify-center gap-6" staggerDelay={0.05}>
            {['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Redux', 'Node.js', 'MongoDB', 'Gemini AI', 'Recharts'].map(
              (tech, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 hover:text-white hover:border-indigo-500/30 transition-all cursor-default"
                  >
                    {tech}
                  </motion.div>
                </StaggerItem>
              )
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== EMAIL SUBSCRIPTION ===== */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-500/10 blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Stay Ahead of the <span className="gradient-text">Curve</span>
                </h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Get weekly AI career insights, industry trends, and exclusive tips delivered to your inbox.
                </p>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <div className="relative flex-1 w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="input-glass pl-10 w-full"
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary whitespace-nowrap px-6 py-3 w-full sm:w-auto"
                  >
                    {emailSubmitted ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Subscribed!
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your <span className="gradient-text">Career?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals using AI to navigate their career path with confidence.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-10 py-4 shadow-glow-lg inline-flex items-center gap-2"
              >
                Start Free Now
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// Scroll-based reveal wrapper
const ScrollReveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger children container
const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated counter
const AnimatedCounter = ({ value, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value);
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration, inView]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
};

// Skeleton loader
const SkeletonLoader = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`shimmer-bg rounded-xl ${className}`} />
    ))}
  </>
);

// Skeleton card
const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-3 w-full" />
    <SkeletonLoader className="h-3 w-5/6" />
    <div className="flex gap-2 pt-2">
      <SkeletonLoader className="h-8 w-20" />
      <SkeletonLoader className="h-8 w-20" />
    </div>
  </div>
);

// Circular progress gauge
const CircularGauge = ({ value, size = 180, strokeWidth = 10, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v) => {
    if (v >= 80) return '#22c55e';
    if (v >= 60) return '#06b6d4';
    if (v >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const gaugeColor = color === 'auto' ? getColor(value) : color;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${gaugeColor}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-slate-400 mt-0.5">out of 100</span>
      </div>
    </div>
  );
};

export {
  PageTransition,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  SkeletonLoader,
  SkeletonCard,
  CircularGauge,
};

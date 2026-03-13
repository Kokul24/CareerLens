import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export const SearchableDropdown = ({ options, value, onChange, placeholder = 'Select a role' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="input-glass flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-white" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-slate-700/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-slate-500"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors ${
                      value === option 
                        ? 'bg-indigo-500/20 text-indigo-300' 
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option}
                    {value === option && <Check className="w-4 h-4" />}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500 text-center">
                  No roles found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SkillMultiSelect = ({ availableSkills, value, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddSkill = (skill) => {
    if (!value.includes(skill)) {
      onChange([...value, skill]);
    }
    setInputValue('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!value.includes(newSkill)) {
        onChange([...value, newSkill]);
      }
      setInputValue('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="input-glass min-h-[50px] flex flex-wrap gap-2 items-center !py-2">
        {value.map((skill) => (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={skill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="p-0.5 hover:bg-indigo-500/30 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-white placeholder-slate-400 flex-1 min-w-[120px] text-sm"
          placeholder={value.length === 0 ? "Type or select skills..." : ""}
        />
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-2 font-medium">Suggested combinations:</p>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleAddSkill(skill)}
              disabled={value.includes(skill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                value.includes(skill)
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TARGET_ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Data Engineer', 'AI Engineer', 'Cybersecurity Engineer', 'Blockchain Developer', 'Mobile App Developer', 'Game Developer', 'Embedded Systems Engineer', 'Site Reliability Engineer', 'Database Administrator', 'Systems Engineer', 'Network Engineer', 'QA Engineer', 'Automation Engineer'];
export const SKILL_OPTIONS = ['Python', 'Java', 'JavaScript', 'C', 'C++', 'Go', 'Rust', 'React', 'Node.js', 'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot', 'MongoDB', 'MySQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Git', 'HTML', 'CSS', 'Express.js'];

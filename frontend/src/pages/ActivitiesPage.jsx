import React from 'react';
import ActivitiesForm from '../components/ActivitiesForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
            📋 Activity Tracker
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Activities Management
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Track, organize, and manage your extracurricular and academic activities in one place.
          </p>
        </div>

        <ActivitiesForm />
      </div>

      <Footer />
    </div>
  );
}

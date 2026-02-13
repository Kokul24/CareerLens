
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CareerNavigator from './pages/CareerNavigator';
import ResumeScorer from './pages/ResumeScorer';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/career-navigator" element={
                    <ProtectedRoute>
                        <CareerNavigator />
                    </ProtectedRoute>
                } />
                <Route path="/resume-scorer" element={
                    <ProtectedRoute>
                        <ResumeScorer />
                    </ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;

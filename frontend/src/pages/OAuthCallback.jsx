import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Dispatch to Redux store
        dispatch(setCredentials({ token, user }));

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Something went wrong. Redirecting...');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      setError('Invalid OAuth response. Redirecting...');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-400 text-lg">{error}</div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-white text-lg">Signing you in with Google...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;

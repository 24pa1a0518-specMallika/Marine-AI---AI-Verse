import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Anchor, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, Compass } from 'lucide-react';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, loginWithGoogle, resetPassword, isFirebaseConfigured } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (forgotPassword) {
        if (!email) {
          setError('Please enter your registered email address.');
          setSubmitting(false);
          return;
        }
        await resetPassword(email);
        setMessage('Password reset instructions have been sent to your email.');
        setSubmitting(false);
        return;
      }

      if (isSignup) {
        if (!displayName.trim()) {
          setError('Please provide your name or vessel handle.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('[Auth Error]', err);
      let errMsg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-email') errMsg = 'Invalid email address format.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password.';
      }
      if (err.code === 'auth/email-already-in-use') errMsg = 'This email is already registered. Please sign in.';
      if (err.code === 'auth/weak-password') errMsg = 'Password must be at least 6 characters.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('[Google Sign In Error]', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled: Google authentication popup was closed.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by your browser. Please allow popups.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled yet in your Firebase Project. Enable it in Firebase Console → Authentication → Sign-in method.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email but different sign-in method.');
      } else {
        setError(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login('mariner.demo@marineai.gov', 'demo123456');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError('Could not initialize demo session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.1),transparent_50%)] pointer-events-none" />

      {/* Language Switcher in top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg">
        <span className="text-xs text-slate-400 font-medium">{t('language')}:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-xs font-semibold text-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="EN" className="bg-slate-900 text-slate-200">English (EN)</option>
          <option value="TE" className="bg-slate-900 text-slate-200">తెలుగు (TE)</option>
          <option value="TA" className="bg-slate-900 text-slate-200">தமிழ் (TA)</option>
          <option value="HI" className="bg-slate-900 text-slate-200">हिन्दी (HI)</option>
        </select>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl shadow-xl shadow-cyan-950/40 mb-3">
            <Anchor className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            Marine AI
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono font-medium">
              V2.4
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Coastal Maritime & Fishing Intelligence Platform
          </p>
        </div>

        {/* Auth Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl p-7">
          {/* Tabs */}
          {!forgotPassword && (
            <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setIsSignup(false); setError(''); setMessage(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  !isSignup
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => { setIsSignup(true); setError(''); setMessage(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  isSignup
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('signup')}
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && !forgotPassword && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name / Vessel Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Captain Raju / Sea Explorer"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariner@example.com"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            {!forgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() => { setForgotPassword(true); setError(''); setMessage(''); }}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : forgotPassword ? (
                'Send Reset Instructions'
              ) : isSignup ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!forgotPassword && (
            <>
              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-slate-900/90 px-2.5 text-slate-500 font-medium tracking-wider">
                    {t('or_continue_with') || 'Or continue with'}
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                id="google-signin-btn"
                className="w-full py-2.5 px-4 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('sign_in_with_google') || 'Sign in with Google'}</span>
              </button>
            </>
          )}

          {forgotPassword && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setForgotPassword(false); setError(''); setMessage(''); }}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={submitting}
              className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Demo Access (Local Session)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              {isFirebaseConfigured
                ? 'Connected to Firebase Auth & Firestore'
                : 'Local Persistence Engine Active (Ready for Firebase keys in .env)'}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-600">
          Marine AI Intelligence Platform • INCOIS & IMD Integrated
        </div>
      </div>
    </div>
  );
}

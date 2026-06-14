import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, authNotice } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const redirectAfterAuth = (user) => {
    const target = location.state?.from?.pathname || (user.profileComplete ? '/home' : '/complete-profile');
    navigate(target, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password, remember });
      redirectAfterAuth(user);
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      setLoading(true);
      const user = await googleLogin();
      redirectAfterAuth(user);
    } catch (googleError) {
      setError(googleError.message || 'Google login is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:flex-row">

      {/* LEFT — Brand Panel */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center px-6 py-16 lg:py-0 relative overflow-hidden bg-gradient-to-br from-primary to-accent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]"></div>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 relative z-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-glow backdrop-blur-sm">
            <Send size={28} className="text-white" />
          </div>
          <span className="font-poppins text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Traveloop</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-white/75 text-lg text-center relative z-10 max-w-sm"
        >
          Sign in to continue your journey
        </motion.p>
      </div>

      {/* RIGHT — Form Panel */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 bg-white rounded-t-[40px] lg:rounded-t-none lg:rounded-l-[48px] px-6 sm:px-10 pt-12 pb-10 flex flex-col justify-center w-full shadow-[-4px_0_30px_rgba(0,0,0,0.06)] relative z-20"
      >
        <div className="max-w-[380px] mx-auto w-full">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-8 mx-auto lg:hidden"></div>
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-textDark mb-2">Welcome Back</h2>
            <p className="text-textMuted text-sm sm:text-base">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" required
                className="input-field pl-12"
              />
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required
                className="input-field pl-12 pr-12"
              />
              <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-primary transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex min-h-10 items-center gap-2 text-sm font-semibold text-textMuted">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-primary" />
                Remember me
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="min-h-10 text-primary text-sm font-semibold hover:underline transition-all">Forgot password?</button>
            </div>

            {(error || authNotice) && (
              <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${error ? 'bg-danger/10 text-danger' : 'bg-primary/8 text-primary'}`}>
                {error || authNotice}
              </p>
            )}

            <Button variant="primary" type="submit" className="w-full py-4 text-base mt-2" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'SIGN IN'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-textMuted text-xs font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="flex justify-center">
            <button type="button" aria-label="Continue with Google" onClick={handleGoogleLogin} disabled={loading}
              className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-textDark shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-60">
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center text-textMuted text-sm mt-10">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline transition-all">Sign Up</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

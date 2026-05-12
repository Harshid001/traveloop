import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/home'), 1200);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col lg:flex-row">

      {/* LEFT / TOP — Brand Panel */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 sm:py-16 lg:py-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 relative z-10"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-glow backdrop-blur-sm">
            <Send size={24} className="text-white" />
          </div>
          <span className="font-poppins text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Traveloop</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-white/80 text-base sm:text-lg text-center relative z-10"
        >
          Sign in to continue your journey
        </motion.p>
      </div>

      {/* RIGHT / BOTTOM — Form Panel */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 bg-surface rounded-t-[40px] lg:rounded-t-none lg:rounded-l-[48px] px-6 sm:px-10 pt-12 pb-10 flex flex-col justify-center w-full shadow-[-8px_0_40px_rgba(0,0,0,0.1)] relative z-20"
      >
        <div className="max-w-[360px] mx-auto w-full">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full mb-8 mx-auto lg:hidden"></div>
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm sm:text-base">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" required
                className="input-field pl-11"
              />
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required
                className="input-field pl-11 pr-12"
              />
              <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-primary transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <button type="button" className="text-primary text-sm font-semibold hover:underline transition-all">Forgot password?</button>
            </div>

            <Button variant="primary" type="submit" className="w-full py-4 text-base mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'SIGN IN'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex justify-center gap-4">
            {[
              { color: '#1877F2', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { color: '#1DA1F2', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
            ].map((s, i) => (
              <button key={i} aria-label={`Continue with social provider ${i + 1}`} onClick={() => { setLoading(true); setTimeout(() => navigate('/home'), 1200); }}
                className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill={s.color} d={s.path} /></svg>
              </button>
            ))}
            <button aria-label="Continue with Google" onClick={() => { setLoading(true); setTimeout(() => navigate('/home'), 1200); }}
              className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-10">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline transition-all">Sign Up</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

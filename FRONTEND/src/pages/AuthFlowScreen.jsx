import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Globe,
  Languages,
  Loader2,
  Lock,
  Mail,
  Send,
  User,
  Wallet,
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const copy = {
  forgot: {
    title: 'Recover Password',
    body: 'Enter your email and Traveloop will prepare a reset link.',
    action: 'Send reset link',
    icon: Mail,
  },
  reset: {
    title: 'Reset Password',
    body: 'Create a new password for your Traveloop account.',
    action: 'Reset password',
    icon: Lock,
  },
  verify: {
    title: 'Verify Email',
    body: 'Enter the verification code from your inbox.',
    action: 'Verify account',
    icon: BadgeCheck,
  },
  complete: {
    title: 'Complete Profile',
    body: 'Set the preferences Traveloop uses for smarter travel planning.',
    action: 'Save preferences',
    icon: User,
  },
};

export default function AuthFlowScreen({ mode = 'forgot' }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const screen = copy[mode] || copy.forgot;
  const Icon = screen.icon;
  const [form, setForm] = useState({
    email: auth.user?.email || '',
    code: '',
    password: '',
    confirmPassword: '',
    name: auth.user?.name || '',
    preferredCurrency: auth.user?.preferredCurrency || 'INR',
    preferredLanguage: auth.user?.preferredLanguage || 'English',
    travelStyle: auth.user?.travelStyle || 'Balanced explorer',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fields = useMemo(() => {
    if (mode === 'reset') return ['email', 'password', 'confirmPassword'];
    if (mode === 'verify') return ['email', 'code'];
    if (mode === 'complete') return ['name', 'preferredCurrency', 'preferredLanguage', 'travelStyle'];
    return ['email'];
  }, [mode]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'reset' && form.password !== form.confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'forgot') await auth.forgotPassword({ email: form.email });
      if (mode === 'reset') await auth.resetPassword({ email: form.email, password: form.password });
      if (mode === 'verify') await auth.verifyEmail({ email: form.email, code: form.code });
      if (mode === 'complete') await auth.updateProfile(form);
      setMessage(mode === 'complete' ? 'Profile completed. Your dashboard is ready.' : 'Success. You can continue.');
      setTimeout(() => navigate(mode === 'complete' ? '/home' : '/login'), 900);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-hover"
      >
        <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
          <button
            type="button"
            onClick={() => navigate(mode === 'complete' ? '/home' : '/login')}
            className="mb-6 flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Icon size={22} />
            </div>
            <div>
              <h1 className="font-poppins text-2xl font-bold">{screen.title}</h1>
              <p className="text-sm text-white/70">{screen.body}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {fields.includes('name') && (
            <LabeledInput icon={User} label="Display name" value={form.name} onChange={update('name')} required />
          )}
          {fields.includes('email') && (
            <LabeledInput icon={Mail} label="Email" type="email" value={form.email} onChange={update('email')} required />
          )}
          {fields.includes('code') && (
            <LabeledInput icon={BadgeCheck} label="Verification code" value={form.code} onChange={update('code')} required />
          )}
          {fields.includes('password') && (
            <LabeledInput icon={Lock} label="New password" type="password" value={form.password} onChange={update('password')} required />
          )}
          {fields.includes('confirmPassword') && (
            <LabeledInput icon={Lock} label="Confirm password" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required />
          )}
          {fields.includes('preferredCurrency') && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField icon={Wallet} label="Currency" value={form.preferredCurrency} onChange={update('preferredCurrency')} options={['INR', 'USD']} />
              <SelectField icon={Languages} label="Language" value={form.preferredLanguage} onChange={update('preferredLanguage')} options={['English', 'Hindi', 'Spanish', 'French']} />
            </div>
          )}
          {fields.includes('travelStyle') && (
            <SelectField icon={Globe} label="Travel style" value={form.travelStyle} onChange={update('travelStyle')} options={['Balanced explorer', 'Budget friendly', 'Luxury', 'Adventure', 'Family', 'Business']} />
          )}

          {error && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
          {message && <p className="rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p>}

          <Button type="submit" className="w-full py-4" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Working...</> : <><Check size={16} /> {screen.action}</>}
          </Button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => navigate('/verify-email')}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5"
            >
              <Send size={14} /> I already have a code
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}

function LabeledInput({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-textMuted">{label}</span>
      <span className="relative block">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input {...props} placeholder={label} className="input-field pl-11" />
      </span>
    </label>
  );
}

function SelectField({ icon: Icon, label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-textMuted">{label}</span>
      <span className="relative block">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <select {...props} className="input-field appearance-none pl-11">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

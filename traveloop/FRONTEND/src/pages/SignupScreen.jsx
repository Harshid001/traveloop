import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MapPin, Lock, Calendar, Hash, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

function SignupField({ icon: Icon, type = 'text', field, placeholder, half, value, onChange, children }) {
  return (
    <div className={half ? 'w-full sm:flex-1 sm:min-w-0' : 'w-full'}>
      <div className="relative group">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type={type}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          required
          className={`input-field text-xs sm:text-sm py-3 pl-11 ${children ? 'pr-12' : ''}`}
        />
        {children}
      </div>
    </div>
  );
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const { register, authNotice } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', dob: '', mobile: '',
    state: '', address: '', email: '', password: '', confirmPassword: '',
  });

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.email.trim()) {
      setError('Add your name and email to create an account.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({ ...form, phone: form.mobile, location: [form.address, form.state].filter(Boolean).join(', ') });
      navigate('/complete-profile', { replace: true });
    } catch (signupError) {
      setError(signupError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-250">

      {/* Brand Panel */}
      <div className="lg:w-2/5 bg-gradient-to-br from-primary via-secondary to-accent flex flex-col items-center justify-center px-8 py-14 lg:py-0 lg:rounded-r-[48px] lg:min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]"></div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/30 shadow-glow backdrop-blur-md">
            <Send size={28} className="text-white transform -rotate-12" />
          </div>
          <span className="font-poppins text-4xl font-extrabold text-white tracking-tight">Traveloop</span>
        </motion.div>
        <p className="text-white/85 text-lg text-center relative z-10 font-medium">Create your account to start exploring</p>
      </div>

      {/* Form Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-6 sm:px-12 py-10 lg:py-0 flex items-center justify-center bg-white dark:bg-slate-900"
      >
        <div className="w-full max-w-md my-auto py-8">
          <h1 className="font-poppins text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 text-center lg:text-left">Personal Information</h1>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <SignupField icon={User} field="firstName" placeholder="First Name" value={form.firstName} onChange={update} half />
              <SignupField icon={User} field="lastName" placeholder="Last Name" value={form.lastName} onChange={update} half />
            </div>
            <SignupField icon={Mail} field="email" type="email" placeholder="Email Address" value={form.email} onChange={update} />
            <SignupField icon={Phone} field="mobile" type="tel" placeholder="Phone Number" value={form.mobile} onChange={update} />
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <SignupField icon={Calendar} field="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={update} half />
              <SignupField icon={Hash} field="age" type="number" placeholder="Age" value={form.age} onChange={update} half />
            </div>
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <SignupField icon={MapPin} field="state" placeholder="State" value={form.state} onChange={update} half />
              <SignupField icon={MapPin} field="address" placeholder="City" value={form.address} onChange={update} half />
            </div>
            <SignupField icon={Lock} field="password" type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={update}>
              <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((value) => !value)} className="absolute right-2 top-1/2 flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-primary">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </SignupField>
            <SignupField icon={Lock} field="confirmPassword" type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm Password" value={form.confirmPassword} onChange={update}>
              <button type="button" aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPw((value) => !value)} className="absolute right-2 top-1/2 flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-primary">
                {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </SignupField>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2 leading-relaxed pt-2">
              By creating an account you agree to our Terms of Service and Privacy Policy. We will ask for travel preferences next.
            </p>

            {(error || authNotice) && (
              <p className={`rounded-xl px-4 py-3 text-xs font-semibold ${error ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                {error || authNotice}
              </p>
            )}

            <Button variant="primary" type="submit" className="w-full py-3.5 text-sm font-bold mt-2 shadow-md" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'CONTINUE'}
            </Button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-primary dark:text-primary-light font-bold hover:underline transition-all">Login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MapPin, Lock, Calendar, Hash } from 'lucide-react';
import Button from '../components/common/Button';

function SignupField({ icon: Icon, type = 'text', field, placeholder, half, value, onChange }) {
  return (
    <div className={half ? 'w-full sm:flex-1 sm:min-w-0' : 'w-full'}>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          required
          className="input-field text-sm py-3"
        />
      </div>
    </div>
  );
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', dob: '', mobile: '',
    state: '', address: '', email: '', password: '', confirmPassword: '',
  });

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSignup = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { alert('Passwords do not match!'); return; }
    setLoading(true);
    setTimeout(() => navigate('/home'), 1500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">

      {/* Brand Panel */}
      <div className="lg:w-2/5 bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center px-6 py-12 lg:py-0 lg:rounded-r-[48px] lg:min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-glow backdrop-blur-sm">
            <Send size={24} className="text-white" />
          </div>
          <span className="font-poppins text-3xl font-extrabold text-white tracking-tight">Traveloop</span>
        </motion.div>
        <p className="text-white/80 text-base text-center relative z-10">Create your account to start exploring</p>
      </div>

      {/* Form Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-6 sm:px-10 py-10 lg:py-0 flex items-center justify-center"
      >
        <div className="w-full max-w-md">
          <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-8 text-center lg:text-left">Personal Information</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <SignupField icon={User} field="firstName" placeholder="First Name" value={form.firstName} onChange={update} half />
              <SignupField icon={User} field="lastName" placeholder="Last Name" value={form.lastName} onChange={update} half />
            </div>
            <SignupField icon={Mail} field="email" type="email" placeholder="Email Address" value={form.email} onChange={update} />
            <SignupField icon={Phone} field="mobile" type="tel" placeholder="Phone Number" value={form.mobile} onChange={update} />
            <div className="flex flex-col gap-4 sm:flex-row">
              <SignupField icon={Calendar} field="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={update} half />
              <SignupField icon={Hash} field="age" type="number" placeholder="Age" value={form.age} onChange={update} half />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <SignupField icon={MapPin} field="state" placeholder="State" value={form.state} onChange={update} half />
              <SignupField icon={MapPin} field="address" placeholder="City" value={form.address} onChange={update} half />
            </div>
            <SignupField icon={Lock} field="password" type="password" placeholder="Password" value={form.password} onChange={update} />
            <SignupField icon={Lock} field="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={update} />

            <p className="text-xs text-gray-400 text-center px-2 leading-relaxed pt-2">
              By creating an account you agree to our Terms of Service and Privacy Policy
            </p>

            <Button variant="primary" type="submit" className="w-full py-4 text-base mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'CONTINUE'}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline transition-all">Login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

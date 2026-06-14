import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Button from '../components/common/Button';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex flex-col lg:flex-row">

      {/* Brand Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 shadow-xl backdrop-blur-md">
            <Send size={40} className="text-white" />
          </div>
          <h1 className="font-poppins text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight mb-5">Traveloop</h1>
          <p className="text-white/80 text-lg max-w-sm mx-auto leading-relaxed">
            Your personalized travel companion for unforgettable journeys.
          </p>
        </motion.div>
      </div>

      {/* Action Section */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
        className="bg-white w-full lg:w-[440px] rounded-t-[40px] lg:rounded-t-none lg:rounded-l-[48px] px-8 pt-12 pb-16 flex flex-col items-center justify-center shadow-[-8px_0_40px_rgba(0,0,0,0.1)] relative z-20"
      >
        <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-8 lg:hidden"></div>
        <h2 className="font-poppins text-2xl font-extrabold text-textDark mb-2 text-center tracking-tight">Get Started</h2>
        <p className="text-textMuted text-base mb-10 text-center font-medium">Plan smarter. Travel better.</p>

        <div className="w-full max-w-[320px] space-y-4">
          <Button variant="primary" onClick={() => navigate('/login')} className="w-full py-4 text-base rounded-xl bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            LOGIN
          </Button>
          <Button variant="secondary" onClick={() => navigate('/signup')} className="w-full py-4 text-base rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-textDark shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            SIGN UP
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

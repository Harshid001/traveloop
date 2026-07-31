import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * SplashScreen — 2-second branded intro
 * Shows logo, tagline, and a subtle loading animation before auto-navigating to /onboarding.
 */
export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="hero-gradient flex items-center justify-center relative overflow-hidden">

      {/* Ambient floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-turquoise-surf/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-frosted-blue/15 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-bright-teal/10 blur-2xl animate-float" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10"
      >
        {/* Logo icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-glow">
            <svg className="w-12 h-12 text-white animate-plane-fly" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7Z" />
            </svg>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-poppins text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
        >
          Traveloop
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-frosted-blue text-lg md:text-xl font-light tracking-wide"
        >
          Plan smarter. Travel better.
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-2 mt-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/60"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

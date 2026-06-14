import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { slides } from './slides';
import Button from '../components/common/Button';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) { setDirection(1); setCurrent((p) => p + 1); }
    else navigate('/welcome');
  };

  const goPrev = () => {
    if (current > 0) { setDirection(-1); setCurrent((p) => p - 1); }
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Image Panel */}
      <div className="w-full lg:w-1/2 h-[45vh] lg:h-screen relative overflow-hidden shrink-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:to-black/5" />
      </div>

      {/* Content Panel */}
      <div className="flex-1 flex flex-col relative w-full lg:w-1/2">
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send size={20} className="text-primary" />
            </div>
            <span className="font-poppins text-lg lg:text-xl font-bold text-textDark tracking-tight">Traveloop</span>
          </div>
          <button 
            onClick={() => navigate('/welcome')} 
            className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-textMuted hover:text-primary hover:bg-primary/5 rounded-full transition-all"
          >
            Skip
          </button>
        </header>

        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-24 sm:py-28 lg:py-12">
          <div className="max-w-xl mx-auto lg:mx-0 w-full space-y-8 sm:space-y-12">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="text-center lg:text-left space-y-4 sm:space-y-6"
              >
                <h1 className="font-poppins text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-textDark leading-[1.2] tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-textMuted text-sm sm:text-base lg:text-lg leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-8 sm:space-y-12 pt-2 sm:pt-4">
              <div className="flex justify-center lg:justify-start gap-2 sm:gap-3">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
                      idx === current ? 'bg-primary w-8 sm:w-12' : 'bg-slate-200 w-2 sm:w-2.5'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Button 
                  variant="primary" 
                  onClick={goNext} 
                  className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 group rounded-xl transition-all duration-300 bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2"
                >
                  {current === slides.length - 1 ? 'Get Started' : 'Continue'}
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </Button>

                {current > 0 && (
                  <button
                    aria-label="Previous onboarding slide"
                    onClick={goPrev}
                    className="order-first sm:order-none py-3 px-2 text-sm font-bold text-textMuted hover:text-textDark transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <div className="h-20 sm:h-24 lg:h-0" />
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { Star, Clock, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Heart } from 'lucide-react';
import SkeletonCard from "../../ui/SkeletonCard";
import ErrorBanner from "../../ui/ErrorBanner";
import { FEATURED_TOP_TRIPS } from "../../../constants/fallback";

/**
 * Enhanced Desktop & Mobile Carousel displaying top featured destinations.
 */
export default function TopDestinationsCarousel({ 
  topTrips = [], 
  topLoading, 
  topError, 
  refetchTop, 
  currentSlide, 
  setCurrentSlide, 
  navigate,
  likedTrips = {},
  toggleLike = () => {}
}) {
  // Use backend topTrips if present, otherwise fallback to rich FEATURED_TOP_TRIPS
  const displayTrips = (Array.isArray(topTrips) && topTrips.length > 0) ? topTrips : FEATURED_TOP_TRIPS;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? displayTrips.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % displayTrips.length);
  };

  if (topLoading && displayTrips.length === 0) {
    return (
      <div className="mb-10">
        <SkeletonCard />
      </div>
    );
  }

  if (topError && displayTrips.length === 0) {
    return (
      <div className="mb-10">
        <ErrorBanner error={topError} refetch={refetchTop} />
      </div>
    );
  }

  const activeTrip = displayTrips[currentSlide % displayTrips.length] || displayTrips[0];

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
              <Sparkles size={16} />
            </span>
            <h2 className="font-poppins text-xl font-extrabold text-textDark tracking-tight">
              Featured Top Destinations
            </h2>
          </div>
          <p className="text-textMuted text-xs mt-1">Handpicked luxury & bucket-list experiences worldwide</p>
        </div>

        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-2">
          {displayTrips.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide % displayTrips.length
                  ? 'bg-primary w-8 shadow-sm'
                  : 'bg-slate-200 w-2.5 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Hero Slider Container */}
      <div className="relative w-full overflow-hidden rounded-3xl shadow-hover group border border-slate-100 bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrip.id || currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full aspect-[16/9] lg:aspect-[21/9] min-h-[380px] sm:min-h-[440px] cursor-pointer overflow-hidden"
            onClick={() => navigate(`/trip/${activeTrip.id}`)}
          >
            <img
              src={activeTrip.image}
              alt={activeTrip.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent pointer-events-none hidden md:block" />

            {/* Top Right Quick Actions */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
              <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-extrabold rounded-full px-4 py-1.5 shadow-lg border border-white/20">
                {activeTrip.price}
              </span>
              <button
                aria-label="Save trip"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(activeTrip.id);
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-danger hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                <Heart
                  size={18}
                  className={likedTrips[activeTrip.id] ? 'text-danger fill-danger' : 'text-white'}
                />
              </button>
            </div>

            {/* Desktop Left / Right Arrows */}
            <button
              aria-label="Previous Slide"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white hover:text-textDark hover:scale-110 transition-all shadow-xl"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              aria-label="Next Slide"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white hover:text-textDark hover:scale-110 transition-all shadow-xl"
            >
              <ChevronRight size={22} />
            </button>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
              <div className="max-w-3xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {activeTrip.category && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full px-3.5 py-1 border border-white/20 shadow-sm uppercase tracking-wider">
                      {activeTrip.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold rounded-full px-3.5 py-1 border border-white/20 shadow-sm">
                    <Star size={13} className="fill-amber-400 text-amber-400" /> {activeTrip.rating || 4.9}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full px-3.5 py-1 border border-white/20 shadow-sm">
                    <Clock size={13} /> {activeTrip.duration || '7 Days'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-poppins text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2 drop-shadow-md leading-tight">
                  {activeTrip.title}
                </h3>

                {/* Location & Short Description */}
                <p className="text-white/90 text-sm sm:text-base flex items-center gap-2 mb-3 font-medium">
                  <MapPin size={18} className="text-primary-light shrink-0" />
                  {activeTrip.location}
                </p>
                {activeTrip.description && (
                  <p className="text-white/80 text-xs sm:text-sm line-clamp-2 mb-5 hidden sm:block max-w-2xl font-normal leading-relaxed">
                    {activeTrip.description}
                  </p>
                )}

                {/* CTA Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/trip/${activeTrip.id}`)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-glow hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <span>Explore Experience</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Desktop Thumbnail Preview Selector Bar */}
              <div className="absolute bottom-6 right-8 z-20 hidden lg:flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                {displayTrips.slice(0, 4).map((t, idx) => (
                  <button
                    key={t.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentSlide % displayTrips.length
                        ? 'border-primary ring-2 ring-primary/40 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}


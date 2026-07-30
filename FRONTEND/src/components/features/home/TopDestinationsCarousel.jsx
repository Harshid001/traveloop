import { AnimatePresence, motion } from 'framer-motion';
import { Star, Clock, MapPin } from 'lucide-react';
import SkeletonCard from "../../ui/SkeletonCard";
import ErrorBanner from "../../ui/ErrorBanner";

/**
 * Carousel displaying the top destinations.
 */
export default function TopDestinationsCarousel({ 
  topTrips, 
  topLoading, 
  topError, 
  refetchTop, 
  currentSlide, 
  setCurrentSlide, 
  navigate 
}) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-textDark">Top Destinations</h2>
          <p className="text-textMuted text-xs mt-0.5">Handpicked experiences for you</p>
        </div>
        <div className="flex gap-1.5">
          {topLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          ) : topError ? (
            <ErrorBanner error={topError} refetch={refetchTop} />
          ) : (
            topTrips.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary w-7' : 'bg-slate-200 w-2 hover:bg-slate-300'}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl shadow-soft group hover:shadow-hover transition-shadow duration-300">
        <AnimatePresence mode="wait">
          {topTrips.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full aspect-[16/9] md:aspect-[21/9] cursor-pointer overflow-hidden"
              onClick={() => navigate(`/trip/${topTrips[currentSlide].id}`)}
            >
              <img
                src={topTrips[currentSlide].image}
                alt={topTrips[currentSlide].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 pointer-events-none">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" /> {topTrips[currentSlide].rating}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
                    <Clock size={12} /> {topTrips[currentSlide].duration}
                  </span>
                </div>
                <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                  {topTrips[currentSlide].title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-white/90 text-sm sm:text-base flex items-center gap-1.5">
                    <MapPin size={16} />{topTrips[currentSlide].location}
                  </p>
                  <span className="font-poppins text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                    {topTrips[currentSlide].price}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

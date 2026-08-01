import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, ChevronRight, Star, MapPin, Compass, Flame, Plane } from 'lucide-react';
import SkeletonCard from "../../ui/SkeletonCard";
import ErrorBanner from "../../ui/ErrorBanner";

const CATEGORIES = ['All', 'Popular', 'Beach', 'Mountain', 'Cultural', 'Luxury'];

/**
 * Grid of the most recent trips with interactive category filter tabs.
 */
export default function LatestTripsGrid({ 
  latestTrips = [], 
  latestLoading, 
  latestError, 
  refetchLatest, 
  likedTrips = {}, 
  toggleLike = () => {}, 
  navigate 
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const rawTrips = Array.isArray(latestTrips) ? latestTrips : [];

  // Filter based on activeCategory
  const filteredTrips = rawTrips.filter((trip) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Popular') return (trip.rating || 0) >= 4.85;
    return trip.category === activeCategory;
  });

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-accent/10 text-accent dark:bg-accent/20 p-2 rounded-xl">
              <Compass size={18} />
            </span>
            <h2 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Explore Featured Trips & Adventures
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Discover handpicked travel itineraries tailored for your next getaway</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {cat === 'Popular' && <Flame size={12} className="inline mr-1 text-amber-400" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {latestLoading && rawTrips.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : latestError && rawTrips.length === 0 ? (
        <ErrorBanner error={latestError} refetch={refetchLatest} />
      ) : rawTrips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-16 text-center">
          <Plane size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="font-poppins text-lg font-bold text-slate-800 dark:text-slate-200">No featured trips yet</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Published trips will appear here once available.</p>
        </div>
      ) : (
        <motion.div
          layout
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip) => (
              <motion.div
                layout
                key={trip.id}
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-soft border border-slate-200/80 dark:border-slate-700/80 hover:shadow-hover hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Save Heart Button */}
                  <button
                    aria-label={likedTrips[trip.id] ? 'Remove from saved trips' : 'Save trip'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(trip.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10"
                  >
                    <Heart
                      size={16}
                      className={likedTrips[trip.id] ? 'text-danger fill-danger' : 'text-slate-400 dark:text-slate-500'}
                    />
                  </button>

                  {/* Category Pill */}
                  {trip.category && (
                    <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/20">
                      {trip.category}
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-primary/95 backdrop-blur-md text-white text-xs font-extrabold rounded-full px-3 py-1 shadow-sm border border-white/20">
                    {trip.price}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                      {trip.title}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 rounded-full px-2.5 py-0.5 border border-amber-200 dark:border-amber-800/60">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> {trip.rating ?? 'N/A'}
                    </span>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 mb-3 font-medium">
                    <MapPin size={14} className="text-primary" />
                    {trip.location}
                  </p>

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                    {trip.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/80 mt-auto">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {trip.duration || '—'}
                    </span>
                    <span className="text-primary dark:text-primary-light text-xs sm:text-sm font-extrabold inline-flex items-center gap-1 group/btn">
                      <span>View Details</span>
                      <ChevronRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}



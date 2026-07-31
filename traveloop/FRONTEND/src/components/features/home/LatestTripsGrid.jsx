import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, ChevronRight, Star, MapPin, Compass, Flame } from 'lucide-react';
import SkeletonCard from "../../ui/SkeletonCard";
import ErrorBanner from "../../ui/ErrorBanner";
import { FEATURED_LATEST_TRIPS } from "../../../constants/fallback";

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

  // Use backend trips if present, fallback to FEATURED_LATEST_TRIPS
  const rawTrips = (Array.isArray(latestTrips) && latestTrips.length > 0) ? latestTrips : FEATURED_LATEST_TRIPS;

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
            <span className="bg-accent/10 text-accent p-1.5 rounded-lg">
              <Compass size={18} />
            </span>
            <h2 className="font-poppins text-xl font-extrabold text-textDark tracking-tight">
              Explore Featured Trips & Adventures
            </h2>
          </div>
          <p className="text-textMuted text-xs mt-1">Discover handpicked travel itineraries tailored for your next getaway</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100/90 hover:shadow-hover hover:border-primary/20 transition-all duration-300 flex flex-col group"
              >
                <div
                  className="relative h-52 cursor-pointer overflow-hidden bg-slate-100"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Save Heart Button */}
                  <button
                    aria-label={likedTrips[trip.id] ? 'Remove from saved trips' : 'Save trip'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(trip.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 hover:bg-white active:scale-95 transition-all z-10"
                  >
                    <Heart
                      size={16}
                      className={likedTrips[trip.id] ? 'text-danger fill-danger' : 'text-slate-400'}
                    />
                  </button>

                  {/* Category Pill */}
                  {trip.category && (
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/20">
                      {trip.category}
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-md text-white text-xs font-extrabold rounded-full px-3 py-1 shadow-sm border border-white/20">
                    {trip.price}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-poppins text-base font-bold text-textDark leading-snug group-hover:text-primary transition-colors">
                      {trip.title}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 border border-amber-200">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> {trip.rating || 4.8}
                    </span>
                  </div>

                  <p className="text-textMuted text-xs flex items-center gap-1.5 mb-3 font-medium">
                    <MapPin size={14} className="text-primary/70" />
                    {trip.location}
                  </p>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                    {trip.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <span className="text-textMuted text-xs font-semibold flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {trip.duration || '5 Days'}
                    </span>
                    <button
                      onClick={() => navigate(`/trip/${trip.id}`)}
                      className="text-primary text-xs sm:text-sm font-extrabold hover:underline inline-flex items-center gap-1 group/btn"
                    >
                      <span>View Details</span>
                      <ChevronRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
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


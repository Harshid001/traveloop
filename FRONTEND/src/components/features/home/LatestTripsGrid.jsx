import { motion } from 'framer-motion';
import { Heart, Clock, ChevronRight, Star, MapPin } from 'lucide-react';
import SkeletonCard from "../../ui/SkeletonCard";
import ErrorBanner from "../../ui/ErrorBanner";

/**
 * Grid of the most recent trips.
 */
export default function LatestTripsGrid({ 
  latestTrips, 
  latestLoading, 
  latestError, 
  refetchLatest, 
  likedTrips, 
  toggleLike, 
  navigate 
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-textDark">Latest Trips</h2>
          <p className="text-textMuted text-xs mt-0.5">Explore fresh new adventures</p>
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
      >
        {latestLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))
        ) : latestError ? (
          <ErrorBanner error={latestError} refetch={refetchLatest} />
        ) : (
          latestTrips.map((trip) => (
            <motion.div
              key={trip.id}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100 card-hover flex flex-col group"
            >
              <div
                className="relative h-48 sm:h-52 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                <button
                  aria-label={likedTrips[trip.id] ? 'Remove from saved trips' : 'Save trip'}
                  onClick={(e) => { e.stopPropagation(); toggleLike(trip.id); }}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 hover:bg-white active:scale-95 transition-all"
                >
                  <Heart size={16} className={likedTrips[trip.id] ? 'text-danger fill-danger' : 'text-slate-400'} />
                </button>
                <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold rounded-full px-3 py-1.5 shadow-sm">{trip.price}</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-poppins text-base font-bold text-textDark leading-snug group-hover:text-primary transition-colors">{trip.title}</h3>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-1 border border-amber-100">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {trip.rating}
                  </span>
                </div>
                <p className="text-textMuted text-xs flex items-center gap-1.5 mb-3"><MapPin size={13} />{trip.location}</p>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{trip.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-textMuted text-xs font-medium flex items-center gap-1.5"><Clock size={13} className="text-slate-300" />{trip.duration}</span>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}`)}
                    className="text-primary text-sm font-bold hover:underline inline-flex items-center gap-1 group/btn"
                  >
                    View <ChevronRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </section>
  );
}

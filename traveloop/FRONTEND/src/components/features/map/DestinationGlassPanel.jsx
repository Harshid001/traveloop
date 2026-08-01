import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Calendar, Thermometer, ShieldCheck, FileText, DollarSign,
  Languages, Sparkles, Navigation, Bookmark, Share2, Hotel, Plane, Clock, Check,
  Scale, Play, Video, ChevronLeft, ChevronRight, UserCheck, MessageSquare, Compass
} from 'lucide-react';

export default function DestinationGlassPanel({
  destination,
  onClose,
  onSave,
  isSaved,
  onAddToRoute,
  onAddToCompare,
  isCompared,
  onOpenBooking,
  userLocation
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  if (!destination) return null;

  const gallery = destination.gallery?.length ? destination.gallery : [destination.image];

  // Dynamic Haversine distance calculation from user location if available
  let userDistanceStr = 'Calculated on Map';
  if (userLocation && destination.lat && destination.lng) {
    const d = calculateHaversineDistance(userLocation.lat, userLocation.lng, destination.lat, destination.lng);
    userDistanceStr = `${d.toFixed(0)} km away`;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: `Explore ${destination.name}, ${destination.country} on Traveloop!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed top-0 right-0 z-[1000] h-full w-full sm:w-[480px] bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-2xl border-l border-white/10 text-slate-100 shadow-2xl overflow-y-auto flex flex-col font-poppins"
        >
          {/* Header Hero Image & Gallery Carousel */}
          <div className="relative h-64 w-full shrink-0 overflow-hidden group">
            <img
              src={gallery[activeImageIdx]}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Gallery Navigation Arrows */}
            {gallery.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto hover:bg-black/80"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto hover:bg-black/80"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Top Action Buttons */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-extrabold text-white border border-white/20 flex items-center gap-1.5">
                <span>{destination.flag}</span>
                <span>{destination.category}</span>
                {destination.discount && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                    {destination.discount}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  title="Save Destination"
                >
                  <Bookmark size={16} className={isSaved ? 'fill-primary text-primary' : 'text-white'} />
                </button>
                <button
                  onClick={onAddToCompare}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    isCompared ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                  }`}
                  title="Compare Destination"
                >
                  <Scale size={16} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  title="Share"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-500/80 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video preview trigger */}
            {destination.videoUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="absolute bottom-16 right-5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-all"
              >
                <Video size={14} className="text-rose-400" /> Watch Video Preview
              </button>
            )}

            {/* Destination Title & Quick Metrics */}
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {destination.name} <span className="text-xl">{destination.flag}</span>
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium mt-0.5">
                <MapPin size={12} className="text-primary-light" />
                {destination.country} · <Star size={12} className="fill-amber-400 text-amber-400" /> {destination.rating} ({destination.reviewsCount?.toLocaleString()} reviews) · <Compass size={12} className="text-cyan-400" /> {userDistanceStr}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 px-5 pt-3 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
            {['overview', 'guides & services', 'reviews', 'nearby'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2.5 text-xs font-bold capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary-light'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="p-5 flex-1 space-y-5 text-xs text-slate-300">
            {activeTab === 'overview' && (
              <>
                <p className="leading-relaxed text-slate-300 font-normal">{destination.description}</p>

                {/* Weather & Practical Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Thermometer size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Weather</p>
                      <p className="text-xs font-bold text-white">{destination.tempC}°C · {destination.weatherCondition}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Safety Score</p>
                      <p className="text-xs font-bold text-white">{destination.safetyScore}/100 Safe</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Best Season</p>
                      <p className="text-xs font-bold text-white truncate">{destination.bestSeason}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Transit Time</p>
                      <p className="text-xs font-bold text-white truncate">{destination.flightTimeHours}</p>
                    </div>
                  </div>
                </div>

                {/* Practical info card */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400 font-medium">
                      <FileText size={14} className="text-primary-light" /> Visa Requirements
                    </span>
                    <span className="font-bold text-white text-right max-w-[200px] truncate">{destination.visaRequired}</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400 font-medium">
                      <DollarSign size={14} className="text-emerald-400" /> Daily Cost &amp; Currency
                    </span>
                    <span className="font-bold text-white">{destination.currency} · ~${destination.pricePerDay}/day</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400 font-medium">
                      <Languages size={14} className="text-purple-400" /> Languages
                    </span>
                    <span className="font-bold text-white">{destination.language}</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'guides & services' && (
              <div className="space-y-4">
                {/* Included Services */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" /> Included Package Features
                  </span>
                  <div className="space-y-1.5">
                    {destination.includedServices?.map((serv) => (
                      <div key={serv} className="flex items-center gap-2 text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{serv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tour Guides */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck size={14} className="text-indigo-400" /> Certified Local Tour Guides
                  </span>
                  <div className="space-y-2">
                    {destination.tourGuides?.map((guide) => (
                      <div key={guide} className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="font-bold text-white">{guide}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Available</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {destination.reviews?.map((rev, idx) => (
                  <div key={idx} className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.avatar} alt={rev.user} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-white text-xs">{rev.user}</p>
                          <p className="text-[10px] text-slate-400">{rev.date}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 font-bold text-amber-400 text-xs">
                        <Star size={12} className="fill-amber-400" /> {rev.rating}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-normal text-xs">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nearby' && (
              <div className="space-y-2">
                {destination.nearbyPOIs?.map((poi) => (
                  <div key={poi.name} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{poi.icon || '📍'}</span>
                      <div>
                        <p className="font-bold text-white text-xs">{poi.name}</p>
                        <p className="text-[10px] text-slate-400">{poi.type}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-primary-light">{poi.distance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTAs */}
          <div className="p-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-md flex items-center gap-3">
            <button
              onClick={onAddToRoute}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              title="Add to Route Planner"
            >
              <Navigation size={15} /> + Add to Route
            </button>
            <button
              onClick={onOpenBooking}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold text-xs shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <DollarSign size={16} /> Book Now (${destination.pricePerDay || 200}/day)
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Video Preview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-4 w-full max-w-2xl shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Video size={16} className="text-rose-400" /> {destination.name} Video Preview
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
            <video controls autoPlay className="w-full rounded-2xl border border-white/10">
              <source src={destination.videoUrl} type="video/mp4" />
              Your browser does not support video preview.
            </video>
          </div>
        </div>
      )}
    </>
  );
}

// Haversine calculation helper
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

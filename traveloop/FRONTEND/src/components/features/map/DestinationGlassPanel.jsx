import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Calendar, Thermometer, ShieldCheck, FileText, DollarSign,
  Languages, Sparkles, Navigation, Bookmark, Share2, Hotel, Plane, Clock, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DestinationGlassPanel({ destination, onClose, onSave, isSaved }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!destination) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: `Check out ${destination.name}, ${destination.country} on Traveloop!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="fixed top-0 right-0 z-[1000] h-full w-full sm:w-[480px] bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 text-slate-100 shadow-2xl overflow-y-auto flex flex-col font-poppins"
      >
        {/* Header Hero Image */}
        <div className="relative h-64 w-full shrink-0 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-extrabold text-white border border-white/20 flex items-center gap-1.5">
              <span>{destination.flag}</span>
              <span>{destination.category}</span>
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
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                title="Share"
              >
                {copied ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-500/80 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Destination Title & Quick Metrics */}
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {destination.name} <span className="text-xl">{destination.flag}</span>
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium mt-0.5">
              <MapPin size={12} className="text-primary-light" />
              {destination.country} · <Star size={12} className="fill-amber-400 text-amber-400" /> {destination.rating} ({destination.reviewsCount?.toLocaleString()} reviews)
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-5 pt-3 bg-slate-900/60 sticky top-0 z-20 backdrop-blur-md">
          {['overview', 'ai tips', 'nearby'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-all border-b-2 ${
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
              {/* Overview text */}
              <p className="leading-relaxed text-slate-300 font-normal">{destination.description}</p>

              {/* Weather & Practical Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Weather</p>
                    <p className="text-sm font-bold text-white">{destination.tempC}°C · {destination.weatherCondition}</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Safety Score</p>
                    <p className="text-sm font-bold text-white">{destination.safetyScore}/100 Safe</p>
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

              {/* Visa, Currency & Language */}
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
                    <DollarSign size={14} className="text-emerald-400" /> Currency &amp; Daily Cost
                  </span>
                  <span className="font-bold text-white">{destination.currency} · ~${destination.pricePerDay}/day</span>
                </div>
                <div className="w-full h-[1px] bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400 font-medium">
                    <Languages size={14} className="text-accent" /> Languages
                  </span>
                  <span className="font-bold text-white">{destination.language}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ai tips' && (
            <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 rounded-2xl p-4 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 font-bold text-primary-light">
                <Sparkles size={16} /> AI Travel Recommendations
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">{destination.aiTips}</p>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Crowd Level Right Now</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {destination.crowdLevel}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="space-y-2">
              {destination.nearbyPOIs?.map((poi) => (
                <div key={poi.name} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="font-bold text-white text-xs">{poi.name}</p>
                    <p className="text-[10px] text-slate-400">{poi.type}</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-primary-light">{poi.distance}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => navigate('/create-trip')}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Navigation size={15} /> Plan Trip Here
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

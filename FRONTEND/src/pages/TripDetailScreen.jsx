import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, MapPin, Star, Clock, CheckCircle2, Plus, Check,
  Share2, Hotel, Utensils, Car, Ticket,
} from 'lucide-react';
import { destinations, topTrips, latestTrips } from '../data/trips';
import Button from '../components/common/Button';
import ShareModal from '../components/common/ShareModal';

export default function TripDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const dest = destinations.find((d) => d.id === Number(id));
  const allTrips = [...topTrips, ...latestTrips];
  const trip = allTrips.find((t) => t.id === Number(id));

  const item = dest || null;
  const tripData = trip || null;

  if (!item && !tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-textMuted text-lg mb-4">Trip not found</p>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const title = item ? `${item.name} Getaway` : tripData.title;
  const image = item ? item.image : tripData.image;
  const location = item ? `${item.name}, ${item.country}` : tripData.location;
  const rating = item ? item.rating : tripData.rating;
  const budget = item ? `$${item.budgetEstimate.toLocaleString()}` : tripData.budget;
  const description = item ? item.description : tripData.description;
  const activities = item ? item.activities : [];
  const duration = tripData ? tripData.duration : '5 Days / 4 Nights';
  const facilities = tripData ? tripData.facilities : ['Hotel', 'Flights', 'Meals', 'Guide', 'Insurance'];

  const budgetNum = item ? item.budgetEstimate : 3000;
  const budgetBreakdown = [
    { label: 'Hotels', icon: Hotel, amount: Math.round(budgetNum * 0.4), pct: 40, color: '#2563EB' },
    { label: 'Transport', icon: Car, amount: Math.round(budgetNum * 0.25), pct: 25, color: '#F59E0B' },
    { label: 'Food', icon: Utensils, amount: Math.round(budgetNum * 0.2), pct: 20, color: '#22C55E' },
    { label: 'Activities', icon: Ticket, amount: Math.round(budgetNum * 0.15), pct: 15, color: '#4F46E5' },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[360px] max-h-[50vh]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <button aria-label="Go back" onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-10 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ArrowLeft size={18} className="text-textDark" />
        </button>
        <button aria-label={liked ? 'Remove from saved trips' : 'Save trip'} onClick={() => setLiked(!liked)}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 transition-transform">
          <Heart size={18} className={liked ? 'text-danger fill-danger' : 'text-slate-500'} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
              <Star size={12} className="fill-yellow-400 text-yellow-400" /> {rating}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white text-xs font-medium rounded-full px-3 py-1 border border-white/10">
              <Clock size={12} /> {duration}
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h1>
          <p className="text-white/80 text-sm flex items-center gap-1"><MapPin size={14} /> {location}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Budget Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-textMuted text-[10px] font-semibold uppercase tracking-widest">Budget</p>
            <p className="font-poppins text-xl font-bold text-primary mt-1">{budget}</p>
          </div>
          <div className="text-right">
            <p className="text-textMuted text-[10px] font-semibold uppercase tracking-widest">Duration</p>
            <p className="font-poppins text-sm font-bold text-textDark mt-1">{duration}</p>
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="font-poppins text-base font-bold text-textDark mb-2">About This Trip</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </motion.div>

        {/* Facilities */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-poppins text-base font-bold text-textDark mb-3">Facilities Included</h2>
          <div className="flex flex-wrap gap-2">
            {facilities.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-medium rounded-full px-3.5 py-2">
                <CheckCircle2 size={13} /> {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Activities */}
        {activities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="font-poppins text-base font-bold text-textDark mb-3">Activities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activities.map((a, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-soft hover:shadow-hover transition-shadow">
                  <img src={a.image} alt={a.name} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-textDark truncate">{a.name}</p>
                    <p className="text-xs text-textMuted">{a.category} · {a.duration}</p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">${a.cost}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Budget Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-poppins text-base font-bold text-textDark mb-3">Budget Breakdown</h2>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft space-y-3">
            {budgetBreakdown.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + '12' }}>
                  <b.icon size={14} style={{ color: b.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-textMuted">{b.label}</span>
                    <span className="text-xs font-bold text-textDark">${b.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full" style={{ backgroundColor: b.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="pt-2 pb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" className="flex-1 py-4 text-sm"
              onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2500); }}>
              {added ? <><Check size={16} /> Trip Added!</> : <><Plus size={16} /> Add This Trip</>}
            </Button>
            <Button variant="secondary" className="py-4 text-sm px-6" onClick={() => setShareOpen(true)}>
              <Share2 size={16} /> Share
            </Button>
          </div>
        </motion.div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} tripTitle={title} />
    </div>
  );
}

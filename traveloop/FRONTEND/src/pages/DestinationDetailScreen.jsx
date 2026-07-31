import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, CalendarDays, Check,
  DollarSign, Heart, MapPin, Route, Share2, Star, Utensils,
} from 'lucide-react';
import { useGetDestinationQuery } from '../services/apiSlice';
import Button from '../components/ui/Button';
import ShareModal from '../components/ui/ShareModal';
import AppLayout from '../components/layout/AppLayout';

export default function DestinationDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: destination, isLoading, error } = useGetDestinationQuery(id);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !destination) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 font-bold">Destination not found</p>
            <Button onClick={() => navigate('/home')}>Return Home</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const foodPicks = [
    `${destination.name} local tasting walk`,
    'Signature street food route',
    'Dinner reservation shortlist',
  ];

  const addToTrip = () => {
    const stored = JSON.parse(window.localStorage.getItem('traveloop.createTrip.seed') || '[]');
    window.localStorage.setItem('traveloop.createTrip.seed', JSON.stringify([...stored, destination.id]));
    setAdded(true);
    navigate('/create-trip');
  };

  const img = destination.image?.url || destination.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80';

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <button aria-label="Back to explore" onClick={() => navigate('/explore')} className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back to Explore
        </button>
        <button aria-label="Share destination" onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold hover:bg-slate-200 transition-colors">
          <Share2 size={16} /> Share
        </button>
      </div>

      <div className="relative h-[45vh] min-h-[320px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-700/80 mb-6">
        <img src={img} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <span className="inline-block bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-2">Featured Destination</span>
          <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">{destination.name}</h1>
          <p className="text-slate-200 flex items-center gap-1 text-sm font-medium"><MapPin size={16} className="text-accent" /> {destination.country}</p>
        </div>
        <button
          aria-label={saved ? 'Remove from saved' : 'Save destination'}
          onClick={() => setSaved(!saved)}
          className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-md transition-all hover:scale-110"
        >
          <Heart size={20} className={saved ? 'fill-danger text-danger' : 'text-slate-400 dark:text-slate-500'} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 flex-wrap bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200"><Star size={16} className="fill-amber-400 text-amber-400" /> {destination.rating || 'N/A'}</span>
          {destination.budgetEstimate && <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200"><DollarSign size={16} className="text-primary" /> ${destination.budgetEstimate.toLocaleString()} est. budget</span>}
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200"><CalendarDays size={16} className="text-accent" /> Best Season: {destination.bestSeason || 'Year-round'}</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <h2 className="font-poppins text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">About Destination</h2>
          <p className="text-slate-600 leading-relaxed dark:text-slate-300 text-sm">{destination.description || 'Discover this amazing destination.'}</p>
        </div>

        {foodPicks.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
            <h2 className="font-poppins text-base font-bold text-slate-900 mb-3 flex items-center gap-2 dark:text-slate-100"><Utensils size={18} className="text-primary" /> Food &amp; Culinary Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {foodPicks.map((f, i) => (
                <span key={i} className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl px-4 py-2 border border-amber-200 dark:border-amber-800">{f}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={addToTrip} className="flex-1 py-3.5 text-sm font-bold shadow-lg">
            {added ? <><Check size={18} /> Added to Itinerary!</> : <><Route size={18} /> Add to Trip</>}
          </Button>
          <Button variant="secondary" onClick={() => setSaved(!saved)} className="px-5">
            <Bookmark size={18} className={saved ? 'fill-primary text-primary' : ''} />
          </Button>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} tripTitle={destination.name} />
    </AppLayout>
  );
}
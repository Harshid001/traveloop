import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, CalendarDays, Check,
  DollarSign, Heart, MapPin, Route, Share2, Star, Utensils,
} from 'lucide-react';
import { useGetDestinationQuery } from '../services/apiSlice';
import Button from '../components/ui/Button';
import ShareModal from '../components/ui/ShareModal';

export default function DestinationDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: destination, isLoading, error } = useGetDestinationQuery(id);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">Destination not found</p>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-[#0B0F17] transition-colors duration-300">
      <header className="fixed inset-x-0 top-0 z-50 bg-black/10 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to explore" onClick={() => navigate('/explore')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white">
            <ArrowLeft size={18} />
          </button>
          <button aria-label="Share destination" onClick={() => setShareOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <div className="relative h-[50vh] min-h-[320px]">
        <img src={img} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="font-poppins text-3xl font-bold text-white mb-1">{destination.name}</h1>
          <p className="text-white/80 flex items-center gap-1 text-sm"><MapPin size={14} /> {destination.country}</p>
        </div>
        <button
          aria-label={saved ? 'Remove from saved' : 'Save destination'}
          onClick={() => setSaved(!saved)}
          className="absolute top-20 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110"
        >
          <Heart size={18} className={saved ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300"><Star size={14} className="fill-amber-400 text-amber-400" /> {destination.rating || 'N/A'}</span>
          {destination.budgetEstimate && <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300"><DollarSign size={14} /> ${destination.budgetEstimate.toLocaleString()}</span>}
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300"><CalendarDays size={14} /> Best: {destination.bestSeason || 'Year-round'}</span>
        </div>

        <p className="text-slate-600 leading-relaxed dark:text-slate-400">{destination.description || 'Discover this amazing destination.'}</p>

        {foodPicks.length > 0 && (
          <div>
            <h2 className="font-poppins text-base font-bold text-slate-900 mb-3 flex items-center gap-2 dark:text-white"><Utensils size={16} /> Food &amp; Drink</h2>
            <div className="flex flex-wrap gap-2">
              {foodPicks.map((f, i) => (
                <span key={i} className="bg-amber-50 text-amber-700 text-sm rounded-full px-4 py-1.5 dark:bg-amber-900/20 dark:text-amber-400">{f}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="primary" onClick={addToTrip} className="flex-1">
            {added ? <><Check size={16} /> Added!</> : <><Route size={16} /> Add to Trip</>}
          </Button>
          <Button variant="secondary" onClick={() => setSaved(!saved)}>
            <Bookmark size={16} className={saved ? 'fill-indigo-600 text-indigo-600' : ''} />
          </Button>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} tripTitle={destination.name} />
    </div>
  );
}
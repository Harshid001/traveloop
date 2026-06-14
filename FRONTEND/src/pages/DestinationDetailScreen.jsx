import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
  Heart,
  Hotel,
  MapPin,
  Route,
  Share2,
  Star,
  Utensils,
} from 'lucide-react';
import { destinations } from '../data/trips';
import Button from '../components/common/Button';
import ShareModal from '../components/common/ShareModal';

export default function DestinationDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const destination = useMemo(
    () => destinations.find((item) => String(item.id) === String(id)) || destinations[0],
    [id],
  );
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const foodPicks = [
    `${destination.name} local tasting walk`,
    'Signature street food route',
    'Dinner reservation shortlist',
  ];
  const nearby = destinations.filter((item) => item.id !== destination.id).slice(0, 3);

  const addToTrip = () => {
    const stored = JSON.parse(window.localStorage.getItem('traveloop.createTrip.seed') || '[]');
    window.localStorage.setItem('traveloop.createTrip.seed', JSON.stringify([...stored, destination.id]));
    setAdded(true);
    setTimeout(() => navigate('/create-trip'), 700);
  };

  return (
    <div className="min-h-screen bg-surface-50 pb-24">
      <header className="fixed inset-x-0 top-0 z-50 bg-white/10 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to explore" onClick={() => navigate('/explore')} className="tap-target rounded-xl bg-white/90 text-slate-600 shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button aria-label="Share destination" onClick={() => setShareOpen(true)} className="tap-target rounded-xl bg-white/90 text-slate-600 shadow-sm">
              <Share2 size={17} />
            </button>
            <button aria-label={saved ? 'Unsave destination' : 'Save destination'} onClick={() => setSaved((value) => !value)} className="tap-target rounded-xl bg-white/90 text-slate-600 shadow-sm">
              <Heart size={17} className={saved ? 'fill-danger text-danger' : ''} />
            </button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[72vh] overflow-hidden">
        <img src={destination.image} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/20" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-end px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl text-white">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                <Star size={13} className="fill-amber-400 text-amber-400" /> {destination.rating}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                <MapPin size={13} /> {destination.country}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                <DollarSign size={13} /> ${destination.budgetEstimate.toLocaleString()} est.
              </span>
            </div>
            <h1 className="font-poppins text-4xl font-extrabold tracking-normal sm:text-6xl">{destination.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{destination.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={addToTrip} className="bg-white text-primary hover:bg-white">
                {added ? <><Check size={16} /> Added</> : <><Route size={16} /> Add to trip</>}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setSaved((value) => !value)} className="border-white/20 bg-white/15 text-white hover:bg-white/20">
                <Bookmark size={16} /> {saved ? 'Saved' : 'Save destination'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto -mt-8 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <section className="space-y-5">
          <InfoCard title="Overview">
            <p className="text-sm leading-7 text-slate-600">{destination.description} Traveloop recommends pairing top landmarks with flexible free time, local food stops, and at least one slow morning for a premium but practical route.</p>
          </InfoCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Metric icon={CalendarDays} label="Best time" value="Oct - Apr" />
            <Metric icon={DollarSign} label="Estimated cost" value={`$${destination.budgetEstimate.toLocaleString()}`} />
            <Metric icon={Clock} label="Ideal stay" value="4 - 6 days" />
          </div>

          <InfoCard title="Activities">
            <div className="grid gap-3 sm:grid-cols-2">
              {destination.activities.map((activity) => (
                <div key={activity.name} className="flex min-h-24 gap-3 rounded-2xl bg-slate-50 p-3">
                  <img src={activity.image} alt={activity.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-poppins text-sm font-bold text-textDark">{activity.name}</p>
                    <p className="mt-1 text-xs text-textMuted">{activity.category} • {activity.duration} • ${activity.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Food Recommendations">
            <div className="grid gap-3 sm:grid-cols-3">
              {foodPicks.map((item) => (
                <div key={item} className="rounded-2xl bg-primary/5 p-4">
                  <Utensils size={17} className="mb-3 text-primary" />
                  <p className="text-sm font-bold text-textDark">{item}</p>
                  <p className="mt-1 text-xs text-textMuted">Placeholder ready for restaurant API data.</p>
                </div>
              ))}
            </div>
          </InfoCard>
        </section>

        <aside className="space-y-5">
          <InfoCard title="Hotels">
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
              <Hotel size={26} className="mx-auto mb-3 text-primary" />
              <p className="text-sm font-bold text-textDark">Hotel search placeholder</p>
              <p className="mt-1 text-xs text-textMuted">Ready to connect booking inventory.</p>
            </div>
          </InfoCard>

          <InfoCard title="Nearby Attractions">
            <div className="space-y-3">
              {nearby.map((item) => (
                <button key={item.id} type="button" onClick={() => navigate(`/destinations/${item.id}`)} className="flex w-full gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-slate-50">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-textDark">{item.name}</span>
                    <span className="text-xs text-textMuted">{item.country}</span>
                  </span>
                </button>
              ))}
            </div>
          </InfoCard>
        </aside>
      </main>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} tripTitle={`${destination.name}, ${destination.country}`} tripUrl={`${window.location.origin}/destinations/${destination.id}`} />
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
      <h2 className="mb-4 font-poppins text-lg font-bold text-textDark">{title}</h2>
      {children}
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
      <Icon size={18} className="mb-3 text-primary" />
      <p className="text-xs font-bold uppercase tracking-wider text-textMuted">{label}</p>
      <p className="mt-1 font-poppins text-lg font-bold text-textDark">{value}</p>
    </div>
  );
}

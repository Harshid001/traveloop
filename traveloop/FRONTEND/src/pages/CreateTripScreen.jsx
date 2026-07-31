import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft, Trash2, Calendar, Check,
  ChevronUp, ChevronDown, Search, Star, Hotel, Utensils, Car, Ticket,
  Save, GripVertical, MapPin
} from 'lucide-react';
import { useGetDestinationsQuery, useCreateTripMutation } from '../services/apiSlice';
import Button from '../components/ui/Button';
import AppLayout from '../components/layout/AppLayout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 5, { duration: 1.2 }); }, [center, map]);
  return null;
}

export default function CreateTripScreen() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDests, setSelectedDests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyCenter, setFlyCenter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: destinations = [], isLoading: destsLoading } = useGetDestinationsQuery();
  const [createTrip] = useCreateTripMutation();

  const filtered = searchQuery.trim()
    ? destinations.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.country || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : destinations;

  const toggleDest = (dest) => {
    setSelectedDests((prev) => {
      const exists = prev.find((d) => d.id === dest.id || d._id === dest._id);
      if (exists) return prev.filter((d) => d.id !== dest.id && d._id !== dest._id);
      return [...prev, dest];
    });
    if (dest.lat && dest.lng) setFlyCenter([dest.lat, dest.lng]);
  };

  const moveDest = (idx, dir) => {
    setSelectedDests((prev) => {
      const arr = [...prev];
      const next = idx + dir;
      if (next < 0 || next >= arr.length) return arr;
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const removeDest = (id) => setSelectedDests((prev) => prev.filter((d) => d.id !== id && d._id !== id));

  const budget = useMemo(() => {
    let hotel = 0, transport = 0, food = 0, activity = 0;
    selectedDests.forEach((d) => {
      const est = d.budgetEstimate || d.budget || 2000;
      hotel += Math.round(est * 0.4);
      transport += Math.round(est * 0.25);
      food += Math.round(est * 0.2);
      const destData = destinations.find((dd) => dd.id === d.id || dd._id === d._id);
      destData?.activities?.forEach((act) => {
        activity += act.cost || 0;
      });
    });
    return { hotel, transport, food, activity, total: hotel + transport + food + activity };
  }, [selectedDests, destinations]);

  const routeLine = selectedDests
    .filter((d) => d.lat && d.lng)
    .map((d) => [d.lat, d.lng]);

  const handleSave = async () => {
    if (selectedDests.length === 0) return;
    setSaving(true);
    try {
      await createTrip({
        title: tripName || 'My Adventure',
        destinations: selectedDests.map((d) => d._id || d.id),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        budget: budget.total,
        status: 'upcoming',
      }).unwrap();
      setSaved(true);
      navigate('/my-trips');
    } catch (err) {
      console.error('Failed to create trip:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create Trip Itinerary</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedDests.length} destinations selected for your custom route</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSave} className="text-xs px-5 py-2.5 shadow-md" disabled={saving || saved || selectedDests.length === 0}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : <><Save size={14} /> Save Trip</>}
        </Button>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-6">
        <div className="relative z-0 h-[45dvh] min-h-[320px] lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md">
          <MapContainer center={[25, 40]} zoom={2} className="w-full h-full"
            scrollWheelZoom={false} zoomControl={false} dragging touchZoom doubleClickZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <FlyTo center={flyCenter} />

            {destinations.filter((d) => d.lat && d.lng).map((d) => {
              const dId = d._id || d.id;
              const isSelected = selectedDests.some((s) => (s._id || s.id) === dId);
              return (
                <Marker key={dId} position={[d.lat, d.lng]} icon={isSelected ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => toggleDest(d) }}>
                  <Popup>
                    <div className="text-center min-w-[140px]">
                      {d.image && <img src={d.image} alt={d.name} className="w-full h-20 object-cover rounded-lg mb-2" />}
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.country}</p>
                      <p className="text-xs font-bold text-primary mt-1">${(d.budgetEstimate || d.budget || 0).toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {routeLine.length > 1 && (
              <Polyline positions={routeLine} pathOptions={{ color: '#4F46E5', weight: 3.5, dashArray: '8, 8', opacity: 0.8 }} />
            )}
          </MapContainer>

          {selectedDests.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-[500] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-lg backdrop-blur-md">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{selectedDests.length} stop{selectedDests.length > 1 ? 's' : ''} · Route {routeLine.length > 1 ? 'connected' : 'pending'}</p>
            </div>
          )}
        </div>

        <div className="lg:w-1/2 overflow-y-auto space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft">
            <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Trip Details</h3>
            <input value={tripName} onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. European Summer Adventure"
              className="input-field mb-3 font-poppins font-semibold" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="input-field text-xs py-2.5 pl-11" />
              </div>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="input-field text-xs py-2.5 pl-11" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft">
            <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Select Destinations</h3>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="input-field text-xs py-2.5 pl-10" />
            </div>

            {destsLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
            ) : (
              <div className="grid max-h-64 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {filtered.map((d) => {
                  const dId = d._id || d.id;
                  const selected = selectedDests.some((s) => (s._id || s.id) === dId);
                  const img = d.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80';
                  return (
                    <motion.button key={dId} whileTap={{ scale: 0.96 }}
                      onClick={() => toggleDest(d)}
                      className={`relative rounded-xl overflow-hidden h-24 group text-left transition-all ${selected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800' : 'ring-1 ring-slate-200 dark:ring-slate-700'}`}>
                      <img src={img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      {selected && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                      <div className="absolute bottom-0 left-0 p-2">
                        <p className="text-white text-xs font-semibold leading-tight">{d.name}</p>
                        <p className="text-white/70 text-[9px]">{d.country}</p>
                      </div>
                      {d.rating && (
                        <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                          <Star size={8} className="fill-amber-400 text-amber-400" />
                          <span className="text-white text-[9px] font-medium">{d.rating}</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">Your Route ({selectedDests.length} stops)</h3>
              {selectedDests.map((dest, idx) => {
                const dId = dest._id || dest.id;
                const fullDest = destinations.find((d) => (d._id || d.id) === dId);
                const img = dest.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80';
                return (
                  <motion.div key={dId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent">
                      <div className="flex flex-col gap-0.5">
                        <button aria-label={`Move ${dest.name} up`} onClick={() => moveDest(idx, -1)} disabled={idx === 0} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button aria-label={`Move ${dest.name} down`} onClick={() => moveDest(idx, 1)} disabled={idx === selectedDests.length - 1} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronDown size={12} /></button>
                      </div>
                      <GripVertical size={14} className="text-slate-400" />
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                      <img src={img} alt={dest.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{dest.name}{dest.country ? `, ${dest.country}` : ''}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">${(dest.budgetEstimate || dest.budget || 0).toLocaleString()} est. · {fullDest?.activities?.length || 0} activities</p>
                      </div>
                      <button aria-label={`Remove ${dest.name}`} onClick={() => removeDest(dId)} className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {selectedDests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl p-5 text-white shadow-xl">
              <h3 className="font-poppins text-sm font-bold mb-4">Estimated Budget Breakdown</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Hotels', val: budget.hotel, icon: Hotel },
                  { label: 'Transport', val: budget.transport, icon: Car },
                  { label: 'Food', val: budget.food, icon: Utensils },
                  { label: 'Activities', val: budget.activity, icon: Ticket },
                ].map((b) => (
                  <div key={b.label} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <b.icon size={15} className="text-white/80 mb-1" />
                    <p className="font-poppins text-lg font-bold">${b.val.toLocaleString()}</p>
                    <p className="text-[10px] text-white/70 font-medium">{b.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-0.5">Total Estimated Budget</p>
                <p className="font-poppins text-3xl font-extrabold">${budget.total.toLocaleString()}</p>
              </div>
            </motion.div>
          )}

          <div className="pb-8">
            <Button variant="primary" onClick={handleSave} className="w-full py-4 text-sm font-bold shadow-lg" disabled={saving || saved || selectedDests.length === 0}>
              {saving ? 'Saving Trip...' : saved ? 'Trip Saved!' : 'Save Trip Itinerary'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
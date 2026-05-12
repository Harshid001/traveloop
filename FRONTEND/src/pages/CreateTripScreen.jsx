import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft, Trash2, Calendar, Check,
  ChevronUp, ChevronDown, Search, Star, Hotel, Utensils, Car, Ticket,
  Save, GripVertical,
} from 'lucide-react';
import { destinations } from '../data/trips';
import Button from '../components/common/Button';

/* Fix default Leaflet marker icon */
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

/* Fly to helper */
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
  const [selectedActivities, setSelectedActivities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [flyCenter, setFlyCenter] = useState(null);
  const [saved, setSaved] = useState(false);

  /* Filtered destinations for search */
  const filtered = searchQuery.trim()
    ? destinations.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase()))
    : destinations;

  /* Toggle destination selection */
  const toggleDest = (dest) => {
    setSelectedDests((prev) => {
      const exists = prev.find((d) => d.id === dest.id);
      if (exists) return prev.filter((d) => d.id !== dest.id);
      return [...prev, dest];
    });
    setFlyCenter([dest.lat, dest.lng]);
  };

  /* Toggle activity */
  const toggleActivity = (destId, actName) => {
    setSelectedActivities((prev) => {
      const curr = prev[destId] || [];
      return { ...prev, [destId]: curr.includes(actName) ? curr.filter((a) => a !== actName) : [...curr, actName] };
    });
  };

  /* Move destination */
  const moveDest = (idx, dir) => {
    setSelectedDests((prev) => {
      const arr = [...prev];
      const next = idx + dir;
      if (next < 0 || next >= arr.length) return arr;
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const removeDest = (id) => setSelectedDests((prev) => prev.filter((d) => d.id !== id));

  /* Budget calculation */
  const budget = useMemo(() => {
    let hotel = 0, transport = 0, food = 0, activity = 0;
    selectedDests.forEach((d) => {
      hotel += Math.round(d.budgetEstimate * 0.4);
      transport += Math.round(d.budgetEstimate * 0.25);
      food += Math.round(d.budgetEstimate * 0.2);
      const acts = selectedActivities[d.id] || [];
      const destData = destinations.find((dd) => dd.id === d.id);
      acts.forEach((aName) => {
        const act = destData?.activities.find((a) => a.name === aName);
        if (act) activity += act.cost;
      });
    });
    return { hotel, transport, food, activity, total: hotel + transport + food + activity };
  }, [selectedDests, selectedActivities]);

  /* Route line */
  const routeLine = selectedDests.map((d) => [d.lat, d.lng]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/my-trips'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-poppins text-base sm:text-lg font-bold text-gray-900">Create Trip</h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">{selectedDests.length} destinations selected</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleSave} className="text-xs px-3 sm:px-5 py-2 sm:py-2.5" disabled={saved}>
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> <span className="hidden sm:inline">Save Trip</span><span className="sm:hidden">Save</span></>}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* ===== LEFT: MAP ===== */}
        <div className="relative z-0 h-[45dvh] min-h-[320px] lg:sticky lg:top-16 lg:h-auto lg:w-1/2">
          <MapContainer center={[25, 40]} zoom={2} className="w-full h-full"
            scrollWheelZoom={false} zoomControl={false} dragging touchZoom doubleClickZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <FlyTo center={flyCenter} />

            {/* All destination markers */}
            {destinations.map((d) => {
              const isSelected = selectedDests.some((s) => s.id === d.id);
              return (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={isSelected ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => toggleDest(d) }}>
                  <Popup>
                    <div className="text-center min-w-[140px]">
                      <img src={d.image} alt={d.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.country}</p>
                      <p className="text-xs font-bold text-accent mt-1">${d.budgetEstimate.toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route polyline */}
            {routeLine.length > 1 && (
              <Polyline positions={routeLine} pathOptions={{ color: '#4F46E5', weight: 3, dashArray: '10, 8', opacity: 0.7 }} />
            )}
          </MapContainer>

          {/* Map overlay — selected count */}
          {selectedDests.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-[500] rounded-xl bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md sm:right-auto">
              <p className="text-xs font-semibold text-gray-800">{selectedDests.length} stop{selectedDests.length > 1 ? 's' : ''} · Route {routeLine.length > 1 ? 'planned' : 'pending'}</p>
            </div>
          )}
        </div>

        {/* ===== RIGHT: TRIP BUILDER ===== */}
        <div className="lg:w-1/2 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">

            {/* Trip Name & Dates */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-poppins text-sm font-bold text-gray-900 mb-3">Trip Details</h3>
              <input value={tripName} onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. European Adventure"
                className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all mb-3 font-poppins font-semibold" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-2.5 pl-11 pr-3 text-xs text-gray-700 outline-none focus:border-accent transition-all" />
                </div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-2.5 pl-11 pr-3 text-xs text-gray-700 outline-none focus:border-accent transition-all" />
                </div>
              </div>
            </div>

            {/* Search Destinations */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-poppins text-sm font-bold text-gray-900 mb-3">Select Destinations</h3>
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Paris, Tokyo, Bali..."
                  className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-xs text-gray-700 outline-none focus:border-accent transition-all" />
              </div>

              <div className="grid max-h-64 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {filtered.map((d) => {
                  const selected = selectedDests.some((s) => s.id === d.id);
                  return (
                    <motion.button key={d.id} whileTap={{ scale: 0.96 }}
                      onClick={() => toggleDest(d)}
                      className={`relative rounded-xl overflow-hidden h-24 group text-left transition-all ${selected ? 'ring-2 ring-accent ring-offset-1' : 'ring-1 ring-gray-100'}`}>
                      <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {selected && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                      <div className="absolute bottom-0 left-0 p-2">
                        <p className="text-white text-xs font-semibold leading-tight">{d.name}</p>
                        <p className="text-white/60 text-[9px]">{d.country}</p>
                      </div>
                      <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                        <Star size={8} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-[9px] font-medium">{d.rating}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Selected Destinations & Activities */}
            {selectedDests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-poppins text-sm font-bold text-gray-900">Your Route ({selectedDests.length} stops)</h3>
                {selectedDests.map((dest, idx) => {
                  const fullDest = destinations.find((d) => d.id === dest.id);
                  const selActs = selectedActivities[dest.id] || [];
                  return (
                    <motion.div key={dest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#f0f0ff] to-white border-b border-gray-50">
                        <div className="flex flex-col gap-0.5">
                          <button aria-label={`Move ${dest.name} up`} onClick={() => moveDest(idx, -1)} disabled={idx === 0} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-gray-300 hover:text-accent disabled:opacity-30"><ChevronUp size={12} /></button>
                          <button aria-label={`Move ${dest.name} down`} onClick={() => moveDest(idx, 1)} disabled={idx === selectedDests.length - 1} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-gray-300 hover:text-accent disabled:opacity-30"><ChevronDown size={12} /></button>
                        </div>
                        <GripVertical size={14} className="text-gray-300" />
                        <span className="w-6 h-6 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                        <img src={dest.image} alt={dest.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{dest.name}, {dest.country}</p>
                          <p className="text-[10px] text-gray-400">${dest.budgetEstimate.toLocaleString()} est. · {fullDest.activities.length} activities</p>
                        </div>
                        <button aria-label={`Remove ${dest.name}`} onClick={() => removeDest(dest.id)} className="tap-target rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100"><Trash2 size={12} /></button>
                      </div>

                      {/* Activities */}
                      <div className="p-3">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Pick Activities</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {fullDest.activities.map((act) => {
                            const isAct = selActs.includes(act.name);
                            return (
                              <button key={act.name} onClick={() => toggleActivity(dest.id, act.name)}
                                className={`flex min-h-14 items-center gap-2 p-2 rounded-xl text-left transition-all ${isAct ? 'bg-accent/5 ring-1 ring-accent/30' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <img src={act.image} alt={act.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-semibold text-gray-800 truncate">{act.name}</p>
                                  <p className="text-[9px] text-gray-400">${act.cost} · {act.duration}</p>
                                </div>
                                {isAct && <Check size={12} className="text-accent shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Budget Estimation */}
            {selectedDests.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-accent to-purple-600 rounded-2xl p-5 text-white">
                <h3 className="font-poppins text-sm font-bold mb-4">Estimated Budget</h3>
                <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
                  {[
                    { label: 'Hotels', val: budget.hotel, icon: Hotel },
                    { label: 'Transport', val: budget.transport, icon: Car },
                    { label: 'Food', val: budget.food, icon: Utensils },
                    { label: 'Activities', val: budget.activity, icon: Ticket },
                  ].map((b) => (
                    <div key={b.label} className="bg-white/10 rounded-xl p-3">
                      <b.icon size={14} className="text-white/60 mb-1" />
                      <p className="font-poppins text-lg font-bold">${b.val.toLocaleString()}</p>
                      <p className="text-[10px] text-white/60">{b.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/15 rounded-xl p-4 text-center">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Total Estimated</p>
                  <p className="font-poppins text-3xl font-bold">${budget.total.toLocaleString()}</p>
                </div>
              </motion.div>
            )}

            {/* Save */}
            <div className="pb-8">
              <Button variant="primary" onClick={handleSave} className="w-full py-4 text-sm" disabled={saved || selectedDests.length === 0}>
                {saved ? <><Check size={16} /> Trip Saved!</> : <><Save size={16} /> Save Trip</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

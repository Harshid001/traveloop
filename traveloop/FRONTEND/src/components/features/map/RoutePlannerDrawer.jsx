import React, { useState } from 'react';
import {
  MapPin, Navigation, Trash2, ArrowUp, ArrowDown, Play, Sparkles, X,
  Clock, Compass, Fuel, DollarSign, Plane, Train, Bus, Car
} from 'lucide-react';

export default function RoutePlannerDrawer({
  routeStops,
  setRouteStops,
  onClose,
  onPlayFlyover,
  onOptimizeRoute
}) {
  const [selectedTransport, setSelectedTransport] = useState('car');

  // Compute metrics dynamically based on stops count and distances
  const totalStops = routeStops.length;

  let totalDistanceKm = 0;
  for (let i = 0; i < routeStops.length - 1; i++) {
    const a = routeStops[i];
    const b = routeStops[i + 1];
    const d = calculateHaversineDistance(a.lat, a.lng, b.lat, b.lng);
    totalDistanceKm += d;
  }

  const travelHours = (totalDistanceKm / 80).toFixed(1); // avg 80km/h
  const fuelEst = (totalDistanceKm * 0.08 * 1.5).toFixed(0); // 8L/100km at $1.5/L
  const tollEst = (totalStops > 1 ? (totalStops - 1) * 18 : 0);

  const moveStop = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= routeStops.length) return;
    const updated = [...routeStops];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setRouteStops(updated);
  };

  const removeStop = (id) => {
    setRouteStops(routeStops.filter((s) => s.id !== id));
  };

  return (
    <aside className="fixed top-0 right-0 z-[1000] h-full w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 text-white shadow-2xl overflow-y-auto flex flex-col font-poppins">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
            <Navigation size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Route &amp; Itinerary Planner</h2>
            <p className="text-[11px] text-slate-400">{totalStops} stops planned</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 space-y-5 text-xs">
        {totalStops === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mx-auto">
              <MapPin size={24} />
            </div>
            <p className="font-bold text-slate-300">No route stops selected</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Click "Get Directions" or "+ Add to Route" on any destination marker or panel to build your custom travel itinerary.
            </p>
          </div>
        ) : (
          <>
            {/* Route Action Controls */}
            <div className="flex gap-2">
              <button
                onClick={onOptimizeRoute}
                className="flex-1 py-2 px-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold hover:bg-indigo-500/30 flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Sparkles size={14} /> Auto-Optimize Route
              </button>
              <button
                onClick={onPlayFlyover}
                className="flex-1 py-2 px-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/30 flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Play size={14} className="fill-emerald-300" /> 3D Flyover
              </button>
            </div>

            {/* Transport Options Switcher */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Transport Mode</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'car', label: 'Drive', icon: Car },
                  { id: 'flight', label: 'Flight', icon: Plane },
                  { id: 'train', label: 'Train', icon: Train },
                  { id: 'bus', label: 'Bus', icon: Bus },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedTransport(mode.id)}
                      className={`py-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        selectedTransport === mode.id
                          ? 'bg-primary text-white border-primary-light shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Compass size={12} className="text-cyan-400" /> Total Distance
                </span>
                <p className="text-base font-extrabold text-white mt-1">{totalDistanceKm.toFixed(0)} km</p>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={12} className="text-indigo-400" /> Est. Travel Time
                </span>
                <p className="text-base font-extrabold text-white mt-1">~{travelHours} hours</p>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Fuel size={12} className="text-amber-400" /> Fuel Estimate
                </span>
                <p className="text-base font-extrabold text-white mt-1">${fuelEst}</p>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <DollarSign size={12} className="text-emerald-400" /> Toll Estimate
                </span>
                <p className="text-base font-extrabold text-white mt-1">${tollEst}</p>
              </div>
            </div>

            {/* Stops List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400">Itinerary Sequence</span>
              <div className="space-y-2">
                {routeStops.map((stop, idx) => (
                  <div
                    key={stop.id || idx}
                    className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/30 text-primary-light font-extrabold text-xs flex items-center justify-center border border-primary/40 shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white text-xs">{stop.name} {stop.flag}</p>
                        <p className="text-[10px] text-slate-400">{stop.country || stop.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveStop(idx, -1)}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-slate-300"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveStop(idx, 1)}
                        disabled={idx === routeStops.length - 1}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-slate-300"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 flex items-center justify-center text-rose-300 ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// Haversine helper
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

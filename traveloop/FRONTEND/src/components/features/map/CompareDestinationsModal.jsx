import { X, Scale, Star, Thermometer, ShieldCheck, DollarSign, Calendar, Clock, Check } from 'lucide-react';

export default function CompareDestinationsModal({ compareList, onRemoveFromCompare, onClose }) {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-poppins">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Compare Travel Destinations</h2>
              <p className="text-xs text-slate-400">Comparing {compareList.length} destinations side-by-side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-[600px]">
            {compareList.map((dest) => (
              <div
                key={dest.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4 relative flex flex-col justify-between"
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemoveFromCompare(dest.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-rose-500/80 text-white flex items-center justify-center"
                >
                  <X size={14} />
                </button>

                <div className="space-y-2">
                  <img src={dest.image} alt={dest.name} className="w-full h-32 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                      {dest.name} <span>{dest.flag}</span>
                    </h3>
                    <p className="text-xs text-slate-400">{dest.country} · {dest.category}</p>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> Rating
                    </span>
                    <span className="font-bold text-amber-300">{dest.rating} / 5.0</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <DollarSign size={12} className="text-emerald-400" /> Est. Daily Cost
                    </span>
                    <span className="font-bold text-emerald-400">${dest.pricePerDay} / day</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Thermometer size={12} className="text-amber-400" /> Weather
                    </span>
                    <span className="font-bold text-white">{dest.tempC}°C · {dest.weatherCondition}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" /> Safety Score
                    </span>
                    <span className="font-bold text-white">{dest.safetyScore}/100</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={12} className="text-cyan-400" /> Flight/Transit
                    </span>
                    <span className="font-bold text-white truncate max-w-[120px]">{dest.flightTimeHours}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-indigo-400" /> Best Season
                    </span>
                    <span className="font-bold text-white truncate max-w-[120px]">{dest.bestSeason}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400">Included Services</span>
                  <div className="space-y-1">
                    {dest.includedServices?.slice(0, 3).map((serv) => (
                      <div key={serv} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <Check size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{serv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

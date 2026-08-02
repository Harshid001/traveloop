import { useState } from 'react';
import {
  CloudSun, Wind, Droplets, AlertTriangle, ShieldCheck, Sun, Moon,
  DollarSign, Activity, Users, ChevronDown, ChevronUp, Radio
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1.0 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.78 },
  { code: 'JPY', symbol: '¥', rate: 155.4 },
  { code: 'INR', symbol: '₹', rate: 86.5 },
  { code: 'CAD', symbol: 'CA$', rate: 1.38 },
];

export default function LiveInfoDashboard({ selectedDest, trafficOn, setTrafficOn }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState(100);

  const destName = selectedDest?.name || 'Global Travel Watch';
  const temp = selectedDest?.tempC ?? 24;
  const condition = selectedDest?.weatherCondition || 'Clear Sky';
  const aqi = selectedDest?.aqi ?? 18;
  const humidity = selectedDest?.humidity || '52%';
  const wind = selectedDest?.windSpeed || '12 km/h';
  const crowd = selectedDest?.crowdLevel || 'Moderate';
  const safety = selectedDest?.safetyScore ?? 95;

  const currentRateObj = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];
  const convertedVal = (amount * currentRateObj.rate).toFixed(2);

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl p-4 shadow-2xl font-poppins transition-all duration-300 w-full max-w-sm">
      {/* Top Summary Bar */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <CloudSun size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white truncate max-w-[150px]">{destName}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio size={10} className="animate-ping text-emerald-400" /> LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {temp}°C · {condition}
            </p>
          </div>
        </div>

        <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Live Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 text-xs">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5">
              <Droplets size={16} className="text-cyan-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Humidity</p>
                <p className="font-bold text-white text-xs">{humidity}</p>
              </div>
            </div>

            <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5">
              <Wind size={16} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Wind Speed</p>
                <p className="font-bold text-white text-xs">{wind}</p>
              </div>
            </div>

            <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5">
              <Activity size={16} className={aqi < 30 ? 'text-emerald-400' : 'text-amber-400'} />
              <div>
                <p className="text-[10px] text-slate-400">Air Quality (AQI)</p>
                <p className="font-bold text-white text-xs">{aqi} · {aqi < 30 ? 'Good' : 'Moderate'}</p>
              </div>
            </div>

            <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5">
              <Users size={16} className="text-purple-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Crowd Level</p>
                <p className="font-bold text-white text-xs">{crowd}</p>
              </div>
            </div>
          </div>

          {/* Safety Advisory & Sunrise */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-200 text-xs">Safety Index: {safety}/100</p>
                <p className="text-[10px] text-emerald-300/80">No active travel warnings reported</p>
              </div>
            </div>
          </div>

          {/* Sunrise / Sunset & Time Zone */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Sun size={14} /> Sunrise: 06:12 AM
            </div>
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Moon size={14} /> Sunset: 07:48 PM
            </div>
          </div>

          {/* Live Traffic Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className={trafficOn ? 'text-amber-400' : 'text-slate-400'} />
              <div>
                <p className="font-bold text-white text-xs">Live Traffic Overlay</p>
                <p className="text-[10px] text-slate-400">Highlight real-time road conditions</p>
              </div>
            </div>
            <button
              onClick={() => setTrafficOn(!trafficOn)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                trafficOn ? 'bg-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  trafficOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Currency Converter */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <DollarSign size={13} className="text-emerald-400" /> Currency Converter
              </span>
              <span>1 USD = {currentRateObj.rate} {currentRateObj.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-20 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">USD =</span>
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>{convertedVal}</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

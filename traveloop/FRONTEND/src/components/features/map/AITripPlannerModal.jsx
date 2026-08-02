import { useState } from 'react';
import {
  Sparkles, Users, Calendar, MapPin, Compass, CheckCircle2,
  X, ArrowRight, Navigation, Loader2, AlertCircle
} from 'lucide-react';
import { sendChatbotMessage } from '../../chatbot/chatbotApi';

export default function AITripPlannerModal({ isOpen, onClose, onApplyAIRoute }) {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(2500);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(5);
  const [startCity, setStartCity] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(['Beach', 'Culture']);
  const [accommodation, setAccommodation] = useState('Resort & Spa');

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [rawAiText, setRawAiText] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAiError(null);
    setRawAiText('');

    const prompt = `Plan a ${days}-day trip for ${travelers} traveler(s) with a total budget of $${budget} USD.
Traveling from: ${startCity || 'any city'}
Destination: ${destination || 'best destination for my interests'}
Interests: ${selectedInterests.join(', ')}
Accommodation preference: ${accommodation}

Please provide:
1. A catchy trip title
2. Day-by-day itinerary (Day 1 to Day ${days}) with specific activities, places to visit, meals, and local tips
3. Budget breakdown (accommodation, food, transport, activities)
4. Top 3 must-do experiences
5. Best time to visit and weather tips
6. 2-3 packing tips specific to this destination

Format the response clearly with day-by-day sections.`;

    try {
      const response = await sendChatbotMessage({
        message: prompt,
        history: [],
      });

      const text = response?.reply || response?.message || '';
      setRawAiText(text);

      // Parse the AI response into a structured plan
      const titleMatch = text.match(/(?:trip title|title)[:\s]+([^\n]+)/i);
      const tripTitle = titleMatch
        ? titleMatch[1].trim().replace(/[*#]/g, '')
        : `${days}-Day ${selectedInterests.join(' & ')} Adventure`;

      // Extract day lines
      const dayLines = [];
      const dayRegex = /(?:day\s*(\d+))[:\s–-]+([^\n]+)(?:\n((?:[^\n]+\n?)*?))?(?=day\s*\d+|$)/gi;
      let match;
      while ((match = dayRegex.exec(text)) !== null && dayLines.length < days) {
        const dayNum = parseInt(match[1]);
        const title = match[2]?.trim().replace(/[*#]/g, '') || `Day ${dayNum} Activities`;
        const details = match[3]?.trim().replace(/[*#-]/g, '').substring(0, 200) || 'Explore local highlights and enjoy the destination.';
        dayLines.push({ day: dayNum, title, details });
      }

      // Fill missing days if regex didn't capture all
      if (dayLines.length === 0) {
        for (let i = 1; i <= Math.min(days, 7); i++) {
          dayLines.push({
            day: i,
            title: i === 1 ? 'Arrival & Orientation' : i === days ? 'Farewell & Departure' : `Day ${i} — Exploration`,
            details: 'Explore the destination, visit key attractions, and enjoy local cuisine.',
          });
        }
      }

      setGeneratedPlan({
        title: tripTitle,
        totalEst: budget,
        dailyEst: Math.round(budget / days),
        breakdown: {
          stay: Math.round(budget * 0.4),
          food: Math.round(budget * 0.25),
          activities: Math.round(budget * 0.2),
          transit: Math.round(budget * 0.15),
        },
        daysList: dayLines,
        destination: destination || 'Your Selected Destination',
        fullText: text,
      });
      setStep(3);
    } catch (err) {
      console.error('AI Planner error:', err);
      setAiError(err.message || 'Failed to generate trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlanner = () => {
    setStep(1);
    setGeneratedPlan(null);
    setRawAiText('');
    setAiError(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-poppins">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">AI Travel Architect</h2>
              <p className="text-xs text-indigo-300 font-medium">
                Powered by DeepSeek V4 Pro &nbsp;·&nbsp; Real AI-generated itineraries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">

          {/* Step 1: Trip Parameters */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-bold text-slate-300 text-sm">Step 1 of 2 — Trip Details</p>

              {/* Destination */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-400" /> Where do you want to go?
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none placeholder:text-slate-500"
                  placeholder="e.g. Japan, Paris, Bali, New Zealand..."
                />
              </div>

              {/* Starting location */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Compass size={12} className="text-sky-400" /> Starting From (City / Airport)
                </label>
                <input
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none placeholder:text-slate-500"
                  placeholder="e.g. London LHR, New York JFK, Mumbai..."
                />
              </div>

              {/* Budget slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Total Budget</span>
                  <span className="text-emerald-400 font-extrabold">${budget.toLocaleString()} USD</span>
                </div>
                <input
                  type="range" min="500" max="15000" step="250"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Budget</span><span>Mid-Range</span><span>Luxury</span>
                </div>
              </div>

              {/* Travelers & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Users size={12} className="text-primary-light" /> Travelers
                  </label>
                  <select value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num} className="bg-slate-900 text-white">
                        {num} {num === 1 ? 'Solo Traveler' : 'Travelers'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-400" /> Trip Duration
                  </label>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none">
                    {[3, 4, 5, 7, 10, 14, 21].map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">{d} Days</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark font-extrabold text-xs text-white shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Preferences</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 2: Interests & Vibe */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="font-bold text-slate-300 text-sm">Step 2 of 2 — Your Travel Vibe</p>

              {/* Interests */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">Select Travel Interests</span>
                <div className="flex flex-wrap gap-2">
                  {['Beach', 'Culture', 'Adventure', 'Food & Dining', 'Luxury', 'Wildlife', 'Snow & Ski', 'Wellness', 'History', 'Photography', 'Nightlife', 'Family'].map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button key={interest} onClick={() => toggleInterest(interest)}
                        className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary-light shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accommodation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Accommodation Style</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Budget Hostel', 'Boutique Hotel', 'Resort & Spa', 'Private Villa', 'Airbnb / Local', 'Glamping'].map((acc) => (
                    <button key={acc} onClick={() => setAccommodation(acc)}
                      className={`p-2.5 rounded-2xl border text-[11px] font-bold text-center transition-all ${
                        accommodation === acc
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-500/30 rounded-2xl px-3.5 py-3 text-rose-300">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="text-[11px] font-semibold">{aiError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-xs text-slate-300">
                  Back
                </button>
                <button onClick={handleGenerate} disabled={isGenerating}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent font-extrabold text-xs text-white shadow-xl flex items-center justify-center gap-2 disabled:opacity-70">
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>DeepSeek AI is planning your trip...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate AI Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: AI-Generated Plan */}
          {step === 3 && generatedPlan && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-200">{generatedPlan.title}</h3>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    {days} days · {travelers} traveler(s) · Est. ${generatedPlan.totalEst.toLocaleString()} (~${generatedPlan.dailyEst}/day)
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      ✨ Generated by DeepSeek V4 Pro
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Stay', val: generatedPlan.breakdown.stay },
                  { label: 'Dining', val: generatedPlan.breakdown.food },
                  { label: 'Activities', val: generatedPlan.breakdown.activities },
                  { label: 'Transit', val: generatedPlan.breakdown.transit },
                ].map((b) => (
                  <div key={b.label} className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400">{b.label}</p>
                    <p className="font-bold text-white text-xs">${b.val.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Daily Schedule */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">📅 Daily Itinerary</span>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {generatedPlan.daysList.map((d) => (
                    <div key={d.day} className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-[11px] text-primary-light shrink-0">Day {d.day}</span>
                        <span className="font-bold text-[11px] text-white text-right">{d.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-normal leading-relaxed">{d.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full AI Text (scrollable) */}
              {rawAiText && (
                <details className="group">
                  <summary className="text-[11px] font-bold text-indigo-400 cursor-pointer hover:text-indigo-300">
                    📄 View Full AI Response
                  </summary>
                  <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl p-3 max-h-48 overflow-y-auto">
                    <pre className="text-[10px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {rawAiText}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={resetPlanner}
                  className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-xs text-slate-300">
                  Plan Again
                </button>
                <button
                  onClick={() => { onApplyAIRoute(); onClose(); }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-white shadow-xl flex items-center justify-center gap-2"
                >
                  <Navigation size={15} /> Apply Route on Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

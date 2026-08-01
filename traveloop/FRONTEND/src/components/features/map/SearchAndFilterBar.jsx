import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Mic, MicOff, SlidersHorizontal, X, History, TrendingUp, Sparkles, Star, MapPin, DollarSign, Calendar
} from 'lucide-react';
import { MARKER_CATEGORIES } from '../../../data/destinationsData';

const TRENDING_TAGS = ['Santorini', 'Kyoto Temples', 'Swiss Alps', 'Dubai Desert', 'Bali Beaches', 'Banff Lakes'];

export default function SearchAndFilterBar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  destinations,
  onSelectDestination,
  filterOptions,
  setFilterOptions,
}) {
  const [isListening, setIsListening] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traveloop_search_history') || '["Santorini", "Kyoto"]'); }
    catch { return ['Santorini', 'Kyoto']; }
  });

  const searchInputRef = useRef(null);

  // Filtered autocomplete matches
  const autocompleteResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, destinations]);

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported on this browser. Try Google Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      addToHistory(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const addToHistory = (query) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const next = [query, ...prev.filter((q) => q.toLowerCase() !== query.toLowerCase())].slice(0, 5);
      localStorage.setItem('traveloop_search_history', JSON.stringify(next));
      return next;
    });
  };

  const handleSelectResult = (dest) => {
    setSearchQuery(dest.name);
    addToHistory(dest.name);
    setShowAutocomplete(false);
    onSelectDestination(dest);
  };

  return (
    <div className="relative w-full max-w-2xl font-poppins z-[30]">
      {/* Search Input Container */}
      <div className="relative flex items-center bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-3xl px-4 py-2.5 shadow-2xl transition-all hover:border-white/30">
        <Search size={18} className="text-primary-light shrink-0 mr-3" />

        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowAutocomplete(true);
          }}
          onFocus={() => setShowAutocomplete(true)}
          placeholder="Search destinations, hotels, attractions, airports, cities..."
          className="w-full bg-transparent text-xs font-medium text-white placeholder-slate-400 outline-none"
        />

        {/* Clear search button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowAutocomplete(false);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white mr-2"
          >
            <X size={14} />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          onClick={toggleVoiceSearch}
          className={`p-2 rounded-2xl border transition-all mr-2 flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15 hover:text-white'
          }`}
          title={isListening ? 'Listening...' : 'Voice Search'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilterModal(!showFilterModal)}
          className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            filterOptions.maxPrice < 500 || filterOptions.minRating > 0 || filterOptions.category !== 'All'
              ? 'bg-primary text-white border-primary-light shadow-lg'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Autocomplete & Recent History Dropdown */}
      {showAutocomplete && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl space-y-3 z-50">
          {autocompleteResults.length > 0 ? (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> Suggestions
              </p>
              <div className="space-y-1">
                {autocompleteResults.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleSelectResult(dest)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src={dest.image} alt={dest.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-xs text-white">{dest.name} {dest.flag}</p>
                        <p className="text-[10px] text-slate-400">{dest.country} · {dest.category}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">${dest.pricePerDay}/day</span>
                  </button>
                ))}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            <p className="text-xs text-slate-400 text-center py-2">No matching destinations found</p>
          ) : null}

          {/* Recent Search History */}
          {searchHistory.length > 0 && !searchQuery.trim() && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <History size={12} className="text-primary-light" /> Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setSearchQuery(q);
                      setShowAutocomplete(false);
                    }}
                    className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <History size={10} className="text-slate-400" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Tags */}
          {!searchQuery.trim() && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-rose-400" /> Trending Destinations
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setShowAutocomplete(false);
                      addToHistory(tag);
                    }}
                    className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/30 text-xs font-bold text-primary-light hover:bg-primary/30 transition-colors"
                  >
                    🔥 {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Smart Filters Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white font-poppins space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary-light" /> Smart Travel Filters
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Max Daily Budget</span>
                <span className="text-emerald-400">${filterOptions.maxPrice}/day</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={filterOptions.maxPrice}
                onChange={(e) => setFilterOptions({ ...filterOptions, maxPrice: Number(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Minimum Rating</span>
              <div className="flex gap-2">
                {[0, 4.5, 4.8, 4.9].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFilterOptions({ ...filterOptions, minRating: star })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      filterOptions.minRating === star
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Star size={12} className={star > 0 ? 'fill-amber-400 text-amber-400' : ''} />
                    <span>{star === 0 ? 'Any' : `${star}+`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Category / Vibe</span>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {['All', 'Beach', 'Mountain', 'Heritage', 'Adventure', 'Luxury', 'Honeymoon'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setFilterOptions({ ...filterOptions, category: cat });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-white border-primary-light shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setFilterOptions({ maxPrice: 500, minRating: 0, category: 'All' });
                  setActiveCategory('All');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-xs font-bold text-white shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

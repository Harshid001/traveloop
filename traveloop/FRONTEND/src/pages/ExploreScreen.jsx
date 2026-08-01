import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Compass, Heart, Layers, List, Map, MapPin, Search, SlidersHorizontal, Star, Sparkles
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import InteractiveDestinationMap from '../components/features/map/InteractiveDestinationMap';
import { GLOBAL_DESTINATIONS } from '../data/destinationsData';

const CATS = ['All', 'Beach', 'Mountain', 'Heritage', 'Adventure', 'Luxury', 'Honeymoon'];

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [view, setView] = useState('map');

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return GLOBAL_DESTINATIONS.filter((d) => {
      const matchSearch =
        !text ||
        `${d.name} ${d.country} ${d.description} ${d.category}`.toLowerCase().includes(text);
      const matchCat = activeCategory === 'All' || d.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [query, activeCategory]);

  return (
    <AppLayout>
      <div className="page-shell space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to home"
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-poppins text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Mapbox Travel Explorer <Sparkles size={18} className="text-primary" />
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discover destinations, plan 3D routes, compare spots &amp; book tours live on Mapbox
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex">
              <button
                aria-label="Map view"
                onClick={() => setView('map')}
                className={`flex h-9 px-3 items-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                  view === 'map'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Map size={15} />
                <span>3D Map</span>
              </button>
              <button
                aria-label="List view"
                onClick={() => setView('list')}
                className={`flex h-9 px-3 items-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                  view === 'list'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <List size={15} />
                <span>Grid List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main View Area */}
        {view === 'map' ? (
          <div className="w-full">
            <InteractiveDestinationMap initialCategory={activeCategory} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigate(`/destinations/${dest.id}`)}
                className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white">
                    {dest.flag} {dest.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1">
                    <Star size={12} className="fill-white" /> {dest.rating}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-poppins font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>{dest.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs">${dest.pricePerDay}/day</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

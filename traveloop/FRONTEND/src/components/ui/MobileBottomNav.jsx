import { NavLink } from 'react-router-dom';
import { Compass, Heart, Home, Map, User } from 'lucide-react';

const items = [
  { label: 'Home', to: '/home', icon: Home },
  { label: 'Trips', to: '/my-trips', icon: Map },
  { label: 'Explore', to: '/explore', icon: Compass },
  { label: 'Saved', to: '/saved', icon: Heart },
  { label: 'Profile', to: '/profile', icon: User },
];

export default function MobileBottomNav() {
  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-2 pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl safe-bottom md:hidden transition-colors duration-300"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `tap-target flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}


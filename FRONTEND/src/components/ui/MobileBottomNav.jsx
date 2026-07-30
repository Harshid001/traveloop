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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 px-2 pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl safe-bottom md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `tap-target flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary/8 text-primary'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
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

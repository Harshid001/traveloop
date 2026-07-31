import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bell, Search, MapPin, Phone, Mail, LogOut,
  PenLine, X, User, Sun, Moon, Plus
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Header component for the Home page.
 * All interactive state (search, profile menu, etc.) is managed by the parent
 * `HomePage` and passed down via props. This keeps the component pure and
 * preserves existing Framer Motion animations.
 */
export default function HomeHeader({
  user,
  firstLetter,
  profileOpen,
  setProfileOpen,
  editMode,
  setEditMode,
  editForm,
  setEditForm,
  saveProfile,
  handleLogout,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  filteredTrips,
  // Refs are created in HomePage and passed in so we don't recreate them here
  profileRef,
  searchRef,
}) {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent text-white flex items-center justify-center shadow-sm">
            <Send size={19} className="transform -rotate-12" />
          </div>
          <span className="font-poppins text-xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight hidden sm:inline">
            Traveloop
          </span>
        </div>

        {/* Search Input */}
        <div className="relative min-w-0 flex-1 max-w-lg" ref={searchRef}>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search destinations, trips, activities..."
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2 pl-11 pr-16 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all duration-200"
            />
            {!searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-300/40 dark:border-slate-600/40">
                ⌘K
              </span>
            )}
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="absolute right-2 top-1/2 flex min-h-8 min-w-8 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {searchOpen && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden z-50 max-h-80 overflow-y-auto"
              >
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { navigate(`/trip/${t.id}`); setSearchOpen(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left group border-b border-slate-100 dark:border-slate-700/40 last:border-0"
                    >
                      <img src={t.image} alt={t.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{t.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={10} />{t.location}</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-primary dark:text-primary-light shrink-0">{t.price}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No results for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/create-trip')}
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-poppins text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={15} />
            <span>Create Trip</span>
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          <button
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors shrink-0 flex items-center justify-center"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>
          
          <button
            aria-label="Open profile page"
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors shrink-0 hidden sm:flex items-center justify-center"
          >
            <User size={18} />
          </button>

          {/* Profile Avatar */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              aria-label="Open profile menu"
              onClick={() => { setProfileOpen((p) => !p); setEditMode(false); }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent text-white font-poppins font-bold text-sm flex items-center justify-center hover:shadow-md transition-all"
            >
              {firstLetter}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
                >
                  <div className="bg-gradient-to-br from-primary via-secondary to-accent p-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold font-poppins text-white">
                        {firstLetter}
                      </div>
                      <button
                        aria-label="Edit profile summary"
                        onClick={() => setEditMode(!editMode)}
                        className="tap-target rounded-full text-white/80 hover:text-white transition-colors"
                      >
                        <PenLine size={16} />
                      </button>
                    </div>
                    <p className="font-poppins font-bold text-white text-base mt-3">{user.firstName} {user.lastName}</p>
                    <p className="text-white/70 text-xs mt-0.5">{user.email}</p>
                  </div>
                  {editMode ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="input-field text-xs py-2 pl-3"
                          placeholder="First Name"
                        />
                        <input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="input-field text-xs py-2 pl-3"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="input-field text-xs py-2 pl-3"
                        placeholder="Email"
                      />
                      <input
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="input-field text-xs py-2 pl-3"
                        placeholder="Phone"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveProfile}
                          className="flex-1 bg-primary text-white text-xs font-semibold rounded-xl py-2 hover:bg-primary-dark transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditMode(false); setEditForm(user); }}
                          className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-1">
                      <div className="flex min-w-0 items-center gap-3 text-slate-600 dark:text-slate-300 text-sm py-2 px-2">
                        <Phone size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{user.mobile}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-3 text-slate-600 dark:text-slate-300 text-sm py-2 px-2">
                        <Mail size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <hr className="border-slate-100 dark:border-slate-700 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-danger text-sm font-semibold py-2.5 px-2 rounded-xl hover:bg-danger/10 transition-colors"
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

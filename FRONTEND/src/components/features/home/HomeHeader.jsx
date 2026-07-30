import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bell, Search, MapPin, Phone, Mail, LogOut,
  PenLine, X, User,
} from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Send size={18} className="text-primary" />
          </div>
          <span className="font-poppins text-lg font-bold text-primary tracking-tight hidden sm:inline">Traveloop</span>
        </div>

        {/* Search */}
        <div className="relative min-w-0 flex-1 max-w-lg" ref={searchRef}>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search cities, activities..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-sm text-textDark placeholder-textMuted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="absolute right-1 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"
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
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
              >
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { navigate(`/trip/${t.id}`); setSearchOpen(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <img src={t.image} alt={t.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-textDark truncate group-hover:text-primary transition-colors">{t.title}</p>
                        <p className="text-xs text-textMuted flex items-center gap-1"><MapPin size={10} />{t.location}</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-primary shrink-0">{t.price}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search size={20} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-textMuted text-sm">No results for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
            className="tap-target hidden rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0 sm:flex items-center justify-center"
          >
            <Bell size={18} />
          </button>
          <button
            aria-label="Open profile page"
            onClick={() => navigate('/profile')}
            className="tap-target hidden rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0 sm:flex items-center justify-center"
          >
            <User size={18} />
          </button>

          {/* Profile Avatar */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              aria-label="Open profile menu"
              onClick={() => { setProfileOpen((p) => !p); setEditMode(false); }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent text-white font-poppins font-bold text-sm flex items-center justify-center hover:shadow-md transition-all"
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
                  className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                >
                  <div className="bg-gradient-to-br from-primary to-accent p-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold font-poppins text-white">
                        {firstLetter}
                      </div>
                      <button
                        aria-label="Edit profile summary"
                        onClick={() => setEditMode(!editMode)}
                        className="tap-target rounded-full text-white/70 hover:text-white transition-colors"
                      >
                        <PenLine size={16} />
                      </button>
                    </div>
                    <p className="font-poppins font-semibold text-white text-base mt-3">{user.firstName} {user.lastName}</p>
                    <p className="text-white/60 text-xs mt-0.5">{user.email}</p>
                  </div>
                  {editMode ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="input-field text-xs py-2.5 pl-3"
                          placeholder="First Name"
                        />
                        <input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="input-field text-xs py-2.5 pl-3"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="input-field text-xs py-2.5 pl-3"
                        placeholder="Email"
                      />
                      <input
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="input-field text-xs py-2.5 pl-3"
                        placeholder="Phone"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveProfile}
                          className="flex-1 bg-primary text-white text-xs font-semibold rounded-xl py-2.5 hover:bg-primary-dark transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditMode(false); setEditForm(user); }}
                          className="flex-1 border border-slate-200 text-textMuted text-xs font-semibold rounded-xl py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-1">
                      <div className="flex min-w-0 items-center gap-3 text-textMuted text-sm py-2 px-2">
                        <Phone size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{user.mobile}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-3 text-textMuted text-sm py-2 px-2">
                        <Mail size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <hr className="border-slate-100 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-danger text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-danger/5 transition-colors"
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

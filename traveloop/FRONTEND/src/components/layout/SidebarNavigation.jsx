import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Map, Compass, Heart, Calendar, DollarSign,
  Package, BookOpen, User, Bell, Sun, Moon,
  ChevronLeft, ChevronRight, LogOut, Send, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SidebarNavigation({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', to: '/home', icon: Home },
    { label: 'My Trips', to: '/my-trips', icon: Map },
    { label: 'Explore', to: '/explore', icon: Compass },
    { label: 'Saved', to: '/saved', icon: Heart },
    { label: 'Itinerary Builder', to: '/itinerary-builder', icon: Calendar },
    { label: 'Budget Planner', to: '/budget', icon: DollarSign },
    { label: 'Packing List', to: '/packing', icon: Package },
    { label: 'Travel Journal', to: '/journal', icon: BookOpen },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  const firstLetter = user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-sm">
            <Send size={20} className="transform -rotate-12" />
          </div>
          {!collapsed && (
            <span className="font-poppins font-extrabold text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
              Traveloop
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => navigate('/create-trip')}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-secondary to-accent text-white font-poppins text-xs font-bold py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ${
            collapsed ? 'px-0' : 'px-4'
          }`}
          title="Create New Trip"
        >
          <Plus size={18} />
          {!collapsed && <span>Create Trip</span>}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom Tools & Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-500" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
              {firstLetter}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-danger p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

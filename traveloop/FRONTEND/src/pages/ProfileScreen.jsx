import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Camera, Mail, Phone, MapPin, Calendar, Globe, Plane,
  Heart, Star, Save, PenLine, Download,
} from 'lucide-react';
import Button from '../components/ui/Button';
import AppLayout from '../components/layout/AppLayout';
import { useGetDashboardSummaryQuery } from '../services/apiSlice';
import { useAuth } from '../context/AuthContext';

const initialUser = {
  firstName: '', lastName: '', email: '',
  mobile: '', location: '', dob: '',
};

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState({
    ...initialUser,
    firstName: authUser?.name?.split(' ')[0] || '',
    lastName: authUser?.name?.split(' ').slice(1).join(' ') || '',
    email: authUser?.email || '',
    mobile: authUser?.phone || authUser?.mobile || '',
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const [exporting, setExporting] = useState(false);

  const { data: dashboard } = useGetDashboardSummaryQuery();

  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';

  const saveProfile = () => { setUser(form); setEditing(false); };

  const stats = [
    { label: 'Trips Taken', value: String(dashboard?.totalTrips ?? 0), icon: Plane, color: '#4F46E5' },
    { label: 'Upcoming Trips', value: String(dashboard?.upcomingTrips ?? 0), icon: Globe, color: '#06B6D4' },
    { label: 'Saved Destinations', value: String(dashboard?.savedPlaces ?? 0), icon: Heart, color: '#7C3AED' },
    { label: 'Journal Entries', value: String(dashboard?.journalEntries ?? 0), icon: Star, color: '#F59E0B' },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/export', { credentials: 'include' });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `traveloop-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">My Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage account details &amp; preferences</p>
          </div>
        </div>
        <button onClick={() => { if (editing) saveProfile(); else { setForm(user); setEditing(true); } }}
          className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:underline">
          {editing ? <><Save size={14} /> Save Profile</> : <><PenLine size={14} /> Edit Details</>}
        </button>
      </div>

      <div className="space-y-6">
        {/* Export Data Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">Your data, yours</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Download all your trips, itineraries, budgets, journals, and saved places as JSON.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={exporting} className="shrink-0 px-5 py-2.5 text-xs font-bold">
            {exporting ? 'Preparing...' : 'Export My Data'}
          </Button>
        </motion.div>
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-secondary to-accent px-6 pt-8 pb-14" />
          
          <div className="px-6 pb-6 -mt-12 relative z-10 flex flex-col items-start">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800 relative mb-4">
              <span className="font-poppins text-3xl font-extrabold text-primary">{firstLetter}</span>
              <button aria-label="Change profile photo" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
                <Camera size={13} />
              </button>
            </div>

            {editing ? (
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field text-xs py-2.5" placeholder="First Name" />
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field text-xs py-2.5" placeholder="Last Name" />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field text-xs py-2.5 pl-10" placeholder="Email" />
                </div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="input-field text-xs py-2.5 pl-10" placeholder="Phone" />
                </div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input-field text-xs py-2.5 pl-10" placeholder="Location" />
                </div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="input-field text-xs py-2.5 pl-10" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" onClick={saveProfile} className="flex-1 py-2.5 text-xs font-bold">Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1 py-2.5 text-xs font-bold">Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</h2>
                <div className="mt-3 space-y-2">
                  <p className="min-w-0 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium"><Mail size={14} className="shrink-0 text-primary" /><span className="truncate">{user.email}</span></p>
                  <p className="min-w-0 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium"><Phone size={14} className="shrink-0 text-primary" /><span className="truncate">{user.mobile}</span></p>
                  <p className="min-w-0 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium"><MapPin size={14} className="shrink-0 text-primary" /><span className="truncate">{user.location}</span></p>
                  <p className="min-w-0 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium"><Calendar size={14} className="shrink-0 text-primary" /><span className="truncate">{user.dob}</span></p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Travel Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100 mb-3">Travel Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-soft text-center hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + '18' }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <p className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}


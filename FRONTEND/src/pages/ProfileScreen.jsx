import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Camera, Mail, Phone, MapPin, Calendar, Globe, Plane,
  Heart, Star, Save, PenLine,
} from 'lucide-react';
import Button from '../components/common/Button';
import MobileBottomNav from '../components/common/MobileBottomNav';

const initialUser = {
  firstName: 'Henish', lastName: 'Patel', email: 'henish@example.com',
  mobile: '+91 98765 43210', location: 'Ahmedabad, India', dob: '2000-05-15',
};

const stats = [
  { label: 'Trips Taken', value: '12', icon: Plane, color: '#0077B6' },
  { label: 'Countries', value: '5', icon: Globe, color: '#00B4D8' },
  { label: 'Saved Trips', value: '8', icon: Heart, color: '#ef4444' },
  { label: 'Reviews', value: '15', icon: Star, color: '#f59e0b' },
];

const favDestinations = [
  { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=80' },
  { name: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=200&q=80' },
  { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80' },
  { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=200&q=80' },
];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';

  const saveProfile = () => { setUser(form); setEditing(false); };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
            <h1 className="font-poppins text-lg font-bold text-gray-900">Profile</h1>
          </div>
          <button onClick={() => { if (editing) saveProfile(); else { setForm(user); setEditing(true); } }}
            className="min-h-11 text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
            {editing ? <><Save size={14} /> Save</> : <><PenLine size={14} /> Edit</>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-6 md:pb-8">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-light px-6 pt-8 pb-14" />
          
          <div className="px-6 pb-6 -mt-14 relative z-10 flex flex-col items-start">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white relative mb-4">
              <span className="font-poppins text-3xl font-bold text-primary">{firstLetter}</span>
              <button aria-label="Change profile photo" className="absolute -bottom-3 -right-3 tap-target rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-white">
                <Camera size={12} />
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field text-sm py-2.5 pl-4" placeholder="First Name" />
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field text-sm py-2.5 pl-4" placeholder="Last Name" />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field text-sm py-2.5" placeholder="Email" />
                </div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="input-field text-sm py-2.5" placeholder="Phone" />
                </div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input-field text-sm py-2.5" placeholder="Location" />
                </div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="input-field text-sm py-2.5" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" onClick={saveProfile} className="flex-1 py-2.5 text-xs">Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1 py-2.5 text-xs">Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-poppins text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                <div className="mt-3 space-y-2">
                  <p className="min-w-0 text-sm text-gray-500 flex items-center gap-2"><Mail size={14} className="shrink-0 text-gray-400" /><span className="truncate">{user.email}</span></p>
                  <p className="min-w-0 text-sm text-gray-500 flex items-center gap-2"><Phone size={14} className="shrink-0 text-gray-400" /><span className="truncate">{user.mobile}</span></p>
                  <p className="min-w-0 text-sm text-gray-500 flex items-center gap-2"><MapPin size={14} className="shrink-0 text-gray-400" /><span className="truncate">{user.location}</span></p>
                  <p className="min-w-0 text-sm text-gray-500 flex items-center gap-2"><Calendar size={14} className="shrink-0 text-gray-400" /><span className="truncate">{user.dob}</span></p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Travel Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3 className="font-poppins text-base font-bold text-gray-900 mb-3">Travel Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <p className="font-poppins text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favourite Destinations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-poppins text-base font-bold text-gray-900 mb-3">Favourite Destinations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {favDestinations.map((d, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden h-28 group cursor-pointer">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <span className="absolute bottom-3 left-3 text-white text-sm font-semibold">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

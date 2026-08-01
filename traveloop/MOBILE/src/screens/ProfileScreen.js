import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, ChevronRight, MapPin, Heart, CreditCard, Bell, HelpCircle, LogOut } from 'lucide-react-native';
import { getCurrentUser, getLocalTrips, getLocalWishlist } from '../services/appData';
import { tripsApi, wishlistApi } from '../services/api';

const MENU_ITEMS = [
  { id: '1', title: 'Personal Information', icon: <Settings size={22} color="#64748B" /> },
  { id: '2', title: 'Payment Methods', icon: <CreditCard size={22} color="#64748B" /> },
  { id: '3', title: 'Notifications', icon: <Bell size={22} color="#64748B" /> },
  { id: '4', title: 'Help & Support', icon: <HelpCircle size={22} color="#64748B" /> },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [tripsCount, setTripsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedUser = await getCurrentUser();
      if (mounted) setUser(storedUser);

      const [localTrips, localSaved] = await Promise.all([getLocalTrips(), getLocalWishlist()]);
      if (mounted) {
        setTripsCount(localTrips.length);
        setSavedCount(localSaved.length);
      }

      try {
        const [tripsRes, savedRes] = await Promise.all([tripsApi.getTrips(), wishlistApi.list()]);
        if (mounted) {
          const tripList = Array.isArray(tripsRes) ? tripsRes : tripsRes?.trips || tripsRes?.data || [];
          const savedList = Array.isArray(savedRes) ? savedRes : savedRes?.items || savedRes?.data || savedRes?.wishlist || [];
          if (tripList.length) setTripsCount(tripList.length);
          if (savedList.length) setSavedCount(savedList.length);
        }
      } catch {
        /* offline — keep local counts */
      }
    })();
    return () => { mounted = false; };
  }, []);

  const name = user?.name || user?.firstName || 'Traveler';
  const email = user?.email || user?.mobile || 'Sign in to sync your profile';
  const initials = name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View className="items-center px-5 py-8">
          <View className="relative mb-4">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-28 h-28 rounded-full"
                style={{ shadowColor: '#0F172A', shadowOpacity: 0.1, shadowRadius: 20 }}
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-primary/15 items-center justify-center">
                <Text className="text-4xl font-black text-primary">{initials || 'T'}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-4 border-[#F8FAFC]">
              <Settings size={14} color="#fff" />
            </View>
          </View>
          
          <Text className="text-2xl font-black text-slate-900 mb-1">{name}</Text>
          <Text className="text-slate-500 font-medium">{email}</Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between px-5 mb-8">
          <View className="flex-1 bg-white rounded-3xl p-4 mr-2 items-center shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
              <MapPin size={20} color="#0F9D8F" />
            </View>
            <Text className="text-2xl font-black text-slate-900">{tripsCount}</Text>
            <Text className="text-slate-500 text-xs font-semibold">Trips</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-4 ml-2 items-center shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mb-2">
              <Heart size={20} color="#ef4444" />
            </View>
            <Text className="text-2xl font-black text-slate-900">{savedCount}</Text>
            <Text className="text-slate-500 text-xs font-semibold">Saved</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-3xl mx-5 p-2 shadow-sm border border-slate-100 mb-6">
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              className={`flex-row items-center justify-between p-4 ${index !== MENU_ITEMS.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-slate-50 rounded-2xl items-center justify-center mr-4">
                  {item.icon}
                </View>
                <Text className="text-slate-900 font-semibold text-base">{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="mx-5 bg-red-50 p-4 rounded-2xl flex-row items-center justify-center border border-red-100">
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2 text-base">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

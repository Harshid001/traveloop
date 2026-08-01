import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CalendarDays, ChevronRight } from 'lucide-react-native';
import { getLocalTrips, normalizeTrip } from '../services/appData';
import { tripsApi } from '../services/api';

const STATUS_LABELS = [
  { status: 'active', title: 'Active' },
  { status: 'upcoming', title: 'Upcoming' },
  { status: 'completed', title: 'Completed' },
];

export default function MyTripsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const local = await getLocalTrips();
      if (mounted && local.length) setTrips(local);
      try {
        const response = await tripsApi.getTrips();
        const list = Array.isArray(response) ? response : response?.trips || response?.data || [];
        if (mounted && list.length) setTrips(list.map(normalizeTrip));
      } catch (err) {
        if (mounted && !local.length) setNotice(`No trips found. Trips you create are stored locally until you sign in.`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4 flex-row justify-between items-center mb-2">
        <Text className="text-3xl font-black text-slate-900">My Trips</Text>
        <TouchableOpacity
          className="bg-primary/10 px-4 py-2 rounded-full"
          onPress={() => navigation.navigate('CreateTrip')}
        >
          <Text className="text-primary font-bold">+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        {notice ? <Text className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}

        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#0F9D8F" />
          </View>
        ) : trips.length === 0 ? (
          <View className="py-16 items-center">
            <Text className="text-xl font-black text-slate-900 mb-2">No trips yet</Text>
            <Text className="text-base leading-6 text-slate-500 text-center">
              Create your first trip to start planning an itinerary, budget, and packing list.
            </Text>
          </View>
        ) : (
          STATUS_LABELS.map(({ status, title }) => {
            const sectionTrips = trips.filter((trip) => trip.status === status);
            if (!sectionTrips.length) return null;
            return (
              <View key={status}>
                <Text className="text-lg font-bold text-slate-900 mb-4 mt-2">{title}</Text>
                {sectionTrips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    activeOpacity={0.9}
                    className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100"
                    style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 }}
                    onPress={() => navigation.navigate('TripDetails', { trip })}
                  >
                    <View className="h-40 relative">
                      {trip.image ? (
                        <Image source={{ uri: trip.image }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-teal-50">
                          <Text className="text-5xl">🧳</Text>
                        </View>
                      )}
                      <View className="absolute inset-0 bg-black/20" />
                    </View>
                    <View className="p-5 flex-row items-center justify-between">
                      <View>
                        <Text className="text-xl font-bold text-slate-900 mb-1">{trip.title}</Text>
                        <View className="flex-row items-center">
                          <CalendarDays size={14} color="#64748B" />
                          <Text className="text-slate-500 text-sm ml-1.5">
                            {trip.startDate ? `${trip.startDate}${trip.endDate ? ` – ${trip.endDate}` : ''}` : 'Dates not set'}
                          </Text>
                        </View>
                        {(trip.destinations || []).length > 0 && (
                          <View className="mt-1 flex-row items-center">
                            <MapPin size={12} color="#64748B" />
                            <Text className="text-slate-500 text-xs ml-1.5">{trip.destinations.join(', ')}</Text>
                          </View>
                        )}
                      </View>
                      <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                        <ChevronRight size={20} color="#0F9D8F" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

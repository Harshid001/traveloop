import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CalendarDays, ChevronRight } from 'lucide-react-native';

const TRIPS = [
  {
    id: '1',
    status: 'upcoming',
    title: 'Summer in Santorini',
    date: 'Aug 12 - Aug 18, 2026',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e',
    countdown: '74 Days'
  },
  {
    id: '2',
    status: 'completed',
    title: 'Kyoto Cultural Tour',
    date: 'Apr 5 - Apr 12, 2025',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    countdown: null
  }
];

export default function MyTripsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
        
        <Text className="text-lg font-bold text-slate-900 mb-4 mt-2">Upcoming</Text>
        
        {TRIPS.filter(t => t.status === 'upcoming').map(trip => (
          <TouchableOpacity 
            key={trip.id}
            activeOpacity={0.9}
            className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100"
            style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 }}
            onPress={() => navigation.navigate('TripDetails', { trip })}
          >
            <View className="h-40 relative">
              <Image source={{ uri: trip.image }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute inset-0 bg-black/20" />
              <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Text className="text-primary font-bold text-xs">In {trip.countdown}</Text>
              </View>
            </View>
            <View className="p-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-slate-900 mb-1">{trip.title}</Text>
                <View className="flex-row items-center">
                  <CalendarDays size={14} color="#64748B" />
                  <Text className="text-slate-500 text-sm ml-1.5">{trip.date}</Text>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                <ChevronRight size={20} color="#0F9D8F" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text className="text-lg font-bold text-slate-900 mb-4 mt-4">Completed</Text>
        
        {TRIPS.filter(t => t.status === 'completed').map(trip => (
          <TouchableOpacity 
            key={trip.id}
            activeOpacity={0.9}
            className="bg-white rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border border-slate-100"
            onPress={() => navigation.navigate('TripDetails', { trip })}
          >
            <Image source={{ uri: trip.image }} className="w-20 h-20 rounded-2xl mr-4" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 mb-1">{trip.title}</Text>
              <View className="flex-row items-center">
                <CalendarDays size={12} color="#64748B" />
                <Text className="text-slate-500 text-xs ml-1.5">{trip.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

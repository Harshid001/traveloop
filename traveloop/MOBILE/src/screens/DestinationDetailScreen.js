import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDestinationDetails } from '../services/api';
import { formatCurrency } from '../services/currency';
import { Heart, MapPin, CalendarDays, ChevronLeft, Star, CloudSun } from 'lucide-react-native';

export default function DestinationDetailScreen({ navigation, route }) {
  const { id } = route.params || { id: '1' };
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [dest, setDest] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Planning state
  const [activeTab, setActiveTab] = useState('Plan'); // Plan, Activities, Info
  const [days, setDays] = useState(4); // Duration

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDestinationDetails(id);
      setDest(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !dest) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F9D8F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Image Gallery */}
        <View className="relative w-full h-[350px]">
          {dest.images?.[0] ? (
            <Image source={{ uri: dest.images[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-teal-50">
              <Text className="text-6xl">🌍</Text>
            </View>
          )}
          
          <View className="absolute inset-0 bg-black/20" />
          
          <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4" style={{ paddingTop: insets.top || 20 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md items-center justify-center"
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md items-center justify-center"
            >
              <Heart color={isFavorite ? '#ef4444' : '#fff'} fill={isFavorite ? '#ef4444' : 'transparent'} size={20} />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-6 left-5 right-5">
            <Text className="text-4xl font-black text-white mb-2" style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
              {dest.name}
            </Text>
            <View className="flex-row items-center">
              <MapPin color="#fff" size={16} />
              <Text className="text-white text-base ml-1.5 font-medium">{dest.country}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-around bg-white py-4 mx-5 -mt-8 rounded-3xl shadow-sm border border-slate-100" style={{ elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
          <View className="items-center">
            <View className="flex-row items-center mb-1">
              <Star color="#f59e0b" fill="#f59e0b" size={16} />
              <Text className="text-slate-900 font-bold ml-1">{dest.rating ?? '—'}</Text>
            </View>
              <Text className="text-slate-500 text-xs">{(dest.reviewsCount ?? 0).toLocaleString()} reviews</Text>
          </View>
          <View className="w-[1px] bg-slate-200" />
          <View className="items-center">
            <View className="flex-row items-center mb-1">
              <CloudSun color="#0F9D8F" size={16} />
              <Text className="text-slate-900 font-bold ml-1">{dest.weather?.temp != null ? `${dest.weather.temp}°C` : '—'}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{dest.weather?.condition || (dest.weather?.temp != null ? 'Live' : 'Weather N/A')}</Text>
          </View>
        </View>

        {/* Smart Planner Section */}
        <View className="px-5 mt-8">
          <Text className="text-2xl font-black text-slate-900 mb-5">Plan your trip</Text>
          
          {/* Duration Selector */}
          <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-4">
              <CalendarDays color="#0F9D8F" size={20} />
              <Text className="text-lg font-bold text-slate-900 ml-2">Duration</Text>
            </View>
            
            <View className="flex-row items-center justify-between bg-slate-50 rounded-2xl p-2">
              <TouchableOpacity 
                onPress={() => setDays(Math.max(1, days - 1))}
                className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm"
              >
                <Text className="text-xl font-bold text-slate-900">-</Text>
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-2xl font-black text-primary">{days}</Text>
                <Text className="text-slate-500 text-xs font-medium">Days / {Math.max(1, days - 1)} Nights</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setDays(days + 1)}
                className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm"
              >
                <Text className="text-xl font-bold text-slate-900">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget Estimator */}
          {dest.baseBudget ? (
            <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-slate-900 ml-2">Budget Estimate</Text>
                </View>
              </View>

              <Text className="text-3xl font-black text-primary mb-4">{formatCurrency(dest.baseBudget.total, 'USD')}</Text>

              <View className="space-y-3">
                {dest.baseBudget.flights != null && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 font-medium">Flights</Text>
                    <Text className="text-slate-900 font-bold">{formatCurrency(dest.baseBudget.flights, 'USD')}</Text>
                  </View>
                )}
                {dest.baseBudget.hotelPerNight != null && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 font-medium">Hotel (per night)</Text>
                    <Text className="text-slate-900 font-bold">{formatCurrency(dest.baseBudget.hotelPerNight, 'USD')}</Text>
                  </View>
                )}
                {dest.baseBudget.foodPerDay != null && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 font-medium">Food (per day)</Text>
                    <Text className="text-slate-900 font-bold">{formatCurrency(dest.baseBudget.foodPerDay, 'USD')}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}
          
          <Text className="text-slate-500 leading-6 text-base">{dest.description}</Text>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg px-5 py-4 border-t border-slate-100 flex-row justify-between items-center"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
      >
        <View>
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{days} days planned</Text>
          <Text className="text-xl font-black text-slate-900">Ready to build</Text>
        </View>
        <TouchableOpacity 
          className="bg-primary px-8 py-3.5 rounded-full shadow-lg"
          style={{ shadowColor: '#0F9D8F', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          onPress={() => navigation.navigate('CreateTrip', { destination: dest, days })}
        >
          <Text className="text-white font-bold text-base">Generate Itinerary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

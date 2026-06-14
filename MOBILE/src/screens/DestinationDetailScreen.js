import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDestinationDetails } from '../services/api';
import { convertCurrency, formatCurrency, getSupportedCurrencies } from '../services/currency';
import { Heart, MapPin, CalendarDays, Clock, DollarSign, ChevronDown, ChevronLeft, Star, CloudSun } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DestinationDetailScreen({ navigation, route }) {
  const { id } = route.params || { id: '1' };
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [dest, setDest] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Planning state
  const [activeTab, setActiveTab] = useState('Plan'); // Plan, Activities, Info
  const [days, setDays] = useState(4); // Duration
  const [currency, setCurrency] = useState('USD');
  const [showCurrencies, setShowCurrencies] = useState(false);

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

  // Derived budget based on duration
  const budget = useMemo(() => {
    if (!dest) return null;
    const { flights, hotelPerNight, foodPerDay } = dest.baseBudget;
    const hotelTotal = hotelPerNight * (days - 1 > 0 ? days - 1 : 1); // nights
    const foodTotal = foodPerDay * days;
    const activitiesTotal = 150 * (days / 2); // rough estimate
    
    const totalUSD = flights + hotelTotal + foodTotal + activitiesTotal;
    
    return {
      flights: convertCurrency(flights, 'USD', currency),
      hotel: convertCurrency(hotelTotal, 'USD', currency),
      food: convertCurrency(foodTotal, 'USD', currency),
      activities: convertCurrency(activitiesTotal, 'USD', currency),
      total: convertCurrency(totalUSD, 'USD', currency)
    };
  }, [dest, days, currency]);

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
          <Image source={{ uri: dest.images[0] }} className="w-full h-full" resizeMode="cover" />
          
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
              <Text className="text-slate-900 font-bold ml-1">{dest.rating}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{dest.reviewsCount.toLocaleString()} reviews</Text>
          </View>
          <View className="w-[1px] bg-slate-200" />
          <View className="items-center">
            <View className="flex-row items-center mb-1">
              <CloudSun color="#0F9D8F" size={16} />
              <Text className="text-slate-900 font-bold ml-1">{dest.weather.temp}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{dest.weather.condition}</Text>
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
          <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <DollarSign color="#0F9D8F" size={20} />
                <Text className="text-lg font-bold text-slate-900 ml-2">Budget Estimate</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCurrencies(!showCurrencies)} className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full">
                <Text className="text-slate-900 font-bold mr-1">{currency}</Text>
                <ChevronDown size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {showCurrencies && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {getSupportedCurrencies().map(c => (
                  <TouchableOpacity 
                    key={c} 
                    onPress={() => { setCurrency(c); setShowCurrencies(false); }}
                    className={`mr-2 px-3 py-1.5 rounded-full ${currency === c ? 'bg-primary' : 'bg-slate-100'}`}
                  >
                    <Text className={currency === c ? 'text-white font-bold' : 'text-slate-600'}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text className="text-3xl font-black text-primary mb-4">{formatCurrency(budget.total, currency)}</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 font-medium">Flights</Text>
                <Text className="text-slate-900 font-bold">{formatCurrency(budget.flights, currency)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 font-medium">Hotel ({Math.max(1, days-1)} nights)</Text>
                <Text className="text-slate-900 font-bold">{formatCurrency(budget.hotel, currency)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 font-medium">Food</Text>
                <Text className="text-slate-900 font-bold">{formatCurrency(budget.food, currency)}</Text>
              </View>
            </View>
          </View>
          
          <Text className="text-slate-500 leading-6 text-base">{dest.description}</Text>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg px-5 py-4 border-t border-slate-100 flex-row justify-between items-center"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
      >
        <View>
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Estimate</Text>
          <Text className="text-xl font-black text-slate-900">{formatCurrency(budget.total, currency)}</Text>
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

import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Search, MapPin, Compass } from 'lucide-react-native';
import { getTrendingDestinations, getSeasonalRecommendations } from '../services/api';
import DestinationCard from '../components/DestinationCard';

const CATEGORIES = [
  { id: '1', name: 'Luxury', icon: '✨' },
  { id: '2', name: 'Budget', icon: '💰' },
  { id: '3', name: 'Beaches', icon: '🏖️' },
  { id: '4', name: 'Mountains', icon: '⛰️' },
  { id: '5', name: 'Culture', icon: '🏛️' },
  { id: '6', name: 'Adventure', icon: '🧗' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [trending, setTrending] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [trendData, seasonData] = await Promise.all([
        getTrendingDestinations(),
        getSeasonalRecommendations()
      ]);
      setTrending(trendData);
      setSeasonal(seasonData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHeader = () => (
    <View className="flex-row justify-between items-center px-5 mb-6">
      <View className="flex-row items-center">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150' }} 
          className="w-12 h-12 rounded-full mr-3"
        />
        <View>
          <Text className="text-slate-500 text-sm font-medium">{greeting()}</Text>
          <Text className="text-slate-900 text-xl font-bold">Alex ✌️</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
          style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          onPress={() => navigation.navigate('Explore')}
        >
          <Search size={20} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-white items-center justify-center relative"
          style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        >
          <Bell size={20} color="#0F172A" />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateTripHero = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('CreateTrip')}
      className="mx-5 mb-8 rounded-3xl overflow-hidden relative"
      style={{
        height: 180,
        shadowColor: '#0F9D8F',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      }}
    >
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000' }} 
        className="w-full h-full"
      />
      <View className="absolute inset-0 bg-black/40 p-6 justify-between">
        <View className="bg-white/20 backdrop-blur-md self-start px-3 py-1.5 rounded-full flex-row items-center">
          <Compass size={14} color="#fff" />
          <Text className="text-white text-xs font-bold ml-1.5">AI Planner</Text>
        </View>
        <View>
          <Text className="text-white text-2xl font-black mb-1">Plan Your Dream Trip</Text>
          <Text className="text-white/90 text-sm">Let AI build your perfect itinerary</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <View className="mb-8">
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="items-center mr-6"
            onPress={() => navigation.navigate('Explore', { category: item.name })}
          >
            <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mb-2"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <Text className="text-2xl">{item.icon}</Text>
            </View>
            <Text className="text-slate-600 text-xs font-semibold">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
      >
        {renderHeader()}
        
        {renderCreateTripHero()}

        <View className="px-5 mb-4 flex-row justify-between items-end">
          <Text className="text-xl font-bold text-slate-900">Discover</Text>
        </View>
        
        {renderCategories()}

        <View className="px-5 mb-4 flex-row justify-between items-end">
          <Text className="text-xl font-bold text-slate-900">Trending Now</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text className="text-primary font-semibold text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="h-64 items-center justify-center">
            <ActivityIndicator size="large" color="#0F9D8F" />
          </View>
        ) : (
          <FlatList
            data={trending}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DestinationCard 
                destination={item} 
                onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
              />
            )}
          />
        )}

        <View className="px-5 mt-6 mb-4 flex-row justify-between items-end">
          <Text className="text-xl font-bold text-slate-900">Seasonal Picks</Text>
        </View>

        {loading ? null : (
          <FlatList
            data={seasonal}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DestinationCard 
                destination={item} 
                onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
              />
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

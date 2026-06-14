import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Mic, SlidersHorizontal } from 'lucide-react-native';
import DestinationCard from '../components/DestinationCard';
import SmartFilters from '../components/SmartFilters';
import { searchDestinations } from '../services/api';

export default function ExploreScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(route.params?.category || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, pass filter/category to the API
      let data = await searchDestinations(query);
      if (activeFilter) {
        data = data.filter(d => d.tags && d.tags.some(t => t.toLowerCase() === activeFilter.toLowerCase()));
      }
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, activeFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const renderSearchBar = () => (
    <View className="px-5 mb-5 mt-2">
      <View className="flex-row items-center bg-white h-14 rounded-2xl px-4 shadow-sm border border-slate-100" style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, elevation: 4 }}>
        <Search size={20} color="#64748B" />
        <TextInput
          className="flex-1 ml-3 text-base text-slate-900 h-full font-medium"
          placeholder="Where do you want to go?"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={fetchResults}
        />
        <TouchableOpacity className="mr-3">
          <Mic size={20} color="#64748B" />
        </TouchableOpacity>
        <View className="w-[1px] h-6 bg-slate-200 mx-1" />
        <TouchableOpacity className="ml-2">
          <SlidersHorizontal size={20} color="#0F9D8F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4">
        <Text className="text-3xl font-black text-slate-900">Explore</Text>
      </View>
      
      {renderSearchBar()}
      
      <SmartFilters 
        activeFilter={activeFilter} 
        onSelectFilter={setActiveFilter} 
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F9D8F" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
          numColumns={1}
          renderItem={({ item }) => (
            <DestinationCard 
              destination={item} 
              style={{ width: '100%', marginBottom: 20, marginRight: 0 }}
              onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-slate-400 text-lg">No destinations found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TripCard from '../components/TripCard';
import { categories, destinations } from '../constants/data';
import { exploreApi } from '../services/api';

const allFilters = [{ id: 'all', label: 'All', type: '' }, ...categories];

const normalizeDestination = (item) => ({
  ...item,
  id: String(item.id || item._id || item.name),
  title: item.title || `${item.name} Getaway`,
  location: item.location || [item.name, item.country].filter(Boolean).join(', '),
  price: item.price || (item.estimatedBudget ? `INR ${item.estimatedBudget}` : 'Custom plan'),
  duration: item.duration || item.bestTime || 'Flexible',
  image: item.image || destinations[0].image,
});

export default function ExploreScreen({ navigation, route }) {
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [type, setType] = useState(route.params?.initialType || '');
  const [items, setItems] = useState(destinations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const localResults = useMemo(() => {
    const text = query.trim().toLowerCase();
    return destinations.filter((item) => {
      const matchesText = !text || `${item.name} ${item.country} ${item.title}`.toLowerCase().includes(text);
      const matchesType = !type || item.type === type;
      return matchesText && matchesType;
    });
  }, [query, type]);

  const loadDestinations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await exploreApi.getDestinations({ search: query, type });
      const list = Array.isArray(response) ? response : response?.data || [];
      setItems(list.length ? list.map(normalizeDestination) : localResults);
    } catch (err) {
      setError(err.message);
      setItems(localResults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, [type]);

  return (
    <View className="flex-1 bg-bg">
      <Header title="Explore trips" subtitle="Search places, budgets, and travel styles." />
      <SearchBar value={query} onChangeText={setQuery} onSubmit={loadDestinations} />
      <View className="mt-4">
        <FlatList
          data={allFilters}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const active = item.type === type;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType(item.type)}
                className={`mr-3 rounded-full px-5 py-3 ${active ? 'bg-primary' : 'bg-white'}`}
              >
                <Text className={`text-sm font-extrabold ${active ? 'text-white' : 'text-dark'}`}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? <Text className="mx-5 mt-5 text-sm font-semibold text-slate-500">Loading fresh trips...</Text> : null}
      {error ? <Text className="mx-5 mt-3 text-xs font-semibold text-amber-600">Using demo data: {error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => navigation.navigate('TripDetails', { trip: item })} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No trips found"
            message="Try a different destination, mood, or budget."
            actionLabel="Reset search"
            onAction={() => {
              setQuery('');
              setType('');
              setItems(destinations);
            }}
          />
        }
      />
    </View>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import { destinations, myTrips } from '../constants/data';
import { tripsApi } from '../services/api';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Done' },
];

const normalizeTrip = (trip) => ({
  id: String(trip._id || trip.id),
  title: trip.title,
  status: trip.status === 'ongoing' ? 'active' : trip.status || 'upcoming',
  startDate: trip.startDate ? new Date(trip.startDate).toDateString() : 'Flexible',
  endDate: trip.endDate ? new Date(trip.endDate).toDateString() : '',
  destinations: Array.isArray(trip.destinations) ? trip.destinations : [trip.destination].filter(Boolean),
  totalBudget: trip.budget ? `INR ${trip.budget}` : 'Custom budget',
  image: trip.coverImage || destinations[0].image,
  activities: trip.tags?.length || 4,
});

export default function MyTripsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState(myTrips);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      try {
        const response = await tripsApi.getTrips();
        const list = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && list.length) {
          setItems(list.map(normalizeTrip));
        }
      } catch (err) {
        if (isMounted) {
          setNotice(`Demo trips shown: ${err.message}`);
        }
      }
    };

    loadTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleTrips = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((trip) => trip.status === activeTab);
  }, [activeTab, items]);

  return (
    <View className="flex-1 bg-bg">
      <Header title="My trips" subtitle="Track active, upcoming, and completed journeys." />
      <View className="mb-4">
        <FlatList
          data={tabs}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const active = item.id === activeTab;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab(item.id)}
                className={`mr-3 rounded-full px-5 py-3 ${active ? 'bg-primary' : 'bg-white'}`}
              >
                <Text className={`text-sm font-extrabold ${active ? 'text-white' : 'text-dark'}`}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {notice ? <Text className="mx-5 mb-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
      <FlatList
        data={visibleTrips}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate('TripDetails', {
                trip: {
                  id: item.id,
                  title: item.title,
                  location: item.destinations.join(', '),
                  image: item.image,
                  duration: `${item.startDate} - ${item.endDate || 'Open'}`,
                  price: item.totalBudget,
                  rating: '4.8',
                  description: 'A saved Traveloop itinerary with bookings, activities, and notes ready to review.',
                  activities: item.destinations,
                  facilities: ['Plan', 'Activities', 'Budget', 'Notes'],
                },
              })
            }
            className="mb-5 overflow-hidden rounded-3xl bg-white"
          >
            <Image source={{ uri: item.image }} className="h-44 w-full" resizeMode="cover" />
            <View className="p-5">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-xl font-black text-dark">{item.title}</Text>
                <Text className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase text-primary">{item.status}</Text>
              </View>
              <Text className="mt-2 text-sm font-semibold text-slate-500">{item.destinations.join(' -> ')}</Text>
              <View className="mt-4 flex-row justify-between">
                <Text className="text-sm font-bold text-slate-500">{item.startDate}</Text>
                <Text className="text-sm font-black text-dark">{item.totalBudget}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No trips here"
            message="Explore destinations and create your next Traveloop plan."
            actionLabel="Explore trips"
            onAction={() => navigation.navigate('Explore')}
          />
        }
      />
    </View>
  );
}

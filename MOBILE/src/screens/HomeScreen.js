import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FeaturedTripCard from '../components/FeaturedTripCard';
import StatsSection from '../components/StatsSection';
import MoodChips from '../components/MoodChips';
import RecommendedTripCard from '../components/RecommendedTripCard';
import { categories, destinations, featuredTrips } from '../constants/data';
import { exploreApi } from '../services/api';

const normalizeDestination = (item) => ({
  ...item,
  id: String(item.id || item._id || item.name),
  title: item.title || `${item.name} Getaway`,
  location: item.location || [item.name, item.country].filter(Boolean).join(', '),
  price: item.price || (item.estimatedBudget ? `INR ${item.estimatedBudget}` : 'Custom plan'),
  duration: item.duration || item.bestTime || 'Flexible',
  image: item.image || destinations[0].image,
});

// Bali is at index 3 in destinations array
const BALI_TRIP = destinations[3];

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [trips, setTrips] = useState(featuredTrips);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;

    const loadDestinations = async () => {
      try {
        const response = await exploreApi.getDestinations();
        const list = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && list.length) {
          setTrips(list.map(normalizeDestination));
        }
      } catch {
        if (isMounted) {
          setTrips(featuredTrips);
        }
      }
    };

    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, []);

  const openSearch = () => {
    navigation.navigate('Explore', { initialQuery: query });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <Header
        title="Find your next trip"
        subtitle="Fresh plans, saved places, and bookings in one loop."
        rightLabel="Alerts"
        onRightPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        bounces={true}
      >
        {/* Search Bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={openSearch}
          placeholder="Goa"
        />

        {/* Featured Hero Card */}
        <FeaturedTripCard
          trip={BALI_TRIP}
          onPress={() => navigation.navigate('TripDetails', { trip: BALI_TRIP })}
          onViewPlan={() => navigation.navigate('TripDetails', { trip: BALI_TRIP })}
        />

        {/* Stats Row */}
        <StatsSection />

        {/* Explore by Mood */}
        <MoodChips
          data={categories}
          onChipPress={(item) => navigation.navigate('Explore', { initialType: item.type })}
          onSeeAll={() => navigation.navigate('Explore')}
        />

        {/* Recommended Trips */}
        <View className="mx-5 mt-7">
          <Text
            className="mb-4 text-dark"
            style={{
              fontSize: 20,
              fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
              letterSpacing: -0.3,
            }}
          >
            Recommended trips
          </Text>
          {trips.slice(0, 4).map((trip) => (
            <RecommendedTripCard
              key={trip.id}
              trip={trip}
              onPress={() => navigation.navigate('TripDetails', { trip })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

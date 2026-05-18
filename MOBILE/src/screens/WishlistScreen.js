import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import TripCard from '../components/TripCard';
import { destinations, savedTrips } from '../constants/data';
import { wishlistApi } from '../services/api';

const normalizeSavedPlace = (place) => ({
  id: String(place._id || place.id || place.name),
  name: place.name,
  title: place.name,
  country: place.destination,
  location: place.location || place.destination,
  image: place.image || destinations[0].image,
  rating: place.rating || 4.7,
  price: place.estimatedCost ? `INR ${place.estimatedCost}` : 'Saved plan',
  duration: place.type || 'Destination',
  description: place.notes || 'A saved Traveloop place ready for your next itinerary.',
  activities: place.tags || ['Plan later'],
  facilities: ['Saved', 'Wishlist', 'Notes'],
});

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState(savedTrips);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      try {
        const response = await wishlistApi.getWishlist();
        const list = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && list.length) {
          setItems(list.map(normalizeSavedPlace));
        }
      } catch (err) {
        if (isMounted) {
          setNotice(`Demo wishlist shown: ${err.message}`);
        }
      }
    };

    loadWishlist();
    return () => {
      isMounted = false;
    };
  }, []);

  const removeLocal = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Wishlist" subtitle="Saved places and trip ideas for later." />
      {notice ? <Text className="mx-5 mb-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View>
            <TripCard trip={item} compact onPress={() => navigation.navigate('TripDetails', { trip: item })} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => removeLocal(item.id)}
              className="-mt-3 mb-4 self-end rounded-full bg-white px-4 py-2"
            >
              <Text className="text-xs font-bold text-slate-500">Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No saved trips"
            message="Tap save on any destination and it will show up here."
            actionLabel="Explore now"
            onAction={() => navigation.navigate('Explore')}
          />
        }
      />
    </View>
  );
}

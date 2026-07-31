import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import WeatherBadge from '../components/WeatherBadge';
import ImageGallery from '../components/ImageGallery';
import { FALLBACK_DESTINATIONS } from '../constants/data';
import { wishlistApi, imagesApi, placesApi } from '../services/api';
import { saveWishlistItem } from '../services/appData';
import { toDestinationCard } from '../services/destinationAdapter';
import { getBoolean, STORAGE_KEYS } from '../services/storage';

export default function TripDetailsScreen({ navigation, route }) {
  const trip = toDestinationCard(route.params?.trip || FALLBACK_DESTINATIONS[0]);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);

  // Enrich with live images and place details on focus
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const enrich = async () => {
        // Fetch Unsplash images for this destination
        try {
          const imgResult = await imagesApi.destination(trip.name, 6);
          const imgs = Array.isArray(imgResult) ? imgResult : imgResult?.data || [];
          if (mounted && imgs.length > 0) {
            setGallery(imgs.map((img) => ({
              url: img.url?.regular || img.url || img,
              thumbnail: img.url?.small || img.thumbnail || img.url || img,
              photographer: img.photographer?.name || img.photographer || '',
              attribution: img.attribution || '',
            })));
          }
        } catch { /* gallery stays empty, main image used */ }

        // Fetch Google place details if we have a placeId
        if (trip.placeId) {
          try {
            const details = await placesApi.details(trip.placeId);
            const data = details?.data || details;
            if (mounted && data) setPlaceDetails(data);
          } catch { /* skip enrichment */ }
        }
      };
      enrich();
      return () => { mounted = false; };
    }, [trip.name, trip.placeId]),
  );

  const saveTrip = async () => {
    setMessage('');
    setLoading(true);
    try {
      await wishlistApi.saveWishlistItem(trip.id, {
        name: trip.name,
        destination: trip.location,
        image: trip.image,
        rating: trip.rating,
        estimatedCost: trip.budgetAmount,
        type: trip.type,
      });
      await saveWishlistItem(trip);
      setSaved(true);
      setMessage('Saved to Wishlist.');
    } catch (err) {
      await saveWishlistItem(trip);
      const isGuest = await getBoolean(STORAGE_KEYS.guestMode, false);
      setSaved(true);
      setMessage(isGuest ? 'Saved locally. Sign in to sync this Wishlist.' : `Saved locally. Sync when online: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Merged activities: trip-defined + place-derived
  const activities = trip.activities || [];
  const facilities = trip.facilities || ['Hotel', 'Meals', 'Guide', 'Transfers'];

  return (
    <View className="flex-1 bg-bg">
      <Header title="Trip details" onBack={() => navigation.goBack()} rightLabel={saved ? 'Saved' : 'Save'} onRightPress={saveTrip} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 220 }}>
        {/* Image gallery or single hero image */}
        {gallery.length > 0 ? (
          <View className="mx-5 overflow-hidden rounded-3xl">
            <ImageGallery images={gallery} height={280} />
          </View>
        ) : (
          <Image source={{ uri: trip.image }} className="mx-5 h-72 rounded-3xl" resizeMode="cover" />
        )}

        <View className="px-5 pt-6">
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="text-3xl font-black text-dark">{trip.title || trip.name}</Text>
              <Text className="mt-2 text-base font-semibold text-slate-500">{trip.location}</Text>
            </View>
            <View className="items-end">
              <View className="rounded-full bg-teal-50 px-4 py-2">
                <Text className="font-black text-primary">⭐ {trip.rating}</Text>
              </View>
              {trip.reviewCount > 0 && (
                <Text className="mt-1 text-xs text-muted">{trip.reviewCount} reviews</Text>
              )}
            </View>
          </View>

          {/* Weather badge */}
          {trip.weather?.temp && (
            <View className="mt-3">
              <WeatherBadge weather={trip.weather} />
            </View>
          )}

          {/* Tags */}
          {trip.tags?.length > 0 && (
            <View className="mt-3 flex-row flex-wrap">
              {trip.tags.slice(0, 5).map((tag, i) => (
                <View key={i} className="mb-2 mr-2 rounded-full bg-primary/10 px-3 py-1">
                  <Text className="text-xs font-bold text-primary">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {message ? <Text className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-primary">{message}</Text> : null}

          <View className="mt-6 flex-row">
            <InfoBox label="Duration" value={trip.duration || 'Flexible'} />
            <View className="w-3" />
            <InfoBox label="Budget" value={trip.price || 'TBD'} />
          </View>
          <View className="mt-3 flex-row">
            <InfoBox label="Best season" value={trip.bestTime || 'Year-round'} />
            <View className="w-3" />
            <InfoBox label="Travel style" value={trip.type || 'Mixed'} />
          </View>

          {/* Place info from Google */}
          {placeDetails?.website && (
            <View className="mt-3 flex-row">
              <InfoBox label="Website" value="Visit website ↗" />
              <View className="w-3" />
              <InfoBox label="Source" value="Google Places" />
            </View>
          )}

          <Text className="mt-8 text-xl font-black text-dark">Overview</Text>
          <Text className="mt-3 text-base leading-7 text-slate-600">{trip.description || 'Discover this beautiful destination and create unforgettable memories.'}</Text>

          <Text className="mt-8 text-xl font-black text-dark">Included</Text>
          <View className="mt-3 flex-row flex-wrap">
            {facilities.map((item) => (
              <View key={item} className="mb-3 mr-3 rounded-full bg-white px-4 py-2">
                <Text className="text-sm font-bold text-dark">{item}</Text>
              </View>
            ))}
          </View>

          {activities.length > 0 && (
            <>
              <Text className="mt-5 text-xl font-black text-dark">Activities</Text>
              <View className="mt-3">
                {activities.map((item, index) => (
                  <View key={typeof item === 'string' ? item : item.name || index} className="mb-3 flex-row items-center rounded-2xl bg-white p-4">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                      <Text className="font-black text-primary">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-base font-bold text-dark">{typeof item === 'string' ? item : item.name || item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-500">Estimated budget</Text>
          <Text className="text-xl font-black text-primary">{trip.price || 'Contact us'}</Text>
        </View>
        <View className="mb-3 flex-row">
          <PrimaryButton title={saved ? 'Saved ❤️' : 'Save'} onPress={saveTrip} loading={loading} variant="light" className="mr-3 flex-1" />
          <PrimaryButton title="Itinerary" onPress={() => navigation.navigate('ItineraryBuilder', { trip })} className="flex-1" />
        </View>
        <View className="flex-row">
          <PrimaryButton title="Booking" onPress={() => navigation.navigate('Booking', { trip })} variant="light" className="mr-3 flex-1" />
          <PrimaryButton title="Ask Assistant" onPress={() => navigation.navigate('Chatbot', { trip, prompt: `Help me plan ${trip.title}` })} variant="dark" className="flex-1" />
        </View>
      </View>
    </View>
  );
}

function InfoBox({ label, value }) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">
      <Text className="text-xs font-bold uppercase text-slate-400">{label}</Text>
      <Text className="mt-2 text-base font-black capitalize text-dark">{value}</Text>
    </View>
  );
}

import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { destinations } from '../constants/data';
import { savedApi } from '../services/api';

export default function TripDetailsScreen({ navigation, route }) {
  const trip = route.params?.trip || destinations[0];
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const saveTrip = async () => {
    setMessage('');
    setSaved((value) => !value);

    try {
      await savedApi.savePlace({
        name: trip.name || trip.title,
        destination: trip.location || trip.country || trip.name,
        image: trip.image,
        rating: trip.rating || 0,
        estimatedCost: Number(String(trip.price || '').replace(/\D/g, '')) || 0,
      });
      setMessage('Saved to wishlist.');
    } catch {
      setMessage('Saved locally for now.');
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Trip details" onBack={() => navigation.goBack()} rightLabel={saved ? 'Saved' : 'Save'} onRightPress={saveTrip} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: trip.image }} className="mx-5 h-72 rounded-3xl" resizeMode="cover" />
        <View className="px-5 pt-6">
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="text-3xl font-black text-dark">{trip.title || trip.name}</Text>
              <Text className="mt-2 text-base font-semibold text-slate-500">{trip.location || `${trip.name}, ${trip.country}`}</Text>
            </View>
            <View className="rounded-full bg-teal-50 px-4 py-2">
              <Text className="font-black text-primary">{trip.rating || '4.8'}</Text>
            </View>
          </View>

          {message ? <Text className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-primary">{message}</Text> : null}

          <View className="mt-6 flex-row">
            <View className="mr-3 flex-1 rounded-2xl bg-white p-4">
              <Text className="text-xs font-bold uppercase text-slate-400">Duration</Text>
              <Text className="mt-2 text-base font-black text-dark">{trip.duration || 'Flexible'}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white p-4">
              <Text className="text-xs font-bold uppercase text-slate-400">Budget</Text>
              <Text className="mt-2 text-base font-black text-dark">{trip.price || 'Custom'}</Text>
            </View>
          </View>

          <Text className="mt-8 text-xl font-black text-dark">Overview</Text>
          <Text className="mt-3 text-base leading-7 text-slate-600">{trip.description}</Text>

          <Text className="mt-8 text-xl font-black text-dark">Included</Text>
          <View className="mt-3 flex-row flex-wrap">
            {(trip.facilities || ['Hotel', 'Meals', 'Guide']).map((item) => (
              <View key={item} className="mb-3 mr-3 rounded-full bg-white px-4 py-2">
                <Text className="text-sm font-bold text-dark">{item}</Text>
              </View>
            ))}
          </View>

          <Text className="mt-5 text-xl font-black text-dark">Highlights</Text>
          <View className="mt-3">
            {(trip.activities || []).map((item, index) => (
              <View key={item} className="mb-3 flex-row items-center rounded-2xl bg-white p-4">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                  <Text className="font-black text-primary">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-base font-bold text-dark">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-500">Starting from</Text>
          <Text className="text-xl font-black text-primary">{trip.price || 'Custom plan'}</Text>
        </View>
        <PrimaryButton title="Book this trip" onPress={() => navigation.navigate('Booking', { trip })} />
      </View>
    </View>
  );
}

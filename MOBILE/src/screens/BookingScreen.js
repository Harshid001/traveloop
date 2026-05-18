import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { destinations } from '../constants/data';
import { bookingsApi } from '../services/api';

export default function BookingScreen({ navigation, route }) {
  const trip = route.params?.trip || destinations[0];
  const [travelers, setTravelers] = useState('2');
  const [date, setDate] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleBooking = async () => {
    setStatus('');

    if (!date || !phone) {
      setStatus('Add a travel date and phone number.');
      return;
    }

    try {
      setLoading(true);
      await bookingsApi.createBooking({
        tripId: trip.id,
        tripTitle: trip.title || trip.name,
        travelers: Number(travelers) || 1,
        date,
        phone,
        note,
      });
      setStatus('Booking request created. The backend booking route can persist it next.');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Booking" subtitle={trip.title || trip.name} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">{trip.title || trip.name}</Text>
          <Text className="mt-2 text-sm font-semibold text-slate-500">{trip.location || trip.country}</Text>
          <View className="mt-5 flex-row justify-between rounded-2xl bg-teal-50 p-4">
            <Text className="font-bold text-primary">{trip.duration || 'Flexible'}</Text>
            <Text className="font-black text-primary">{trip.price || 'Custom'}</Text>
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <Text className="mb-4 text-xl font-black text-dark">Traveler details</Text>
          <Text className="mb-2 text-sm font-bold text-dark">Travel date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="Example: 25 Jun 2026"
            placeholderTextColor="#94A3B8"
            className="h-14 rounded-2xl border border-slate-200 px-4 text-base text-dark"
          />
          <Text className="mb-2 mt-4 text-sm font-bold text-dark">Travelers</Text>
          <TextInput
            value={travelers}
            onChangeText={setTravelers}
            keyboardType="number-pad"
            className="h-14 rounded-2xl border border-slate-200 px-4 text-base text-dark"
          />
          <Text className="mb-2 mt-4 text-sm font-bold text-dark">Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91 98765 43210"
            placeholderTextColor="#94A3B8"
            className="h-14 rounded-2xl border border-slate-200 px-4 text-base text-dark"
          />
          <Text className="mb-2 mt-4 text-sm font-bold text-dark">Notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Room preference, pickup city, or special request"
            placeholderTextColor="#94A3B8"
            className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-base text-dark"
            textAlignVertical="top"
          />
          {status ? <Text className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-primary">{status}</Text> : null}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        <PrimaryButton title="Request booking" onPress={handleBooking} loading={loading} />
      </View>
    </View>
  );
}

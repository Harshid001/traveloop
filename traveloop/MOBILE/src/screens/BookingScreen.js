import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { bookingsApi } from '../services/api';
import { saveLocalBooking, saveLocalTrip } from '../services/appData';
import { getBoolean, STORAGE_KEYS } from '../services/storage';
import { validateBooking } from '../services/validators';

export default function BookingScreen({ navigation, route }) {
  const trip = route.params?.trip || null;
  const [form, setForm] = useState({
    date: '',
    travelers: '2',
    phone: '',
    pickupCity: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getBoolean(STORAGE_KEYS.guestMode, false).then((isGuest) => {
      if (isGuest) setStatus('Guest mode: your enquiry is saved locally on this device until you sign in.');
    });
  }, []);

  if (!trip) {
    return (
      <View className="flex-1 bg-bg">
        <Header title="Request call-back" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-xl font-black text-dark text-center">No trip selected</Text>
          <Text className="mt-2 text-base leading-6 text-slate-500 text-center">
            Open a destination or trip from Explore to request a call-back for it.
          </Text>
          <View className="mt-6 w-full">
            <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </View>
    );
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleBooking = async () => {
    setStatus('');
    const validation = validateBooking(form);
    if (validation) {
      setStatus(validation);
      return;
    }

    const bookingPayload = {
      tripId: trip.id,
      tripTitle: trip.title || trip.name,
      travelers: Number(form.travelers) || 1,
      travelDate: form.date,
      phone: form.phone,
      pickupCity: form.pickupCity,
      note: form.note,
      price: trip.price,
    };

    try {
      setLoading(true);
      try {
        await bookingsApi.createBooking(bookingPayload);
      } catch (err) {
        setStatus(`Enquiry saved locally. Sync when online: ${err.message}`);
      }

      await saveLocalBooking(bookingPayload);
      await saveLocalTrip({
        ...trip,
        id: `booking-trip-${Date.now()}`,
        title: trip.title || trip.name,
        startDate: form.date,
        endDate: form.date,
        travelers: Number(form.travelers) || 1,
        status: 'upcoming',
        destinations: [trip.name || trip.title || trip.location].filter(Boolean),
        totalBudget: trip.price || 'Custom budget',
      });
      setSuccess(true);
      setStatus('Enquiry saved. No payment has been taken — we will contact you to confirm availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Request call-back" subtitle={trip.title || trip.name} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">{trip.title || trip.name}</Text>
          <Text className="mt-2 text-sm font-semibold text-slate-500">{trip.location || trip.country}</Text>
          <View className="mt-5 flex-row justify-between rounded-2xl bg-teal-50 p-4">
            <Text className="font-bold text-primary">{trip.duration || 'Flexible'}</Text>
            <Text className="font-black text-primary">{trip.price || 'Custom'}</Text>
          </View>
          <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-sm font-bold text-amber-700">This is an enquiry, not a booking</Text>
            <Text className="mt-1 text-xs leading-5 text-amber-700/80">
              No payment is taken and nothing is confirmed here. Your details are sent as a request — availability is confirmed only after we contact you.
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <Text className="mb-4 text-xl font-black text-dark">Your details</Text>
          <Field label="Travel date" value={form.date} onChangeText={(value) => update('date', value)} placeholder="2026-06-25" />
          <Field label="Travelers" value={form.travelers} onChangeText={(value) => update('travelers', value)} keyboardType="number-pad" />
          <Field label="Phone" value={form.phone} onChangeText={(value) => update('phone', value)} placeholder="+91 98765 43210" keyboardType="phone-pad" />
          <Field label="Pickup city" value={form.pickupCity} onChangeText={(value) => update('pickupCity', value)} placeholder="Mumbai" />
          <Text className="mb-2 mt-4 text-sm font-bold text-dark">Special notes</Text>
          <TextInput
            value={form.note}
            onChangeText={(value) => update('note', value)}
            multiline
            placeholder="Room preference, accessibility needs, or timing notes"
            placeholderTextColor="#94A3B8"
            className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-base text-dark"
            textAlignVertical="top"
          />
          {status ? <Text className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${success ? 'bg-teal-50 text-primary' : 'bg-amber-50 text-amber-600'}`}>{status}</Text> : null}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        {success ? (
          <PrimaryButton title="View My Trips" onPress={() => navigation.navigate('MainTabs', { screen: 'MyTrips' })} />
        ) : (
          <PrimaryButton title="Request call-back" onPress={handleBooking} loading={loading} loadingText="Sending request" />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-bold text-dark">{label}</Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        className="h-14 rounded-2xl border border-slate-200 px-4 text-base text-dark"
        {...props}
      />
    </View>
  );
}

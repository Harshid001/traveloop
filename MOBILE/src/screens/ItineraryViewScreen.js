import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { destinations } from '../constants/data';
import { getTripScoped } from '../services/appData';
import { STORAGE_KEYS } from '../services/storage';

const fallbackDays = [
  { id: '1', title: 'Arrival and easy walk', date: '2026-06-20', stops: ['Hotel check-in', 'Sunset viewpoint'], notes: 'Keep first day light.', cost: 2500 },
  { id: '2', title: 'Landmarks and food tour', date: '2026-06-21', stops: ['Museum', 'Market lunch', 'River cruise'], notes: 'Book morning slots.', cost: 6500 },
];

function buildShareText(trip, days) {
  const lines = [`${trip.title || trip.name || 'Traveloop itinerary'}`];
  days.forEach((day, index) => {
    lines.push(`Day ${index + 1} - ${day.date}: ${day.title}`);
    (day.stops || []).forEach((stop) => lines.push(`- ${stop}`));
    if (day.notes) lines.push(`Notes: ${day.notes}`);
  });
  return lines.join('\n');
}

export default function ItineraryViewScreen({ navigation, route }) {
  const trip = route.params?.trip || destinations[0];
  const tripId = trip.id || trip._id || 'default';
  const [days, setDays] = useState(route.params?.days || fallbackDays);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    if (route.params?.days?.length) return undefined;
    getTripScoped(STORAGE_KEYS.itineraries, tripId, null).then((stored) => {
      if (mounted && stored?.days?.length) setDays(stored.days);
    });
    return () => {
      mounted = false;
    };
  }, [route.params?.days, tripId]);

  const totals = useMemo(() => {
    const stops = days.reduce((sum, day) => sum + (day.stops?.length || 0), 0);
    const cost = days.reduce((sum, day) => sum + (Number(day.cost) || 0), 0);
    return { stops, cost };
  }, [days]);

  const shareItinerary = async () => {
    try {
      await Share.share({ message: buildShareText(trip, days), title: trip.title || trip.name || 'Traveloop itinerary' });
      setStatus('Itinerary ready to share.');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Itinerary view" subtitle="Read-only travel timeline for the road." onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View className="rounded-3xl bg-primary p-6">
          <Text className="text-3xl font-black text-white">{trip.title || trip.name || 'Traveloop itinerary'}</Text>
          <Text className="mt-2 text-teal-50">
            {days.length} days | {totals.stops} stops | INR {totals.cost.toLocaleString('en-IN')} estimated
          </Text>
          <View className="mt-5 rounded-2xl bg-white/15 p-4">
            <Text className="font-bold text-white">Route overview</Text>
            <Text className="mt-1 text-sm text-teal-50">Map route preview can be enabled for this itinerary when location services are connected.</Text>
          </View>
        </View>
        {status ? <Text className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary">{status}</Text> : null}
        {days.map((day, index) => (
          <View key={day.id} className="mt-5 flex-row">
            <View className="mr-4 items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                <Text className="font-black text-white">{index + 1}</Text>
              </View>
              <View className="w-0.5 flex-1 bg-teal-100" />
            </View>
            <View className="flex-1 rounded-3xl bg-white p-5">
              <Text className="font-bold text-primary">{day.date}</Text>
              <Text className="mt-2 text-xl font-black text-dark">{day.title}</Text>
              {(day.stops || []).map((stop, stopIndex) => (
                <Text key={`${day.id}-${stop}-${stopIndex}`} className="mt-3 text-base font-semibold text-slate-600">
                  {(day.timeSlots || [])[stopIndex] ? `${day.timeSlots[stopIndex]} | ` : ''}{stop}
                </Text>
              ))}
              {day.notes ? <Text className="mt-3 text-sm leading-6 text-slate-500">{day.notes}</Text> : null}
              <Text className="mt-3 text-xs font-black text-slate-400">Cost: INR {(Number(day.cost) || 0).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        <View className="flex-row">
          <PrimaryButton title="Edit" onPress={() => navigation.navigate('ItineraryBuilder', { trip, days })} variant="light" className="mr-3 flex-1" />
          <PrimaryButton title="Share" onPress={shareItinerary} className="flex-1" />
        </View>
      </View>
    </View>
  );
}

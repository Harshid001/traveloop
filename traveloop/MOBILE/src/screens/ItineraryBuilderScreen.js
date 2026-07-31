import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import AutocompleteDropdown from '../components/AutocompleteDropdown';
import { FALLBACK_DESTINATIONS } from '../constants/data';
import { tripsApi, placesApi } from '../services/api';
import { getTripScoped, setTripScoped } from '../services/appData';
import { STORAGE_KEYS } from '../services/storage';
import { validateItineraryDay } from '../services/validators';

const emptyDraft = { title: '', date: '', stops: '', timeSlots: '', notes: '', cost: '' };
const fallbackDays = [
  { id: '1', title: 'Arrival and easy walk', date: '2026-06-20', stops: ['Hotel check-in', 'Sunset viewpoint'], timeSlots: ['16:00', '18:00'], notes: 'Keep the first day light.', cost: 2500 },
  { id: '2', title: 'Landmarks and food tour', date: '2026-06-21', stops: ['Museum', 'Market lunch', 'River cruise'], timeSlots: ['09:30', '13:00', '17:00'], notes: 'Book morning slots.', cost: 6500 },
];

function dateKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function generateDays(trip) {
  const start = new Date(trip?.startDate || '');
  const end = new Date(trip?.endDate || trip?.startDate || '');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return fallbackDays;
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 14) {
    days.push({
      id: `day-${days.length + 1}`,
      title: `Day ${days.length + 1} plan`,
      date: dateKey(cursor),
      stops: days.length === 0 ? ['Arrival', 'Hotel check-in'] : ['Add stop'],
      timeSlots: days.length === 0 ? ['15:00'] : ['09:00'],
      notes: '',
      cost: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days.length ? days : fallbackDays;
}

export default function ItineraryBuilderScreen({ navigation, route }) {
  const trip = route.params?.trip || FALLBACK_DESTINATIONS[0];
  const tripId = trip.id || trip._id || 'default';
  const [days, setDays] = useState(route.params?.days || generateDays(trip));
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Place search for stops
  const [stopQuery, setStopQuery] = useState('');
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [showStopDropdown, setShowStopDropdown] = useState(false);

  useEffect(() => {
    let mounted = true;
    getTripScoped(STORAGE_KEYS.itineraries, tripId, null).then((stored) => {
      if (mounted && stored?.days?.length && !route.params?.days) setDays(stored.days);
    });
    return () => { mounted = false; };
  }, [route.params?.days, tripId]);

  // Debounced place search for stops
  useEffect(() => {
    if (!stopQuery || stopQuery.length < 2) {
      setStopSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Search near trip destination if we have coordinates
        const searchParams = {};
        if (trip.coordinates?.lat) {
          searchParams.lat = trip.coordinates.lat;
          searchParams.lng = trip.coordinates.lng;
        }
        const result = await placesApi.autocomplete(stopQuery, {
          types: 'establishment',
          ...searchParams,
        });
        const predictions = Array.isArray(result) ? result : result?.predictions || result?.data || [];
        setStopSuggestions(predictions.slice(0, 5).map((p) => ({
          id: p.placeId || p.place_id || p.id || String(Math.random()),
          mainText: p.mainText || p.structured_formatting?.main_text || p.name || p.description,
          secondaryText: p.secondaryText || p.structured_formatting?.secondary_text || '',
          placeId: p.placeId || p.place_id,
        })));
      } catch {
        setStopSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [stopQuery, trip.coordinates]);

  const totals = useMemo(() => {
    const stops = days.reduce((sum, day) => sum + (day.stops?.length || 0), 0);
    const cost = days.reduce((sum, day) => sum + (Number(day.cost) || 0), 0);
    return { stops, cost };
  }, [days]);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const handleSelectStop = (suggestion) => {
    const currentStops = draft.stops ? draft.stops.split(',').map((s) => s.trim()).filter(Boolean) : [];
    currentStops.push(suggestion.mainText);
    updateDraft('stops', currentStops.join(', '));
    setStopQuery('');
    setShowStopDropdown(false);
    setStopSuggestions([]);
  };

  const saveLocalAndRemote = async (nextDays = days) => {
    const payload = { tripId, tripTitle: trip.title || trip.name, days: nextDays };
    await setTripScoped(STORAGE_KEYS.itineraries, tripId, payload);
    try {
      await tripsApi.updateItinerary(tripId, payload);
      setStatus('Itinerary saved to your trip.');
    } catch (err) {
      setStatus(`Itinerary saved locally. Sync when online: ${err.message}`);
    }
  };

  const addOrUpdateDay = async () => {
    setStatus('');
    const validation = validateItineraryDay(draft);
    if (validation) {
      setStatus(validation);
      return;
    }

    const nextDay = {
      id: editingId || `day-${Date.now()}`,
      title: draft.title.trim(),
      date: draft.date,
      stops: draft.stops.split(',').map((item) => item.trim()).filter(Boolean),
      timeSlots: draft.timeSlots.split(',').map((item) => item.trim()).filter(Boolean),
      notes: draft.notes,
      cost: Number(draft.cost) || 0,
    };
    const nextDays = editingId ? days.map((day) => (day.id === editingId ? nextDay : day)) : [...days, nextDay];
    setDays(nextDays);
    setDraft(emptyDraft);
    setEditingId(null);
    await saveLocalAndRemote(nextDays);
  };

  const editDay = (day) => {
    setEditingId(day.id);
    setDraft({
      title: day.title,
      date: day.date,
      stops: (day.stops || []).join(', '),
      timeSlots: (day.timeSlots || []).join(', '),
      notes: day.notes || '',
      cost: day.cost ? String(day.cost) : '',
    });
  };

  const deleteDay = async (id) => {
    const nextDays = days.filter((day) => day.id !== id);
    setDays(nextDays);
    await saveLocalAndRemote(nextDays);
  };

  const moveDay = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= days.length) return;
    const nextDays = [...days];
    [nextDays[index], nextDays[target]] = [nextDays[target], nextDays[index]];
    setDays(nextDays);
    await saveLocalAndRemote(nextDays);
  };

  const preview = async () => {
    setLoading(true);
    await saveLocalAndRemote(days);
    setLoading(false);
    navigation.navigate('ItineraryView', { trip, days });
  };

  return (
    <View className="flex-1 bg-bg">
      <Header
        title="Itinerary builder"
        subtitle={`${days.length} days | ${totals.stops} stops | INR ${totals.cost.toLocaleString('en-IN')} estimated`}
        onBack={() => navigation.goBack()}
        rightLabel="Preview"
        onRightPress={preview}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">{editingId ? 'Edit day' : 'Add day'}</Text>
          <Input value={draft.title} onChangeText={(value) => updateDraft('title', value)} placeholder="Day title" />
          <Input value={draft.date} onChangeText={(value) => updateDraft('date', value)} placeholder="2026-06-22" />

          {/* Stops: manual entry */}
          <Input value={draft.stops} onChangeText={(value) => updateDraft('stops', value)} placeholder="Stops separated by commas" />

          {/* Live place search for stops */}
          <View style={{ zIndex: 100 }}>
            <Text className="mt-3 mb-1 text-xs font-bold text-muted">🔍 Search places to add as stops:</Text>
            <TextInput
              value={stopQuery}
              onChangeText={(text) => {
                setStopQuery(text);
                setShowStopDropdown(text.length >= 2);
              }}
              placeholder={`Search places in ${trip.name || trip.city || 'destination'}...`}
              placeholderTextColor="#94A3B8"
              className="h-12 rounded-2xl border border-dashed border-primary/40 bg-teal-50/30 px-4 text-dark"
            />
            <AutocompleteDropdown
              suggestions={stopSuggestions}
              recentSearches={[]}
              onSelect={handleSelectStop}
              onSelectRecent={() => {}}
              visible={showStopDropdown}
            />
          </View>

          <Input value={draft.timeSlots} onChangeText={(value) => updateDraft('timeSlots', value)} placeholder="Times separated by commas, e.g. 09:00, 13:30" />
          <Input value={draft.cost} onChangeText={(value) => updateDraft('cost', value)} placeholder="Estimated cost" keyboardType="number-pad" />
          <TextInput
            value={draft.notes}
            onChangeText={(value) => updateDraft('notes', value)}
            placeholder="Notes, tickets, transport, reminders"
            placeholderTextColor="#94A3B8"
            multiline
            className="mt-3 min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-dark"
            textAlignVertical="top"
          />
          <View className="mt-4 flex-row">
            {editingId ? <PrimaryButton title="Cancel" onPress={() => { setDraft(emptyDraft); setEditingId(null); }} variant="light" className="mr-3 flex-1" /> : null}
            <PrimaryButton title={editingId ? 'Update day' : 'Add day'} onPress={addOrUpdateDay} className="flex-1" />
          </View>
          {status ? <Text className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-primary">{status}</Text> : null}
        </View>

        {days.map((day, index) => (
          <View key={day.id} className="mt-5 rounded-3xl bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-black text-dark">Day {index + 1}</Text>
              <Text className="font-bold text-primary">{day.date}</Text>
            </View>
            <Text className="mt-2 text-xl font-black text-dark">{day.title}</Text>
            {(day.stops || []).map((stop, stopIndex) => (
              <Text key={`${day.id}-${stop}-${stopIndex}`} className="mt-3 rounded-2xl bg-bg px-4 py-3 font-semibold text-slate-600">
                {(day.timeSlots || [])[stopIndex] ? `${day.timeSlots[stopIndex]} | ` : ''}{stop}
              </Text>
            ))}
            {day.notes ? <Text className="mt-3 text-sm leading-6 text-slate-500">{day.notes}</Text> : null}
            <Text className="mt-3 text-sm font-black text-dark">Estimated cost: INR {(Number(day.cost) || 0).toLocaleString('en-IN')}</Text>
            <View className="mt-4 flex-row flex-wrap">
              <SmallAction label="Up" onPress={() => moveDay(index, -1)} />
              <SmallAction label="Down" onPress={() => moveDay(index, 1)} />
              <SmallAction label="Edit" onPress={() => editDay(day)} />
              <SmallAction label="Delete" danger onPress={() => deleteDay(day.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-4">
        <PrimaryButton title="Save and preview" onPress={preview} loading={loading} />
      </View>
    </View>
  );
}

function Input(props) {
  return <TextInput placeholderTextColor="#94A3B8" className="mt-3 h-14 rounded-2xl border border-slate-200 px-4 text-dark" {...props} />;
}

function SmallAction({ label, onPress, danger = false }) {
  return (
    <TouchableOpacity onPress={onPress} className="mb-2 mr-2 min-h-11 justify-center rounded-full bg-bg px-4">
      <Text className={`text-xs font-black ${danger ? 'text-red-500' : 'text-dark'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

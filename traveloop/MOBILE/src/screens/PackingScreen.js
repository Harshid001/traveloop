import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { destinations } from '../constants/data';
import { tripsApi } from '../services/api';
import { addNotification, getTripScoped, setTripScoped } from '../services/appData';
import { STORAGE_KEYS } from '../services/storage';

const categories = ['Documents', 'Clothes', 'Toiletries', 'Electronics', 'Medicine', 'Destination-specific'];

function durationDays(trip) {
  const fromText = Number(String(trip.duration || '').match(/\d+/)?.[0]);
  if (fromText) return fromText;
  const start = new Date(trip.startDate || '');
  const end = new Date(trip.endDate || trip.startDate || '');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 4;
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function generatedItems(trip) {
  const days = durationDays(trip);
  const type = String(trip.type || trip.travelStyle || trip.tripType || '').toLowerCase();
  const base = [
    ['Documents', 'Government ID'],
    ['Documents', 'Booking confirmations'],
    ['Clothes', `${days} day outfits`],
    ['Clothes', 'Comfortable shoes'],
    ['Toiletries', 'Toothbrush and skincare'],
    ['Electronics', 'Phone charger and power bank'],
    ['Medicine', 'Personal medicines'],
  ];
  if (type.includes('beach')) base.push(['Destination-specific', 'Sunscreen'], ['Destination-specific', 'Swimwear']);
  else if (type.includes('mountain') || type.includes('adventure')) base.push(['Destination-specific', 'Warm layer'], ['Destination-specific', 'Rain jacket']);
  else if (type.includes('business')) base.push(['Destination-specific', 'Formal outfit'], ['Destination-specific', 'Laptop accessories']);
  else base.push(['Destination-specific', 'Reusable water bottle']);
  return base.map(([category, text], index) => ({ id: `pack-${index + 1}`, category, text, packed: false, custom: false }));
}

export default function PackingScreen({ navigation, route }) {
  const trip = route.params?.trip || destinations[0];
  const tripId = trip.id || trip._id || 'default';
  const [items, setItems] = useState(generatedItems(trip));
  const [text, setText] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [notice, setNotice] = useState('');

  const packed = items.filter((item) => item.packed).length;
  const pct = useMemo(() => (items.length ? Math.round((packed / items.length) * 100) : 0), [items.length, packed]);

  const persist = useCallback(async (nextItems) => {
    await setTripScoped(STORAGE_KEYS.packing, tripId, { tripId, items: nextItems });
  }, [tripId]);

  useEffect(() => {
    let mounted = true;
    getTripScoped(STORAGE_KEYS.packing, tripId, null).then((stored) => {
      if (mounted && stored?.items?.length) setItems(stored.items);
    });
    tripsApi.getPacking(tripId).then((response) => {
      const list = Array.isArray(response) ? response : response?.items || response?.data || [];
      if (mounted && list.length) setItems(list);
    }).catch((err) => {
      if (mounted) setNotice(`Packing list available offline. Sync when online: ${err.message}`);
    });
    return () => {
      mounted = false;
    };
  }, [tripId]);

  useEffect(() => {
    const start = new Date(trip.startDate || '');
    if (Number.isNaN(start.getTime())) return;
    const daysUntil = Math.ceil((start - new Date()) / 86400000);
    if (daysUntil >= 0 && daysUntil <= 3 && pct < 100) {
      addNotification({
        type: 'packing reminder',
        title: 'Packing still in progress',
        message: `${trip.title || trip.name || 'Your trip'} starts soon and packing is ${pct}% complete.`,
      });
    }
  }, [pct, trip]);

  const addItem = async () => {
    if (!text.trim()) {
      setNotice('Enter an item to add.');
      return;
    }
    const nextItems = [{ id: `custom-${Date.now()}`, category, text: text.trim(), packed: false, custom: true }, ...items];
    setItems(nextItems);
    setText('');
    await persist(nextItems);
    try {
      await tripsApi.addPackingItem(tripId, nextItems[0]);
      setNotice('Packing item added.');
    } catch (err) {
      setNotice(`Item saved locally. Sync when online: ${err.message}`);
    }
  };

  const toggleItem = async (item) => {
    const nextItems = items.map((row) => (row.id === item.id ? { ...row, packed: !row.packed } : row));
    setItems(nextItems);
    await persist(nextItems);
    try {
      await tripsApi.updatePackingItem(tripId, item.id, { ...item, packed: !item.packed });
    } catch {
      setNotice('Packing progress saved locally.');
    }
  };

  const deleteItem = (item) => {
    Alert.alert('Delete packing item?', item.text, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const nextItems = items.filter((row) => row.id !== item.id);
          setItems(nextItems);
          await persist(nextItems);
          try {
            await tripsApi.deletePackingItem(tripId, item.id);
          } catch {
            setNotice('Packing item deleted locally.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Packing" subtitle={`${packed}/${items.length} packed | ${pct}% complete`} onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            <View className="rounded-3xl bg-primary p-5">
              <Text className="text-4xl font-black text-white">{pct}%</Text>
              <Text className="mt-1 text-teal-50">Checklist generated for {durationDays(trip)} days, {trip.type || trip.travelStyle || 'custom'} travel, and your selected trip context.</Text>
              <View className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                <View className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
              </View>
            </View>
            {notice ? <Text className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
            <View className="mt-5 rounded-3xl bg-white p-5">
              <Text className="text-xl font-black text-dark">Add custom item</Text>
              <TextInput value={text} onChangeText={setText} placeholder="Add item" placeholderTextColor="#94A3B8" className="mt-4 h-14 rounded-2xl border border-slate-200 px-4 text-dark" />
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                className="mt-3"
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setCategory(item)} className={`mr-2 min-h-11 justify-center rounded-full px-4 ${category === item ? 'bg-primary' : 'bg-bg'}`}>
                    <Text className={`font-bold ${category === item ? 'text-white' : 'text-dark'}`}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <PrimaryButton title="Add item" onPress={addItem} className="mt-4" />
            </View>
            <Text className="mt-6 text-xl font-black text-dark">Checklist</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.82} onPress={() => toggleItem(item)} className="mt-3 flex-row items-center rounded-3xl bg-white p-4">
            <View className={`mr-4 h-8 w-8 items-center justify-center rounded-xl ${item.packed ? 'bg-primary' : 'border border-slate-300 bg-white'}`}>
              <Text className="font-black text-white">{item.packed ? 'OK' : ''}</Text>
            </View>
            <View className="flex-1">
              <Text className={`font-black ${item.packed ? 'text-slate-400' : 'text-dark'}`}>{item.text}</Text>
              <Text className="mt-1 text-xs font-bold text-slate-400">{item.category}{item.custom ? ' | custom' : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteItem(item)} className="min-h-11 justify-center px-2">
              <Text className="font-bold text-red-500">Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState title="No packing items" message="Add essentials for this trip so nothing important is forgotten." />}
      />
    </View>
  );
}

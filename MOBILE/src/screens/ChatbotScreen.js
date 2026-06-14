import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { chatbotApi } from '../services/api';
import { getLocalTrips, getLocalWishlist, getTripScoped } from '../services/appData';
import { toDestinationCard } from '../services/destinationAdapter';
import { getJson, setJson, STORAGE_KEYS } from '../services/storage';

const historyKey = 'traveloop.chat.history';
const welcome = { id: 'welcome', role: 'assistant', text: 'Hi, I can help you decide, plan, budget, pack, book, and move between Traveloop tools.' };
const suggestions = ['Suggest a trip', 'Plan 3-day itinerary', 'Budget travel ideas', 'Packing checklist', 'Find attractions nearby', 'Weather at destination'];

function offlineReply(message, trip) {
  const body = message.toLowerCase();
  if (body.includes('packing')) {
    return {
      text: 'A packing list works best when it is tied to a trip, duration, and travel style. I can open Packing with your current trip context.',
      actions: [{ label: 'Open Packing', route: 'Packing', params: { trip } }],
    };
  }
  if (body.includes('budget')) {
    return {
      text: 'Start with the total trip budget, then track hotels, food, transport, activities, shopping, and emergency spend by category.',
      actions: [{ label: 'Open Budget', route: 'Budget', params: { trip } }],
    };
  }
  if (body.includes('itinerary') || body.includes('plan')) {
    return {
      text: 'A useful itinerary should be day-wise: date, time slots, stops, notes, and estimated costs. I can open the builder for this trip.',
      actions: [{ label: 'Create Itinerary', route: 'ItineraryBuilder', params: { trip } }],
    };
  }
  if (body.includes('hotel') || body.includes('book')) {
    return {
      text: 'For booking, choose a trip first, then submit travelers, date, phone, pickup city, and special notes.',
      actions: [{ label: 'Request Booking', route: 'Booking', params: { trip } }],
    };
  }
  return {
    text: 'Try comparing destinations in Explore, saving the best options, then creating a trip so budget, packing, and journal all stay connected.',
    actions: [{ label: 'Explore Destinations', route: 'Explore' }],
  };
}

export default function ChatbotScreen({ navigation, route }) {
  const routeTrip = route.params?.trip || null;
  const prompt = route.params?.prompt || '';
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({ trip: routeTrip, saved: [], trips: [] });
  const autoSent = useRef(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([getJson(historyKey, [welcome]), getLocalWishlist(), getLocalTrips()]).then(([history, saved, trips]) => {
      if (!mounted) return;
      setMessages(history?.length ? history : [welcome]);
      const currentTrip = routeTrip || trips.find((trip) => ['active', 'upcoming'].includes(trip.status)) || trips[0];
      setContext({ trip: currentTrip, saved, trips });
    });
    return () => {
      mounted = false;
    };
  }, [routeTrip]);

  useEffect(() => {
    if (prompt && !autoSent.current) {
      autoSent.current = true;
      setTimeout(() => send(prompt), 250);
    }
  }, [prompt]);

  useEffect(() => {
    setJson(historyKey, messages);
  }, [messages]);

  const activeTrip = context.trip || routeTrip;

  const appContext = useMemo(() => ({
    currentTrip: activeTrip,
    savedTrips: context.saved.slice(0, 5),
    trips: context.trips.slice(0, 5),
  }), [activeTrip, context.saved, context.trips]);

  const send = async (text = input) => {
    const body = String(text || '').trim();
    if (!body || loading) return;
    const userMessage = { id: `u-${Date.now()}`, role: 'user', text: body };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const budget = activeTrip?.id ? await getTripScoped(STORAGE_KEYS.budgets, activeTrip.id, null) : null;
      const itinerary = activeTrip?.id ? await getTripScoped(STORAGE_KEYS.itineraries, activeTrip.id, null) : null;
      const packing = activeTrip?.id ? await getTripScoped(STORAGE_KEYS.packing, activeTrip.id, null) : null;
      const response = await chatbotApi.sendMessage({
        message: body,
        history: next,
        context: { ...appContext, budget, itinerary, packing },
      });
      const cards = (response.cards || []).map(toDestinationCard);
      setMessages((current) => [...current, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: response.reply || 'Here is what I found.',
        cards,
        links: response.links || [],
        suggestions: response.suggestions || [],
      }]);
    } catch (err) {
      const fallback = offlineReply(body, activeTrip);
      setMessages((current) => [...current, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: `${fallback.text}\n\nOffline note: ${err.message}`,
        actions: fallback.actions,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    setMessages([welcome]);
    await setJson(historyKey, [welcome]);
  };

  const openAction = (action) => {
    if (!action.route) return;
    navigation.navigate(action.route, action.params || {});
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Traveloop Assistant" subtitle="Travel help connected to your saved trips and planning tools." onBack={() => navigation.goBack()} rightLabel="Clear" onRightPress={clearChat} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className={`mb-4 max-w-[88%] rounded-3xl px-4 py-3 ${item.role === 'user' ? 'self-end bg-primary' : 'self-start bg-white'}`}>
            <Text className={`leading-6 ${item.role === 'user' ? 'text-white' : 'text-dark'}`}>{item.text}</Text>
            {item.cards?.length ? (
              <View className="mt-3">
                {item.cards.map((card) => (
                  <TouchableOpacity key={card.id} onPress={() => navigation.navigate('TripDetails', { trip: card })} className="mt-2 rounded-2xl bg-bg p-3">
                    <Text className="font-black text-dark">{card.title || card.name}</Text>
                    <Text className="mt-1 text-xs font-bold text-slate-500">{card.location} | {card.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {item.actions?.length ? (
              <View className="mt-3 flex-row flex-wrap">
                {item.actions.map((action) => (
                  <TouchableOpacity key={action.label} onPress={() => openAction(action)} className="mb-2 mr-2 min-h-11 justify-center rounded-full bg-teal-50 px-4">
                    <Text className="text-xs font-black text-primary">{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        )}
      />
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 pb-8 pt-3">
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => send(item)} className="mr-2 min-h-11 justify-center rounded-full bg-bg px-4">
              <Text className="font-bold text-dark">{item}</Text>
            </TouchableOpacity>
          )}
        />
        <View className="mt-3 flex-row">
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            placeholder="Ask Traveloop..."
            placeholderTextColor="#94A3B8"
            className="mr-3 h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-dark"
          />
          <TouchableOpacity disabled={loading} onPress={() => send()} className="h-12 w-16 items-center justify-center rounded-2xl bg-primary">
            <Text className="font-black text-white">{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

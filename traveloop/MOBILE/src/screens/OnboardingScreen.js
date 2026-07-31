import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { setBoolean, STORAGE_KEYS } from '../services/storage';

const slides = [
  {
    title: 'Discover destinations',
    body: 'Search by mood, budget, season, and travel style before you commit to a route.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Plan complete trips',
    body: 'Turn saved ideas into actual trips with dates, travelers, itineraries, budgets, and packing.',
    image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Book, budget, pack, and track everything',
    body: 'Keep bookings, alerts, expenses, checklists, notes, and memories in one travel loop.',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const finish = async () => {
    await setBoolean(STORAGE_KEYS.onboardingComplete, true);
    navigation.replace('Login');
  };

  return (
    <View className="flex-1 bg-bg">
      <Image source={{ uri: slide.image }} className="h-3/5 w-full" resizeMode="cover" />
      <TouchableOpacity onPress={finish} className="absolute right-5 top-14 rounded-full bg-white/90 px-5 py-2">
        <Text className="text-sm font-black text-dark">Skip</Text>
      </TouchableOpacity>
      <View className="-mt-8 flex-1 rounded-t-3xl bg-bg px-6 pt-8">
        <View className="mb-6 flex-row">
          {slides.map((item, itemIndex) => (
            <View
              key={item.title}
              className={`mr-2 h-2 rounded-full ${itemIndex === index ? 'w-8 bg-primary' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </View>
        <Text className="text-3xl font-black leading-10 text-dark">{slide.title}</Text>
        <Text className="mt-4 text-base leading-7 text-slate-500">{slide.body}</Text>
        <View className="mt-auto pb-10">
          <PrimaryButton
            title={isLast ? 'Start Planning' : 'Next'}
            onPress={() => (isLast ? finish() : setIndex((value) => value + 1))}
          />
          <View className="mt-4 flex-row justify-center">
            <Text className="text-sm text-slate-500">Already know Traveloop? </Text>
            <TouchableOpacity onPress={finish}>
              <Text className="text-sm font-bold text-primary">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const slides = [
  {
    title: 'Plan trips that feel easy',
    body: 'Build city breaks, beach escapes, and mountain routes with practical details ready to go.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Explore places worth saving',
    body: 'Search destinations, compare budgets, and keep your favorite plans close.',
    image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Book with confidence',
    body: 'Move from inspiration to a clean booking flow connected to your Traveloop backend.',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View className="flex-1 bg-bg">
      <Image source={{ uri: slide.image }} className="h-3/5 w-full" resizeMode="cover" />
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
            title={isLast ? 'Start planning' : 'Next'}
            onPress={() => (isLast ? navigation.navigate('Login') : setIndex((value) => value + 1))}
          />
          <View className="mt-4 flex-row justify-center">
            <Text className="text-sm text-slate-500">New to Traveloop? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm font-bold text-primary">Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

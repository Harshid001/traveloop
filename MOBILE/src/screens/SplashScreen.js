import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 justify-center bg-primary px-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-white">
        <Text className="text-4xl font-black text-primary">T</Text>
      </View>
      <Text className="mt-8 text-5xl font-black text-white">Traveloop</Text>
      <Text className="mt-4 text-lg leading-7 text-teal-50">
        Plan smart trips, save places, and keep every journey in one calm mobile flow.
      </Text>
    </View>
  );
}

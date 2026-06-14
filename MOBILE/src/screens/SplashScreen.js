import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { hydrateAuthToken } from '../services/api';
import { getBoolean, STORAGE_KEYS } from '../services/storage';

export default function SplashScreen({ navigation }) {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        const [token, completed] = await Promise.all([
          hydrateAuthToken(),
          getBoolean(STORAGE_KEYS.onboardingComplete, false),
        ]);
        if (!mounted) return;
        if (token) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace(completed ? 'Login' : 'Onboarding');
        }
      } catch (err) {
        console.error('Splash Screen Error:', err);
        if (mounted) setErrorMsg(err.message || 'Unknown error');
      }
    }, 900);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
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
      {errorMsg ? (
        <Text className="mt-4 text-sm font-bold text-red-500 bg-white p-2 rounded">
          Error: {errorMsg}
        </Text>
      ) : null}
    </View>
  );
}

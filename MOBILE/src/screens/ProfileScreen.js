import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { profile } from '../constants/data';
import { authApi, setAuthToken } from '../services/api';

const rows = [
  ['Saved places', 'Wishlist'],
  ['Notifications', 'Notifications'],
  ['Upcoming trips', 'MyTrips'],
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(profile);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await authApi.getProfile();
        if (isMounted && response) {
          setUser({
            name: response.name || profile.name,
            email: response.email || profile.email,
            location: response.location || profile.location,
            travelStyle: response.travelStyle || profile.travelStyle,
          });
        }
      } catch (err) {
        if (isMounted) {
          setNotice(`Guest profile shown: ${err.message}`);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const logout = () => {
    setAuthToken(null);
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Profile" subtitle="Your travel preferences and account." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="rounded-3xl bg-white p-6">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary">
            <Text className="text-3xl font-black text-white">{user.name?.charAt(0) || 'T'}</Text>
          </View>
          <Text className="mt-5 text-2xl font-black text-dark">{user.name}</Text>
          <Text className="mt-1 text-sm font-semibold text-slate-500">{user.email}</Text>
          {notice ? <Text className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
          <View className="mt-6 flex-row">
            <View className="mr-3 flex-1 rounded-2xl bg-bg p-4">
              <Text className="text-xs font-bold uppercase text-slate-400">Location</Text>
              <Text className="mt-2 text-base font-black text-dark">{user.location || 'India'}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-bg p-4">
              <Text className="text-xs font-bold uppercase text-slate-400">Style</Text>
              <Text className="mt-2 text-base font-black text-dark">{user.travelStyle || 'Explorer'}</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-2">
          {rows.map(([label, routeName]) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(routeName)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-5"
            >
              <Text className="text-base font-bold text-dark">{label}</Text>
              <Text className="text-lg font-bold text-slate-400">{'>'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">Backend connection</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Login, register, profile, trips, explore, and saved places point at your Express API through EXPO_PUBLIC_API_URL.
          </Text>
        </View>

        <PrimaryButton title="Logout" onPress={logout} variant="dark" className="mt-6" />
      </ScrollView>
    </View>
  );
}

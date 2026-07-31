import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { authApi, hydrateAuthToken, persistAuthToken } from '../services/api';
import { biometricAuth } from '../services/tokenStorage';
import { getJson, setBoolean, setJson, STORAGE_KEYS } from '../services/storage';
import { validateLogin } from '../services/validators';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    let mounted = true;
    getJson('traveloop.remember.email', '').then((storedEmail) => {
      if (mounted && storedEmail) setEmail(storedEmail);
    });
    biometricAuth.isAvailable().then((available) => mounted && setBiometricAvailable(available));
    return () => {
      mounted = false;
    };
  }, []);

  const enterApp = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleLogin = async () => {
    const validation = validateLogin({ email, password });
    setError(validation);
    if (validation) return;

    try {
      setLoading(true);
      const user = await authApi.login({ email, password });
      await persistAuthToken(user.token);
      await setBoolean(STORAGE_KEYS.guestMode, false);
      await setJson(STORAGE_KEYS.user, {
        name: user.name || email.split('@')[0],
        email: user.email || email,
        location: user.location || 'India',
        travelStyle: user.travelStyle || 'Balanced explorer',
        currency: user.preferredCurrency || 'INR',
      });
      await setJson('traveloop.remember.email', remember ? email : '');
      enterApp();
    } catch (err) {
      setError(`Could not sign in: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await persistAuthToken(null);
    await setBoolean(STORAGE_KEYS.guestMode, true);
    await setJson(STORAGE_KEYS.user, {
      name: 'Traveler',
      email: 'guest@traveloop.app',
      location: 'Local device',
      travelStyle: 'Guest explorer',
      currency: 'INR',
    });
    enterApp();
  };

  const handleBiometric = async () => {
    const result = await biometricAuth.authenticate();
    if (!result.success) {
      setError(result.reason || 'Biometric login was cancelled.');
      return;
    }
    const token = await hydrateAuthToken();
    if (token) enterApp();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg px-6 pt-16">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-white">
        <Text className="text-lg font-bold text-dark">{'<'}</Text>
      </TouchableOpacity>
      <Text className="text-4xl font-black text-dark">Welcome back</Text>
      <Text className="mt-3 text-base leading-7 text-slate-500">Sign in to sync trips, bookings, budgets, journals, and saved places across devices.</Text>

      <View className="mt-10">
        <Text className="mb-2 text-sm font-bold text-dark">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94A3B8"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark"
        />
        <Text className="mb-2 mt-5 text-sm font-bold text-dark">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="Minimum 6 characters"
          placeholderTextColor="#94A3B8"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark"
        />
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => setRemember((value) => !value)} className="min-h-11 flex-row items-center">
            <View className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${remember ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}>
              <Text className="text-xs font-black text-white">{remember ? 'OK' : ''}</Text>
            </View>
            <Text className="font-bold text-dark">Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPassword((value) => !value)} className="min-h-11 justify-center rounded-full bg-white px-4">
            <Text className="text-sm font-bold text-primary">{showPassword ? 'Hide password' : 'Show password'}</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</Text> : null}
      </View>

      <View className="mt-auto pb-10">
        <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
        {biometricAvailable ? (
          <PrimaryButton title="Login with biometrics" onPress={handleBiometric} variant="light" className="mt-3" />
        ) : null}
        <PrimaryButton title="Continue as guest" onPress={handleGuest} variant="light" className="mt-3" />
        <Text className="mt-3 text-center text-xs leading-5 text-slate-500">Guest mode works offline but sync is limited until you sign in.</Text>
        <View className="mt-5 flex-row justify-center">
          <Text className="text-sm text-slate-500">No account yet? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-sm font-bold text-primary">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { authApi, persistAuthToken } from '../services/api';
import { setBoolean, setJson, STORAGE_KEYS } from '../services/storage';
import { validateRegister } from '../services/validators';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const validation = validateRegister({ name, email, password });
    setError(validation);
    if (validation) return;

    try {
      setLoading(true);
      const user = await authApi.register({ name, email, password });
      await persistAuthToken(user.token);
      await setBoolean(STORAGE_KEYS.guestMode, false);
      await setJson(STORAGE_KEYS.user, {
        name: user.name || name,
        email: user.email || email,
        location: 'India',
        travelStyle: 'Balanced explorer',
        currency: 'INR',
      });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err) {
      setError(`Could not create account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg px-6 pt-16">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-white">
        <Text className="text-lg font-bold text-dark">{'<'}</Text>
      </TouchableOpacity>
      <Text className="text-4xl font-black text-dark">Create account</Text>
      <Text className="mt-3 text-base leading-7 text-slate-500">Create a synced Traveloop account for trips, bookings, budgets, journals, and saved destinations.</Text>

      <View className="mt-8">
        <Text className="mb-2 text-sm font-bold text-dark">Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#94A3B8" className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark" />
        <Text className="mb-2 mt-4 text-sm font-bold text-dark">Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#94A3B8" className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark" />
        <Text className="mb-2 mt-4 text-sm font-bold text-dark">Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Minimum 6 characters" placeholderTextColor="#94A3B8" className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark" />
        <TouchableOpacity onPress={() => setShowPassword((value) => !value)} className="mt-3 min-h-11 self-start justify-center rounded-full bg-white px-4">
          <Text className="text-sm font-bold text-primary">{showPassword ? 'Hide password' : 'Show password'}</Text>
        </TouchableOpacity>
        {error ? <Text className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</Text> : null}
      </View>

      <View className="mt-auto pb-10">
        <PrimaryButton title="Register" onPress={handleRegister} loading={loading} />
        <View className="mt-5 flex-row justify-center">
          <Text className="text-sm text-slate-500">Already registered? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-sm font-bold text-primary">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

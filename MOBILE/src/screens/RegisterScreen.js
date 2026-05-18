import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { authApi, setAuthToken } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!name || !email || password.length < 6) {
      setError('Add your name, email, and a password with 6 or more characters.');
      return;
    }

    try {
      setLoading(true);
      const user = await authApi.register({ name, email, password });
      setAuthToken(user.token);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-white">
        <Text className="text-lg font-bold text-dark">{'<'}</Text>
      </TouchableOpacity>
      <Text className="text-4xl font-black text-dark">Create account</Text>
      <Text className="mt-3 text-base leading-7 text-slate-500">Save plans, bookings, and wishlists across devices.</Text>

      <View className="mt-8">
        <Text className="mb-2 text-sm font-bold text-dark">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#94A3B8"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark"
        />
        <Text className="mb-2 mt-4 text-sm font-bold text-dark">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94A3B8"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark"
        />
        <Text className="mb-2 mt-4 text-sm font-bold text-dark">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Minimum 6 characters"
          placeholderTextColor="#94A3B8"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-dark"
        />
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
    </View>
  );
}

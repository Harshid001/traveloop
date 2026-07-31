import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function TripCard({ trip, onPress, compact = false }) {
  const title = trip.title || trip.name;
  const location = trip.location || [trip.name, trip.country].filter(Boolean).join(', ');
  const price = trip.price || (trip.estimatedBudget ? `INR ${trip.estimatedBudget}` : 'Custom plan');

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className={`overflow-hidden rounded-3xl border border-slate-100 bg-white ${compact ? 'mb-4 flex-row' : 'mb-5'}`}
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: trip.image }}
        className={compact ? 'h-32 w-32' : 'h-52 w-full'}
        resizeMode="cover"
      />
      <View className="flex-1 p-4">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-lg font-extrabold text-dark">{title}</Text>
            <Text className="mt-1 text-sm text-slate-500">{location}</Text>
          </View>
          <View className="rounded-full bg-teal-50 px-3 py-1">
            <Text className="text-xs font-bold text-primary">{trip.rating || '4.8'}</Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-500">{trip.duration || trip.bestTime || 'Flexible'}</Text>
          <Text className="text-base font-extrabold text-primary">{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

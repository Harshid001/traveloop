import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function RecommendedTripCard({ trip, onPress }) {
  const title = trip.title || trip.name;
  const location = trip.location || [trip.name, trip.country].filter(Boolean).join(', ');
  const price = trip.price || (trip.estimatedBudget ? `INR ${trip.estimatedBudget}` : 'Custom plan');
  const duration = trip.duration || trip.bestTime || 'Flexible';
  const rating = trip.rating || '4.8';

  // Extract short info for subtitle line
  const typeLabel = trip.type ? trip.type.charAt(0).toUpperCase() + trip.type.slice(1) : '';
  const daysOnly = duration.includes('Days') ? duration.split('/')[0].trim() : duration;
  const subtitleParts = [daysOnly, typeLabel, price].filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="mb-5 overflow-hidden rounded-3xl bg-white"
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
        className="w-full"
        style={{ height: 180 }}
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text
              className="text-dark"
              style={{
                fontSize: 18,
                fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
                letterSpacing: 0,
              }}
            >
              {title}
            </Text>
            <Text
              className="mt-1.5"
              style={{ fontSize: 13, fontWeight: '500', color: '#64748B', lineHeight: 18 }}
            >
              {subtitleParts.join(' • ')}
            </Text>
          </View>
          {/* Rating badge */}
          <View
            className="rounded-full"
            style={{
              backgroundColor: '#F0FDFA',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F9D8F' }}>
              ★ {rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

import { ImageBackground, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function FeaturedTripCard({ trip, onPress, onViewPlan }) {
  const title = trip.title || trip.name;

  return (
    <View
      className="mx-5 mt-5 overflow-hidden rounded-3xl"
      style={{
        height: 230,
        shadowColor: '#0F172A',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      }}
    >
      <ImageBackground
        source={{ uri: trip.image }}
        className="h-full w-full"
        resizeMode="cover"
        imageStyle={{ borderRadius: 24 }}
      >
        {/* Dark overlay for text readability */}
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderRadius: 24,
          }}
        />
        <View className="flex-1 justify-end p-6">
          <Text
            className="text-white"
            style={{
              fontSize: 28,
              fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
              lineHeight: 34,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          <Text
            className="mt-2"
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 19,
            }}
          >
            {trip.description || '5 days with villas, rice terraces, beaches, and private transfers.'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onViewPlan || onPress}
            className="mt-4 items-center justify-center self-start rounded-full bg-white"
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F9D8F' }}>View plan</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

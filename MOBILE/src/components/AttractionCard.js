import { Image, Text, TouchableOpacity, View } from 'react-native';

/**
 * Card for displaying a nearby attraction.
 * @param {{
 *   attraction: { name: string, type: string, rating: number, distance: string, photo: string, address: string },
 *   onPress: function
 * }} props
 */
export default function AttractionCard({ attraction, onPress }) {
  const { name, type, rating, distance, photo } = attraction || {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-5 mb-3 flex-row overflow-hidden rounded-2xl bg-white"
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {/* Image */}
      {photo ? (
        <Image
          source={{ uri: photo }}
          className="rounded-xl"
          style={{ width: 96, height: 96 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="items-center justify-center rounded-xl bg-slate-100"
          style={{ width: 96, height: 96 }}
        >
          <Text style={{ fontSize: 28 }}>📍</Text>
        </View>
      )}

      {/* Content */}
      <View className="flex-1 p-3" style={{ justifyContent: 'space-between' }}>
        <View>
          <Text className="text-sm font-bold text-dark" numberOfLines={1}>
            {name}
          </Text>
          {type ? (
            <View className="mt-1 self-start rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text className="text-xs font-bold text-primary" style={{ textTransform: 'capitalize' }}>
                {type}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-auto flex-row items-center" style={{ gap: 12 }}>
          {rating != null ? (
            <Text className="text-xs font-bold">⭐ {rating}</Text>
          ) : null}
          {distance ? (
            <Text className="text-xs text-muted">📏 {distance}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

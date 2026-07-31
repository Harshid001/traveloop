import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function MoodChips({ data, onChipPress, onSeeAll }) {
  return (
    <View className="mt-7">
      <View className="mb-4 flex-row items-center justify-between px-5">
        <Text
          className="text-dark"
          style={{
            fontSize: 20,
            fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
            letterSpacing: 0,
          }}
        >
          Explore by mood
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F9D8F' }}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChipPress?.(item)}
            className="mr-3 rounded-2xl border bg-white"
            style={{
              borderColor: '#D1FAE5',
              paddingHorizontal: 22,
              paddingVertical: 14,
              shadowColor: '#0F172A',
              shadowOpacity: 0.03,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <Text
              className="text-dark"
              style={{ fontSize: 14, fontWeight: '700' }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DestinationCard from '../components/DestinationCard';
import { getTrendingDestinations } from '../services/api';
import { useEffect, useState } from 'react';

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    getTrendingDestinations().then(data => setSaved(data.slice(0, 2)));
  }, []);

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4">
        <Text className="text-3xl font-black text-slate-900">Wishlist</Text>
        <Text className="text-slate-500 mt-1">Places you want to visit.</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <DestinationCard 
            destination={item} 
            isFavorite={true}
            style={{ width: '100%', marginBottom: 20 }}
            onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

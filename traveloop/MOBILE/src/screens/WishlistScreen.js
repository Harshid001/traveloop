import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DestinationCard from '../components/DestinationCard';
import { wishlistApi } from '../services/api';
import { getLocalWishlist, removeWishlistItem } from '../services/appData';
import { useEffect, useState } from 'react';

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const local = await getLocalWishlist();
      if (mounted && local.length) setSaved(local);
      try {
        const response = await wishlistApi.list();
        const list = Array.isArray(response) ? response : response?.items || response?.data || response?.wishlist || [];
        if (mounted && list.length) setSaved(list);
      } catch (err) {
        if (mounted && !local.length) setNotice('Your saved places are stored locally until you sign in.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const unfavorite = async (item) => {
    setSaved((current) => current.filter((row) => String(row.id) !== String(item.id)));
    await removeWishlistItem(item.id);
    try {
      await wishlistApi.saveWishlistItem(item.id, {}).catch(() => {});
    } catch {
      setNotice('Removed from saved places locally.');
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4">
        <Text className="text-3xl font-black text-slate-900">Wishlist</Text>
        <Text className="text-slate-500 mt-1">Places you want to visit.</Text>
        {notice ? <Text className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
      </View>

      {loading ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#0F9D8F" />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item, index) => String(item.id || index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className="text-xl font-black text-slate-900 mb-2">No saved places yet</Text>
              <Text className="text-base leading-6 text-slate-500 text-center">
                Tap the heart on destinations in Explore to save them here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              isFavorite={true}
              onFavorite={() => unfavorite(item)}
              style={{ width: '100%', marginBottom: 20 }}
              onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

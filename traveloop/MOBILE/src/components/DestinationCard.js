import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Heart, MapPin, Star, CloudSun } from 'lucide-react-native';

export default function DestinationCard({ destination, onPress, onFavorite, isFavorite, style }) {
  if (!destination) return null;
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-3xl overflow-hidden mb-4 mr-4"
      style={[{
        width: 260,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
      }, style]}
    >
      <View className="h-48 relative">
        <Image
          source={{ uri: destination.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={onFavorite}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md items-center justify-center"
        >
          <Heart size={20} color={isFavorite ? '#ef4444' : '#ffffff'} fill={isFavorite ? '#ef4444' : 'transparent'} />
        </TouchableOpacity>

        {/* Quick Tags (Weather & Rating) */}
        <View className="absolute bottom-4 left-4 right-4 flex-row justify-between">
          <View className="flex-row items-center bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
            <CloudSun size={14} color="#fff" />
            <Text className="text-white text-xs font-semibold ml-1.5">{destination.weather || '24°C'}</Text>
          </View>
          <View className="flex-row items-center bg-white/90 px-3 py-1.5 rounded-full">
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-slate-900 text-xs font-bold ml-1">{destination.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900 mb-1" numberOfLines={1}>{destination.name}</Text>
            <View className="flex-row items-center">
              <MapPin size={14} color="#64748B" />
              <Text className="text-slate-500 text-sm ml-1" numberOfLines={1}>{destination.country}</Text>
            </View>
          </View>
        </View>
        
        <View className="h-[1px] bg-slate-100 my-3" />
        
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-xs">Est. Budget</Text>
            <Text className="text-primary font-bold text-base">${destination.estimatedBudget}</Text>
          </View>
          {destination.tags && destination.tags.length > 0 && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-semibold">{destination.tags[0]}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

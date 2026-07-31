import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Horizontal swipeable image gallery with page indicator dots.
 * @param {{
 *   images: Array<{url: string, thumbnail?: string, photographer?: string, attribution?: string}>,
 *   height?: number
 * }} props
 */
export default function ImageGallery({ images = [], height = 280 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  if (!images || images.length === 0) {
    return (
      <View
        className="items-center justify-center bg-slate-200"
        style={{ width: SCREEN_WIDTH, height }}
      >
        <Text style={{ fontSize: 40 }}>🏞️</Text>
        <Text className="mt-2 text-sm text-muted">No images available</Text>
      </View>
    );
  }

  const currentImage = images[activeIndex];

  return (
    <View style={{ height }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `gallery-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode="cover"
          />
        )}
      />

      {/* Photographer attribution */}
      {currentImage?.photographer ? (
        <View className="absolute bottom-3 left-4">
          <Text
            className="text-xs font-semibold text-white"
            style={{ textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } }}
          >
            📷 {currentImage.photographer}
          </Text>
        </View>
      ) : null}

      {/* Page dots */}
      {images.length > 1 ? (
        <View className="absolute bottom-3 flex-row items-center justify-center" style={{ left: 0, right: 0 }}>
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              className={`mx-1 rounded-full ${
                index === activeIndex
                  ? 'h-2.5 w-2.5 bg-white'
                  : 'h-2 w-2 bg-white/40'
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

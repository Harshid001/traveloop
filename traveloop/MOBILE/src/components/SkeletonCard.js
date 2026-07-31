import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

/**
 * Animated shimmer placeholder card for loading states.
 * @param {{ variant: 'featured' | 'card' | 'compact' }} props
 */
export default function SkeletonCard({ variant = 'card' }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  if (variant === 'featured') {
    return (
      <View className="mx-5 mt-5 overflow-hidden rounded-3xl bg-white" style={{ height: 220 }}>
        {/* Image placeholder */}
        <Animated.View
          className="rounded-2xl bg-slate-200"
          style={[{ height: 140, marginHorizontal: 0 }, animatedStyle]}
        />
        {/* Text line placeholders */}
        <View className="p-4">
          <Animated.View
            className="rounded-xl bg-slate-200"
            style={[{ height: 16, width: '70%', marginBottom: 10 }, animatedStyle]}
          />
          <Animated.View
            className="rounded-xl bg-slate-200"
            style={[{ height: 12, width: '45%' }, animatedStyle]}
          />
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View className="mx-5 mt-3 overflow-hidden rounded-2xl bg-white" style={{ height: 80 }}>
        <Animated.View
          className="rounded-2xl bg-slate-200"
          style={[{ flex: 1, margin: 12 }, animatedStyle]}
        />
      </View>
    );
  }

  // Default: 'card' variant
  return (
    <View
      className="mx-5 mt-3 flex-row overflow-hidden rounded-2xl bg-white"
      style={{ height: 160, padding: 12 }}
    >
      {/* Image placeholder */}
      <Animated.View
        className="rounded-xl bg-slate-200"
        style={[{ width: 120, height: '100%' }, animatedStyle]}
      />
      {/* Text placeholders */}
      <View className="ml-3 flex-1 justify-center">
        <Animated.View
          className="rounded-xl bg-slate-200"
          style={[{ height: 14, width: '80%', marginBottom: 10 }, animatedStyle]}
        />
        <Animated.View
          className="rounded-xl bg-slate-200"
          style={[{ height: 12, width: '55%', marginBottom: 10 }, animatedStyle]}
        />
        <Animated.View
          className="rounded-xl bg-slate-200"
          style={[{ height: 12, width: '35%' }, animatedStyle]}
        />
      </View>
    </View>
  );
}

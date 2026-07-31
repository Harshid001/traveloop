import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Reusable section title with optional "See All" link.
 * @param {{ title: string, subtitle?: string, onSeeAll?: function, seeAllLabel?: string }} props
 */
export default function SectionHeader({ title, subtitle, onSeeAll, seeAllLabel = 'See All →' }) {
  return (
    <View className="mx-5 mt-7 mb-3 flex-row items-center justify-between">
      <View className="flex-1">
        <Text
          className="text-dark"
          style={{ fontSize: 20, fontWeight: 'bold' }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text className="text-sm font-bold text-primary">{seeAllLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

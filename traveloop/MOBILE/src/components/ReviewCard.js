import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Card for displaying a user review.
 * @param {{
 *   review: { author: string, rating: number, text: string, date: string, source?: string }
 * }} props
 */
export default function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const { author = 'Anonymous', rating = 0, text = '', date, source } = review || {};

  const initial = author.charAt(0).toUpperCase();
  const isLong = text.length > 150;
  const stars = '⭐'.repeat(Math.min(Math.max(Math.round(rating), 0), 5));

  return (
    <View
      className="mx-5 mb-3 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* Avatar */}
          <View
            className="items-center justify-center rounded-full bg-primary/10"
            style={{ width: 32, height: 32 }}
          >
            <Text className="text-xs font-bold text-primary">{initial}</Text>
          </View>
          <Text className="ml-2.5 text-sm font-bold text-dark">{author}</Text>
        </View>
        {/* Star rating */}
        <Text style={{ fontSize: 12 }}>{stars}</Text>
      </View>

      {/* Review text */}
      <Text
        className="mt-2.5 text-xs text-muted"
        numberOfLines={expanded ? undefined : 3}
      >
        {text}
      </Text>

      {/* Read more / less */}
      {isLong ? (
        <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded(!expanded)}>
          <Text className="mt-1 text-xs font-bold text-primary">
            {expanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Footer */}
      <View className="mt-2 flex-row items-center justify-between">
        {date ? (
          <Text className="text-xs text-slate-400">{date}</Text>
        ) : <View />}
        {source ? (
          <View className="rounded-full bg-slate-100 px-2 py-0.5">
            <Text className="text-xs font-semibold text-muted">{source}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

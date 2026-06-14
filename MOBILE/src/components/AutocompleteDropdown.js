import { FlatList, Text, TouchableOpacity, View } from 'react-native';

/**
 * Dropdown overlay for place search autocomplete suggestions.
 * @param {{
 *   suggestions: Array<{id: string, mainText: string, secondaryText: string}>,
 *   recentSearches: string[],
 *   onSelect: function,
 *   onSelectRecent: function,
 *   visible: boolean
 * }} props
 */
export default function AutocompleteDropdown({
  suggestions = [],
  recentSearches = [],
  onSelect,
  onSelectRecent,
  visible,
}) {
  if (!visible) return null;

  const hasSuggestions = suggestions.length > 0;
  const hasRecent = recentSearches.length > 0;

  if (!hasSuggestions && !hasRecent) return null;

  return (
    <View
      className="overflow-hidden rounded-2xl bg-white"
      style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 1000,
        shadowColor: '#0F172A',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }}
    >
      {hasSuggestions ? (
        <FlatList
          data={suggestions.slice(0, 5)}
          keyExtractor={(item, index) => item.id || `suggestion-${index}`}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSelect?.(item)}
              className="flex-row items-center px-4 py-3"
              style={index < Math.min(suggestions.length, 5) - 1 ? { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' } : undefined}
            >
              <Text style={{ fontSize: 16, marginRight: 10 }}>📍</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-dark" numberOfLines={1}>
                  {item.mainText}
                </Text>
                {item.secondaryText ? (
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : hasRecent ? (
        <View>
          <Text
            className="text-xs font-bold text-muted"
            style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}
          >
            Recent searches
          </Text>
          {recentSearches.slice(0, 5).map((text, index) => (
            <TouchableOpacity
              key={`recent-${index}`}
              activeOpacity={0.7}
              onPress={() => onSelectRecent?.(text)}
              className="flex-row items-center px-4 py-2.5"
              style={index < Math.min(recentSearches.length, 5) - 1 ? { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' } : undefined}
            >
              <Text style={{ fontSize: 14, marginRight: 10 }}>🕐</Text>
              <Text className="text-sm text-dark">{text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

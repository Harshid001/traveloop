import { FlatList, Text, TouchableOpacity } from 'react-native';

/**
 * Horizontal scrollable filter chip bar with multi-select support.
 * @param {{
 *   filters: Array<{id: string, label: string, emoji?: string}>,
 *   activeFilters: string[],
 *   onToggle: function(filterId: string)
 * }} props
 */
export default function FilterBar({ filters = [], activeFilters = [], onToggle }) {
  const renderChip = ({ item }) => {
    const isActive = activeFilters.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onToggle?.(item.id)}
        className={`rounded-full px-4 py-2.5 ${
          isActive
            ? 'bg-primary'
            : 'border border-slate-200 bg-white'
        }`}
      >
        <Text
          className={`text-sm font-extrabold ${
            isActive ? 'text-white' : 'text-dark'
          }`}
        >
          {item.emoji ? `${item.emoji} ` : ''}{item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={filters}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      renderItem={renderChip}
    />
  );
}

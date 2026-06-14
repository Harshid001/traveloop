import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

const FILTERS = [
  'All', 'Budget', 'Luxury', 'Family', 'Couples', 
  'Adventure', 'Relaxation', 'Food', 'Visa Free', 
  'Weekend', 'Nature', 'Historical'
];

export default function SmartFilters({ activeFilter, onSelectFilter }) {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter || (!activeFilter && filter === 'All');
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => onSelectFilter(filter === 'All' ? '' : filter)}
              className={`mr-3 px-5 py-2.5 rounded-full border ${
                isActive 
                  ? 'bg-primary border-primary' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text 
                className={`text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

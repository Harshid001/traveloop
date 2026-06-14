import { Platform, Text, View } from 'react-native';

const STATS = [
  { value: '12', label: 'Cities' },
  { value: '4.8', label: 'Avg rating' },
  { value: '24/7', label: 'Support' },
];

export default function StatsSection({ data = STATS }) {
  return (
    <View className="mx-5 mt-6 flex-row">
      {data.map((item, index) => (
        <View
          key={item.label}
          className={`flex-1 rounded-2xl bg-white px-4 py-4 ${index < data.length - 1 ? 'mr-3' : ''}`}
          style={{
            shadowColor: '#0F172A',
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Text
            className="text-dark"
            style={{
              fontSize: 22,
              fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
              letterSpacing: 0,
            }}
          >
            {item.value}
          </Text>
          <Text
            className="mt-1"
            style={{ fontSize: 12, fontWeight: '600', color: '#94A3B8' }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

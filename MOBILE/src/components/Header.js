import { Platform, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ title, subtitle, onBack, rightLabel, onRightPress }) {
  return (
    <View className="px-5 pb-2 pt-14">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          {onBack ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onBack}
              className="mb-3 h-9 w-9 items-center justify-center rounded-full bg-white"
              style={{
                shadowColor: '#0F172A',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text className="text-lg font-bold text-dark">{'<'}</Text>
            </TouchableOpacity>
          ) : null}
          <Text
            className="text-dark"
            style={{
              fontSize: 28,
              fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
              lineHeight: 34,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="mt-2 text-slate-500"
              style={{ fontSize: 14, lineHeight: 20, fontWeight: '400' }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightLabel ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRightPress}
            className="mt-1 rounded-full bg-white px-5 py-2.5"
            style={{
              shadowColor: '#0F172A',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Text className="text-sm font-bold text-primary">{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

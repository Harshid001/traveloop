import { Text, View } from 'react-native';

const WEATHER_EMOJI = {
  sunny: '☀️',
  clear: '☀️',
  cloudy: '⛅',
  overcast: '☁️',
  rainy: '🌧️',
  rain: '🌧️',
  snowy: '❄️',
  snow: '❄️',
  stormy: '⛈️',
  foggy: '🌫️',
  windy: '💨',
  default: '🌤️',
};

/**
 * Compact inline badge showing weather for a destination.
 * @param {{ weather: { temp?: number, condition?: string, icon?: string, summary?: string } | null }} props
 */
export default function WeatherBadge({ weather }) {
  if (!weather) return null;

  const condition = (weather.condition || '').toLowerCase();
  const emoji = WEATHER_EMOJI[condition] || WEATHER_EMOJI.default;
  const display = weather.temp != null
    ? `${emoji} ${weather.temp}°C`
    : `${emoji} ${weather.condition || weather.summary || ''}`;

  return (
    <View className="flex-row items-center rounded-full bg-white/80 px-3 py-1.5">
      <Text className="text-xs font-bold text-dark">{display}</Text>
    </View>
  );
}

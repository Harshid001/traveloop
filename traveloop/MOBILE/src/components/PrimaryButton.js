import { Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

const variants = {
  primary: 'bg-primary',
  dark: 'bg-dark',
  light: 'bg-white border border-slate-200',
};

const textVariants = {
  primary: 'text-white',
  dark: 'text-white',
  light: 'text-dark',
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  textClassName = '',
  loadingText = 'Please wait...',
  accessibilityLabel,
}) {
  const handlePress = async () => {
    if (disabled || loading) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Optional haptic feedback is ignored on unsupported devices.
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={handlePress}
      className={`min-h-12 items-center justify-center rounded-2xl px-5 ${variants[variant]} ${
        disabled || loading ? 'opacity-60' : ''
      } ${className}`}
    >
      <Text className={`text-base font-bold ${textVariants[variant]} ${textClassName}`}>
        {loading ? loadingText : title}
      </Text>
    </TouchableOpacity>
  );
}

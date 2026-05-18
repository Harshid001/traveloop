import { Text, TouchableOpacity } from 'react-native';

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
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-2xl px-5 ${variants[variant]} ${
        disabled || loading ? 'opacity-60' : ''
      } ${className}`}
    >
      <Text className={`text-base font-bold ${textVariants[variant]} ${textClassName}`}>
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
}

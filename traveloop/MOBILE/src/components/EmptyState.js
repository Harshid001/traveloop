import { Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View className="mx-5 items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-teal-50">
        <Text className="text-xl font-extrabold text-primary">T</Text>
      </View>
      <Text className="text-center text-xl font-extrabold text-dark">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">{message}</Text>
      {actionLabel ? (
        <PrimaryButton title={actionLabel} onPress={onAction} className="mt-6 w-full" />
      ) : null}
    </View>
  );
}

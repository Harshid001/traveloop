import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchBar({ value, onChangeText, onSubmit, placeholder = 'Search destinations' }) {
  return (
    <View
      className="mx-5 mt-2 flex-row items-center rounded-2xl border border-slate-200 bg-white"
      style={{
        height: 60,
        paddingHorizontal: 16,
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {/* Search icon placeholder — teal "S" */}
      <View
        className="mr-3 items-center justify-center rounded-full"
        style={{ width: 32, height: 32, backgroundColor: '#F0FDFA' }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F9D8F' }}>S</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
        className="flex-1 text-dark"
        style={{ fontSize: 16, fontWeight: '500', height: 44 }}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSubmit}
        className="items-center justify-center rounded-full bg-primary"
        style={{ width: 44, height: 44 }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Go</Text>
      </TouchableOpacity>
    </View>
  );
}

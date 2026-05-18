import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import { notifications } from '../constants/data';
import { notificationsApi } from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState(notifications);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await notificationsApi.getNotifications();
        const list = Array.isArray(response) ? response : response?.data || [];
        if (isMounted && list.length) {
          setItems(list);
        }
      } catch (err) {
        if (isMounted) {
          setNotice(`Demo notifications shown: ${err.message}`);
        }
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-bg">
      <Header title="Notifications" subtitle="Trip updates and travel reminders." onBack={() => navigation.goBack()} />
      {notice ? <Text className="mx-5 mb-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View className="mb-4 rounded-3xl bg-white p-5">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-teal-50">
              <Text className="font-black text-primary">T</Text>
            </View>
            <Text className="text-lg font-black text-dark">{item.title}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">{item.message}</Text>
            <Text className="mt-4 text-xs font-bold text-slate-400">{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState title="No notifications" message="Trip alerts and booking updates will appear here." />
        }
      />
    </View>
  );
}

import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import { notificationsApi } from '../services/api';
import { getLocalNotifications, updateNotifications } from '../services/appData';

function normalizeNotification(item) {
  return {
    id: String(item._id || item.id || Date.now()),
    type: item.type || 'system update',
    title: item.title || 'Traveloop update',
    message: item.message || '',
    time: item.time || item.createdAt || 'Just now',
    read: Boolean(item.read),
  };
}

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [notice, setNotice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async ({ refreshingLoad = false } = {}) => {
    if (refreshingLoad) setRefreshing(true);
    const localItems = await getLocalNotifications();
    setItems(localItems.map(normalizeNotification));
    setNotice('');
    try {
      const response = await notificationsApi.getNotifications();
      const list = Array.isArray(response) ? response : response?.data || response?.notifications || [];
      if (list.length) setItems(list.map(normalizeNotification));
    } catch (err) {
      setNotice(`Local notifications shown. Sync when online: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const persist = async (nextItems) => {
    setItems(nextItems);
    await updateNotifications(nextItems);
  };

  const markRead = async (item) => {
    const nextItems = items.map((row) => (row.id === item.id ? { ...row, read: true } : row));
    await persist(nextItems);
    try {
      await notificationsApi.markAsRead(item.id);
    } catch {
      setNotice('Notification marked locally.');
    }
  };

  const deleteNotification = (item) => {
    Alert.alert('Delete notification?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const nextItems = items.filter((row) => row.id !== item.id);
          await persist(nextItems);
          try {
            await notificationsApi.deleteNotification(item.id);
          } catch {
            setNotice('Notification deleted locally.');
          }
        },
      },
    ]);
  };

  const unread = items.filter((item) => !item.read).length;

  return (
    <View className="flex-1 bg-bg">
      <Header title="Notifications" subtitle={`${unread} unread action-based travel alerts`} onBack={() => navigation.goBack()} />
      {notice ? <Text className="mx-5 mb-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications({ refreshingLoad: true })} tintColor="#0F9D8F" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View className={`mb-4 rounded-3xl p-5 ${item.read ? 'bg-white' : 'bg-teal-50'}`}>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Text className="font-black text-primary">{String(item.type).charAt(0).toUpperCase()}</Text>
              </View>
              <Text className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-primary">{item.type}</Text>
            </View>
            <Text className="text-lg font-black text-dark">{item.title}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">{item.message}</Text>
            <Text className="mt-4 text-xs font-bold text-slate-400">{item.time}</Text>
            <View className="mt-4 flex-row">
              {!item.read ? <Action label="Mark read" onPress={() => markRead(item)} /> : null}
              <Action label="Delete" danger onPress={() => deleteNotification(item)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No notifications" message="Booking updates, budget alerts, packing reminders, and trip reminders will appear here." />}
      />
    </View>
  );
}

function Action({ label, onPress, danger = false }) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-3 min-h-11 justify-center rounded-full bg-white px-4">
      <Text className={`text-xs font-black ${danger ? 'text-red-500' : 'text-dark'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import SearchBar from '../components/SearchBar';
import { destinations } from '../constants/data';
import { journalApi } from '../services/api';
import { getJson, setJson, STORAGE_KEYS } from '../services/storage';

const draftKey = 'traveloop.journal.draft';
const blankForm = { title: '', trip: '', content: '', tagsText: '', favorite: false };
const quickTags = ['memory', 'important info', 'hotel', 'transport', 'booking confirmation'];

function normalizeNote(note) {
  return {
    id: String(note._id || note.id || Date.now()),
    title: note.title || 'Untitled note',
    content: note.content || '',
    trip: note.trip || note.destination || note.tripTitle || '',
    tripId: note.tripId || '',
    tags: Array.isArray(note.tags) ? note.tags : String(note.tags || '').split(',').map((item) => item.trim()).filter(Boolean),
    favorite: Boolean(note.favorite),
    time: note.time || note.createdAt || new Date().toLocaleString(),
    photo: note.photo || '',
  };
}

export default function JournalScreen({ navigation, route }) {
  const trip = route.params?.trip || null;
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ ...blankForm, trip: trip?.title || trip?.name || '' });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(trip?.title || trip?.name || 'All');
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getJson(STORAGE_KEYS.journal, []),
      getJson(draftKey, null),
    ]).then(([storedNotes, draft]) => {
      if (!mounted) return;
      if (storedNotes.length) setNotes(storedNotes.map(normalizeNote));
      if (draft && !trip) setForm(draft);
    });
    journalApi.list().then((response) => {
      const list = Array.isArray(response) ? response : response?.data || response?.notes || [];
      if (mounted && list.length) setNotes(list.map(normalizeNote));
    }).catch((err) => {
      if (mounted) setNotice(`Journal available offline. Sync when online: ${err.message}`);
    });
    return () => {
      mounted = false;
    };
  }, [trip]);

  useEffect(() => {
    setJson(draftKey, form);
  }, [form]);

  const trips = useMemo(() => ['All', ...new Set(notes.map((note) => note.trip).filter(Boolean))], [notes]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesQuery = !needle || `${note.title} ${note.content} ${note.trip} ${(note.tags || []).join(' ')}`.toLowerCase().includes(needle);
      const matchesTrip = filter === 'All' || note.trip === filter;
      return matchesQuery && matchesTrip;
    });
  }, [filter, notes, query]);

  const persist = async (nextNotes) => {
    setNotes(nextNotes);
    await setJson(STORAGE_KEYS.journal, nextNotes);
  };

  const save = async () => {
    setNotice('');
    if (!form.title.trim() || !form.content.trim()) {
      setNotice('Add a title and note content.');
      return;
    }

    const note = normalizeNote({
      id: editingId || `note-${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      trip: form.trip.trim(),
      tripId: trip?.id || trip?._id || '',
      tags: form.tagsText.split(',').map((item) => item.trim()).filter(Boolean),
      favorite: form.favorite,
      time: 'Just now',
    });
    const nextNotes = editingId ? notes.map((item) => (item.id === editingId ? note : item)) : [note, ...notes];
    await persist(nextNotes);
    setEditingId(null);
    setForm({ ...blankForm, trip: trip?.title || trip?.name || '' });
    await setJson(draftKey, blankForm);

    try {
      if (editingId) await journalApi.update(note.id, note);
      else await journalApi.create(note);
      setNotice(editingId ? 'Note updated.' : 'Note saved.');
    } catch (err) {
      setNotice(`Note saved locally. Sync when online: ${err.message}`);
    }
  };

  const editNote = (note) => {
    setEditingId(note.id);
    setForm({
      title: note.title,
      content: note.content,
      trip: note.trip,
      tagsText: (note.tags || []).join(', '),
      favorite: note.favorite,
    });
  };

  const toggleFavorite = async (note) => {
    const nextNotes = notes.map((item) => (item.id === note.id ? { ...item, favorite: !item.favorite } : item));
    await persist(nextNotes);
    try {
      await journalApi.update(note.id, { ...note, favorite: !note.favorite });
    } catch {
      setNotice('Favorite updated locally.');
    }
  };

  const deleteNote = (note) => {
    Alert.alert('Delete note?', note.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const nextNotes = notes.filter((item) => item.id !== note.id);
          await persist(nextNotes);
          try {
            await journalApi.remove(note.id);
          } catch {
            setNotice('Note deleted locally.');
          }
        },
      },
    ]);
  };

  const addTag = (tag) => {
    const tags = form.tagsText.split(',').map((item) => item.trim()).filter(Boolean);
    if (!tags.includes(tag)) setForm((current) => ({ ...current, tagsText: [...tags, tag].join(', ') }));
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Journal" subtitle="Memories, confirmations, and personal travel notes." onBack={() => navigation.goBack()} />
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            <SearchBar value={query} onChangeText={setQuery} onSubmit={() => setQuery(query.trim())} placeholder="Search notes" />
            {notice ? <Text className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-600">{notice}</Text> : null}
            <FlatList
              horizontal
              data={trips.length > 1 ? trips : ['All', trip?.title || trip?.name || destinations[0].name]}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setFilter(item)} className={`mr-2 min-h-11 justify-center rounded-full px-4 ${filter === item ? 'bg-primary' : 'bg-white'}`}>
                  <Text className={`font-bold ${filter === item ? 'text-white' : 'text-dark'}`}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <View className="mt-5 rounded-3xl bg-white p-5">
              <Text className="text-xl font-black text-dark">{editingId ? 'Edit note' : 'Draft note'}</Text>
              <Input value={form.title} onChangeText={(value) => setForm({ ...form, title: value })} placeholder="Title" />
              <Input value={form.trip} onChangeText={(value) => setForm({ ...form, trip: value })} placeholder="Trip or destination" />
              <TextInput
                value={form.content}
                onChangeText={(value) => setForm({ ...form, content: value })}
                placeholder="Write a memory, confirmation, lesson, or important detail"
                placeholderTextColor="#94A3B8"
                multiline
                className="mt-3 min-h-36 rounded-2xl border border-slate-200 px-4 py-3 text-dark"
                textAlignVertical="top"
              />
              <Input value={form.tagsText} onChangeText={(value) => setForm({ ...form, tagsText: value })} placeholder="Tags separated by commas" />
              <FlatList
                horizontal
                data={quickTags}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                className="mt-3"
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => addTag(item)} className="mr-2 min-h-11 justify-center rounded-full bg-bg px-4">
                    <Text className="text-xs font-black text-dark">{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <Text className="mt-3 text-sm font-semibold text-slate-400">Photo attachment can be added when media upload is enabled.</Text>
              <TouchableOpacity onPress={() => setForm({ ...form, favorite: !form.favorite })} className="mt-4 min-h-11 justify-center rounded-2xl bg-bg px-4">
                <Text className="font-black text-dark">{form.favorite ? 'Remove favorite mark' : 'Mark as favorite'}</Text>
              </TouchableOpacity>
              <View className="mt-4 flex-row">
                {editingId ? <PrimaryButton title="Cancel" onPress={() => { setEditingId(null); setForm(blankForm); }} variant="light" className="mr-3 flex-1" /> : null}
                <PrimaryButton title={editingId ? 'Update note' : 'Save note'} onPress={save} className="flex-1" />
              </View>
            </View>
            <Text className="mt-6 text-xl font-black text-dark">Notes</Text>
          </>
        }
        renderItem={({ item }) => (
          <View className="mt-4 rounded-3xl bg-white p-5">
            <View className="flex-row justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xl font-black text-dark">{item.title}</Text>
                <Text className="mt-2 text-sm font-bold text-primary">{item.trip || 'Unlinked'} | {item.time}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item)} className="min-h-11 justify-center px-2">
                <Text className="text-xl font-black text-amber-500">{item.favorite ? '*' : '+'}</Text>
              </TouchableOpacity>
            </View>
            <Text className="mt-3 leading-6 text-slate-600">{item.content}</Text>
            {item.tags?.length ? (
              <View className="mt-3 flex-row flex-wrap">
                {item.tags.map((tag) => (
                  <Text key={tag} className="mb-2 mr-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-primary">{tag}</Text>
                ))}
              </View>
            ) : null}
            <View className="mt-4 flex-row">
              <SmallAction label="Edit" onPress={() => editNote(item)} />
              <SmallAction label="Delete" danger onPress={() => deleteNote(item)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No journal notes" message="Save confirmations, memories, and lessons from each trip here." />}
      />
    </View>
  );
}

function Input(props) {
  return <TextInput placeholderTextColor="#94A3B8" className="mt-3 h-14 rounded-2xl border border-slate-200 px-4 text-dark" {...props} />;
}

function SmallAction({ label, onPress, danger = false }) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-3 min-h-11 justify-center rounded-full bg-bg px-4">
      <Text className={`text-xs font-black ${danger ? 'text-red-500' : 'text-dark'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

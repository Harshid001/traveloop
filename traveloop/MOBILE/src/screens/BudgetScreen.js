import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { destinations } from '../constants/data';
import { tripsApi } from '../services/api';
import { addNotification, getTripScoped, setTripScoped } from '../services/appData';
import { STORAGE_KEYS } from '../services/storage';
import { validateExpense } from '../services/validators';

const categories = ['Hotels', 'Food', 'Transport', 'Activities', 'Shopping', 'Emergency'];
const blankEntry = { title: '', category: 'Food', amount: '', date: '', notes: '' };

function tripDays(trip) {
  const start = new Date(trip?.startDate || '');
  const end = new Date(trip?.endDate || trip?.startDate || '');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 1;
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

export default function BudgetScreen({ navigation, route }) {
  const trip = route.params?.trip || destinations[0];
  const tripId = trip.id || trip._id || 'default';
  const [currency, setCurrency] = useState('INR');
  const [total, setTotal] = useState(String(trip.budgetAmount || 120000));
  const [expenses, setExpenses] = useState([]);
  const [entry, setEntry] = useState(blankEntry);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    getTripScoped(STORAGE_KEYS.budgets, tripId, null).then((stored) => {
      if (!mounted) return;
      if (stored) {
        setCurrency(stored.currency || 'INR');
        setTotal(String(stored.total || 120000));
        setExpenses(stored.expenses || []);
      }
    });
    tripsApi.getBudget(tripId).then((response) => {
      const data = response?.data || response;
      if (!mounted || !data) return;
      setCurrency(data.currency || 'INR');
      setTotal(String(data.totalBudget || data.total || total));
      setExpenses(data.expenses || []);
    }).catch((err) => {
      if (mounted) setStatus(`Budget stored locally. Sync when online: ${err.message}`);
    });
    return () => {
      mounted = false;
    };
  }, [tripId]);

  const totalNumber = Number(total) || 0;
  const spent = useMemo(() => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [expenses]);
  const remaining = totalNumber - spent;
  const pct = totalNumber ? Math.min(100, Math.round((spent / totalNumber) * 100)) : 0;
  const daily = Math.round((remaining > 0 ? remaining : 0) / tripDays(trip));
  const categoryTotals = useMemo(() => categories.map((category) => ({
    category,
    amount: expenses.filter((item) => item.category === category).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  })), [expenses]);

  const saveState = async (nextExpenses = expenses, nextTotal = totalNumber, nextCurrency = currency) => {
    await setTripScoped(STORAGE_KEYS.budgets, tripId, {
      tripId,
      currency: nextCurrency,
      total: Number(nextTotal) || 0,
      expenses: nextExpenses,
    });
  };

  const setCurrencyAndPersist = async (nextCurrency) => {
    setCurrency(nextCurrency);
    await saveState(expenses, totalNumber, nextCurrency);
  };

  const saveExpense = async () => {
    setStatus('');
    const validation = validateExpense(entry);
    if (validation) {
      setStatus(validation);
      return;
    }

    const nextExpense = {
      id: editingId || `expense-${Date.now()}`,
      ...entry,
      amount: Number(entry.amount) || 0,
      date: entry.date || new Date().toISOString().slice(0, 10),
    };
    const nextExpenses = editingId
      ? expenses.map((item) => (item.id === editingId ? nextExpense : item))
      : [nextExpense, ...expenses];
    setExpenses(nextExpenses);
    setEntry(blankEntry);
    setEditingId(null);
    await saveState(nextExpenses);

    try {
      if (editingId) await tripsApi.updateBudgetExpense(tripId, nextExpense.id, nextExpense);
      else await tripsApi.addBudgetExpense(tripId, nextExpense);
      setStatus(editingId ? 'Expense updated.' : 'Expense added.');
    } catch (err) {
      setStatus(`Expense saved locally. Sync when online: ${err.message}`);
    }

    const nextPct = totalNumber ? Math.round((nextExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0) / totalNumber) * 100) : 0;
    if (nextPct >= 80) {
      await addNotification({
        type: 'budget alert',
        title: nextPct >= 100 ? 'Budget crossed' : 'Budget alert',
        message: `${trip.title || trip.name || 'Your trip'} has used ${nextPct}% of the budget.`,
      });
    }
  };

  const editExpense = (item) => {
    setEditingId(item.id);
    setEntry({ title: item.title, category: item.category, amount: String(item.amount), date: item.date || '', notes: item.notes || '' });
  };

  const deleteExpense = (item) => {
    Alert.alert('Delete expense?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const nextExpenses = expenses.filter((expense) => expense.id !== item.id);
          setExpenses(nextExpenses);
          await saveState(nextExpenses);
          try {
            await tripsApi.deleteBudgetExpense(tripId, item.id);
          } catch {
            setStatus('Expense deleted locally. Sync when online.');
          }
        },
      },
    ]);
  };

  const shareSummary = () => {
    const text = `${trip.title || trip.name || 'Trip'} budget\nBudget: ${currency} ${totalNumber.toLocaleString('en-IN')}\nSpent: ${currency} ${spent.toLocaleString('en-IN')}\nRemaining: ${currency} ${remaining.toLocaleString('en-IN')}`;
    Share.share({ message: text, title: 'Traveloop budget summary' });
  };

  return (
    <View className="flex-1 bg-bg">
      <Header title="Budget" subtitle="Track real spending after the plan exists." onBack={() => navigation.goBack()} rightLabel="Share" onRightPress={shareSummary} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-3xl bg-primary p-6">
          <Text className="text-sm font-bold uppercase text-teal-50">Remaining</Text>
          <Text className="mt-2 text-4xl font-black text-white">{currency} {remaining.toLocaleString('en-IN')}</Text>
          <Text className="mt-3 text-teal-50">Spent {currency} {spent.toLocaleString('en-IN')} of {currency} {totalNumber.toLocaleString('en-IN')}</Text>
          <View className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
            <View className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </View>
          <Text className="mt-3 text-sm font-bold text-teal-50">Daily remaining estimate: {currency} {daily.toLocaleString('en-IN')}</Text>
          {pct >= 80 ? (
            <Text className="mt-4 rounded-2xl bg-white px-4 py-3 font-bold text-red-500">
              {pct >= 100 ? 'Budget limit crossed' : '80% of budget used'}
            </Text>
          ) : null}
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">Budget setup</Text>
          <TextInput value={total} onChangeText={setTotal} onBlur={() => saveState()} keyboardType="number-pad" placeholder="Total budget" placeholderTextColor="#94A3B8" className="mt-4 h-14 rounded-2xl border border-slate-200 px-4 text-dark" />
          <View className="mt-4 flex-row">
            {['INR', 'USD'].map((item) => (
              <TouchableOpacity key={item} onPress={() => setCurrencyAndPersist(item)} className={`mr-3 min-h-11 justify-center rounded-full px-5 ${currency === item ? 'bg-primary' : 'bg-bg'}`}>
                <Text className={`font-black ${currency === item ? 'text-white' : 'text-dark'}`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5">
          <Text className="text-xl font-black text-dark">{editingId ? 'Edit expense' : 'Add expense'}</Text>
          <Input value={entry.title} onChangeText={(value) => setEntry({ ...entry, title: value })} placeholder="Expense title" />
          <Input value={entry.amount} onChangeText={(value) => setEntry({ ...entry, amount: value })} placeholder="Amount" keyboardType="number-pad" />
          <Input value={entry.date} onChangeText={(value) => setEntry({ ...entry, date: value })} placeholder="2026-06-25" />
          <Input value={entry.notes} onChangeText={(value) => setEntry({ ...entry, notes: value })} placeholder="Notes" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {categories.map((category) => (
              <TouchableOpacity key={category} onPress={() => setEntry({ ...entry, category })} className={`mr-2 min-h-11 justify-center rounded-full px-4 ${entry.category === category ? 'bg-primary' : 'bg-bg'}`}>
                <Text className={`font-bold ${entry.category === category ? 'text-white' : 'text-dark'}`}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="mt-4 flex-row">
            {editingId ? <PrimaryButton title="Cancel" onPress={() => { setEditingId(null); setEntry(blankEntry); }} variant="light" className="mr-3 flex-1" /> : null}
            <PrimaryButton title={editingId ? 'Update expense' : 'Add expense'} onPress={saveExpense} className="flex-1" />
          </View>
          {status ? <Text className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-600">{status}</Text> : null}
        </View>

        <Text className="mt-6 text-xl font-black text-dark">Category breakdown</Text>
        {categoryTotals.map((item) => (
          <View key={item.category} className="mt-3 rounded-2xl bg-white p-4">
            <View className="flex-row justify-between">
              <Text className="font-black text-dark">{item.category}</Text>
              <Text className="font-black text-primary">{currency} {item.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
              <View className="h-full rounded-full bg-primary" style={{ width: `${spent ? Math.round((item.amount / spent) * 100) : 0}%` }} />
            </View>
          </View>
        ))}

        <Text className="mt-6 text-xl font-black text-dark">Expense history</Text>
        {expenses.length ? expenses.map((item) => (
          <View key={item.id} className="mt-3 rounded-3xl bg-white p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-black text-dark">{item.title}</Text>
                <Text className="mt-1 text-slate-500">{item.category} | {item.date || 'Today'}</Text>
                {item.notes ? <Text className="mt-2 text-sm text-slate-500">{item.notes}</Text> : null}
              </View>
              <Text className="font-black text-primary">{currency} {Number(item.amount).toLocaleString('en-IN')}</Text>
            </View>
            <View className="mt-4 flex-row">
              <SmallAction label="Edit" onPress={() => editExpense(item)} />
              <SmallAction label="Delete" danger onPress={() => deleteExpense(item)} />
            </View>
          </View>
        )) : (
          <EmptyState title="No expenses yet" message="Add costs as you book hotels, meals, transport, and activities." />
        )}
      </ScrollView>
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

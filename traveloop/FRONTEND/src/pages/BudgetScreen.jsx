import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  DollarSign,
  Hotel,
  Plus,
  ShoppingBag,
  Ticket,
  Trash2,
  TrendingDown,
  TrendingUp,
  Utensils,
  WalletCards,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const categories = [
  { label: 'Hotels', icon: Hotel, color: '#4F46E5' },
  { label: 'Food', icon: Utensils, color: '#22C55E' },
  { label: 'Transport', icon: Car, color: '#06B6D4' },
  { label: 'Activities', icon: Ticket, color: '#7C3AED' },
  { label: 'Shopping', icon: ShoppingBag, color: '#EC4899' },
  { label: 'Emergency', icon: WalletCards, color: '#EF4444' },
];

const initialExpenses = [];

const currencySymbol = { INR: '₹', USD: '$' };

export default function BudgetScreen() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('INR');
  const [totalBudget, setTotalBudget] = useState(0);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [entry, setEntry] = useState({ title: '', category: 'Food', amount: '', destination: '' });
  const [notice, setNotice] = useState('');
  const symbol = currencySymbol[currency];

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - spent;
  const spentPct = totalBudget ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;

  const categoryTotals = useMemo(() => categories.map((category) => {
    const amount = expenses.filter((expense) => expense.category === category.label).reduce((sum, expense) => sum + expense.amount, 0);
    return { ...category, amount, pct: totalBudget ? Math.round((amount / totalBudget) * 100) : 0 };
  }), [expenses, totalBudget]);

  const categorySlices = categoryTotals.map((cat, index) => ({
    ...cat,
    offset: categoryTotals.slice(0, index).reduce((sum, item) => sum + item.pct, 0),
  }));

  const perDestination = Object.values(expenses.reduce((acc, expense) => {
    const key = expense.destination || 'Unassigned';
    acc[key] = acc[key] || { city: key, total: 0, color: categories.find((cat) => cat.label === expense.category)?.color || '#4F46E5' };
    acc[key].total += expense.amount;
    return acc;
  }, {}));

  const fmt = (n) => `${symbol}${Math.max(0, n).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}`;

  const addExpense = () => {
    const amount = Number(entry.amount);
    if (!entry.title.trim() || !amount) {
      setNotice('Add an expense title and amount.');
      return;
    }
    setExpenses((current) => [{ id: Date.now(), ...entry, amount, date: new Date().toISOString().slice(0, 10) }, ...current]);
    setEntry({ title: '', category: entry.category, amount: '', destination: '' });
    setNotice('Expense added ✓');
    setTimeout(() => setNotice(''), 2500);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back to home"
            onClick={() => navigate('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Budget &amp; Costs</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track and manage expenses across destinations</p>
          </div>
        </div>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none shadow-xs"
        >
          <option>INR</option>
          <option>USD</option>
        </select>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {[
          { label: 'Total Budget', val: fmt(totalBudget), icon: DollarSign, color: '#4F46E5', trend: null },
          { label: 'Spent', val: fmt(spent), icon: TrendingDown, color: spent > totalBudget ? '#EF4444' : '#7C3AED', trend: `${spentPct}%` },
          { label: 'Remaining', val: fmt(remaining), icon: TrendingUp, color: remaining < 0 ? '#EF4444' : '#22C55E', trend: `${Math.max(0, 100 - spentPct)}%` },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-soft"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: c.color + '18' }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <p className="break-words font-poppins text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-slate-100">{c.val}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.label}</span>
              {c.trend && (
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" style={{ backgroundColor: c.color + '18', color: c.color }}>
                  {c.trend}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget warning */}
      {spent > totalBudget && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-bold text-danger">
          <TrendingDown size={16} className="shrink-0" />
          Budget limit exceeded! Consider adjusting your expenses or increasing the total budget.
        </div>
      )}

      {/* Overall progress bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-soft mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Overall Budget Utilization</span>
          <span className="text-xs font-extrabold text-primary dark:text-primary-light">{spentPct}% used</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full transition-colors"
            style={{ backgroundColor: spentPct >= 90 ? '#EF4444' : spentPct >= 70 ? '#F59E0B' : '#4F46E5' }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{fmt(0)}</span>
          <span>{fmt(totalBudget)}</span>
        </div>
      </div>

      {/* Breakdown + Quick Expense */}
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem] mb-6">
        {/* Donut chart + category list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 shadow-soft"
        >
          <h2 className="mb-5 font-poppins text-base font-bold text-slate-900 dark:text-slate-100">Spending Breakdown</h2>
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            {/* Donut */}
            <div className="relative h-40 w-40 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                {categorySlices.map((cat) => (
                  <circle
                    key={cat.label}
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    strokeWidth="3.5"
                    stroke={cat.color}
                    strokeDasharray={`${cat.pct} ${100 - cat.pct}`}
                    strokeDashoffset={-cat.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100">{spentPct}%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Spent</span>
              </div>
            </div>

            {/* Category rows */}
            <div className="w-full flex-1 space-y-3">
              {categoryTotals.map((cat, i) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cat.color + '18' }}>
                    <cat.icon size={15} style={{ color: cat.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="text-right text-xs font-extrabold text-slate-900 dark:text-slate-100">{fmt(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Expense Form */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-soft">
          <h2 className="font-poppins text-base font-bold text-slate-900 dark:text-slate-100">Quick Expense Entry</h2>
          <div className="mt-4 space-y-3">
            <input
              value={entry.title}
              onChange={(event) => setEntry({ ...entry, title: event.target.value })}
              className="input-field text-xs py-2.5"
              placeholder="Expense title"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={entry.amount}
                onChange={(event) => setEntry({ ...entry, amount: event.target.value })}
                className="input-field text-xs py-2.5"
                type="number"
                placeholder="Amount"
              />
              <input
                value={entry.destination}
                onChange={(event) => setEntry({ ...entry, destination: event.target.value })}
                className="input-field text-xs py-2.5"
                placeholder="Destination"
              />
            </div>
            <select
              value={entry.category}
              onChange={(event) => setEntry({ ...entry, category: event.target.value })}
              className="input-field text-xs py-2.5 font-bold"
            >
              {categories.map((category) => <option key={category.label}>{category.label}</option>)}
            </select>
            <button
              onClick={addExpense}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent py-3 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={15} /> Add Expense
            </button>
            {notice && (
              <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{notice}</p>
            )}
          </div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Budget Limit</label>
          <input
            value={totalBudget}
            onChange={(event) => setTotalBudget(Number(event.target.value) || 0)}
            className="input-field text-xs py-2.5 mt-2 font-bold"
            type="number"
          />
        </section>
      </section>

      {/* Expense History */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 shadow-soft mb-6">
        <h2 className="mb-4 font-poppins text-base font-bold text-slate-900 dark:text-slate-100">Expense History</h2>
        {expenses.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">No expenses added yet.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const cat = categories.find((c) => c.label === expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3.5 border border-slate-100 dark:border-slate-700/50 transition-colors"
                >
                  {cat && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cat.color + '18' }}>
                      <cat.icon size={15} style={{ color: cat.color }} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{expense.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{expense.category} · {expense.destination || 'Unassigned'} · {expense.date}</p>
                  </div>
                  <span className="font-poppins font-extrabold text-primary dark:text-primary-light">{fmt(expense.amount)}</span>
                  <button
                    onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                    aria-label={`Delete ${expense.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cost per Destination */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 shadow-soft">
        <h2 className="mb-4 font-poppins text-base font-bold text-slate-900 dark:text-slate-100">Cost per Destination</h2>
        <div className="space-y-4">
          {perDestination.map((c) => (
            <div key={c.city}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.city}</span>
                <span className="text-xs font-extrabold" style={{ color: c.color }}>{fmt(c.total)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((c.total / totalBudget) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}


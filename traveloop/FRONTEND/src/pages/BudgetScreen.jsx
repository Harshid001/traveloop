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

const categories = [
  { label: 'Hotels', icon: Hotel, color: '#4F46E5' },
  { label: 'Food', icon: Utensils, color: '#22C55E' },
  { label: 'Transport', icon: Car, color: '#F59E0B' },
  { label: 'Activities', icon: Ticket, color: '#8B5CF6' },
  { label: 'Shopping', icon: ShoppingBag, color: '#EC4899' },
  { label: 'Emergency', icon: WalletCards, color: '#EF4444' },
];

const initialExpenses = [
  { id: 1, title: 'Paris hotel deposit', category: 'Hotels', amount: 120000, destination: 'Paris', date: '2026-06-21' },
  { id: 2, title: 'Food tour booking', category: 'Food', amount: 50000, destination: 'Rome', date: '2026-06-22' },
  { id: 3, title: 'Train tickets', category: 'Transport', amount: 30000, destination: 'Barcelona', date: '2026-06-24' },
  { id: 4, title: 'Museum passes', category: 'Activities', amount: 45000, destination: 'Paris', date: '2026-06-26' },
];

const currencySymbol = { INR: '₹', USD: '$' };

export default function BudgetScreen() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('INR');
  const [totalBudget, setTotalBudget] = useState(350000);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [entry, setEntry] = useState({ title: '', category: 'Food', amount: '', destination: '' });
  const [notice, setNotice] = useState('');
  const symbol = currencySymbol[currency];

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - spent;
  const spentPct = Math.min(100, Math.round((spent / totalBudget) * 100));

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

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-indigo-400';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            aria-label="Back to home"
            onClick={() => navigate('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="flex-1 font-poppins text-lg font-bold text-slate-900 dark:text-white">Budget &amp; Costs</h1>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option>INR</option>
            <option>USD</option>
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Budget', val: fmt(totalBudget), icon: DollarSign, color: '#4F46E5', trend: null },
            { label: 'Spent', val: fmt(spent), icon: TrendingDown, color: spent > totalBudget ? '#EF4444' : '#8B5CF6', trend: `${spentPct}%` },
            { label: 'Remaining', val: fmt(remaining), icon: TrendingUp, color: remaining < 0 ? '#EF4444' : '#22C55E', trend: `${Math.max(0, 100 - spentPct)}%` },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: c.color + '18' }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
              <p className="break-words font-poppins text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{c.val}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{c.label}</span>
                {c.trend && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: c.color + '18', color: c.color }}>
                    {c.trend}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Budget warning */}
        {spent > totalBudget && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-400">
            <TrendingDown size={16} className="shrink-0" />
            Budget limit crossed. Reduce optional expenses or increase the trip budget.
          </div>
        )}

        {/* Overall progress bar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Spend</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{spentPct}% used</span>
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
          <div className="mt-2 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>{fmt(0)}</span>
            <span>{fmt(totalBudget)}</span>
          </div>
        </div>

        {/* Breakdown + Quick Expense */}
        <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          {/* Donut chart + category list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800"
          >
            <h2 className="mb-5 font-poppins text-base font-bold text-slate-900 dark:text-white">Spending Breakdown</h2>
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
                  <span className="font-poppins text-xl font-bold text-slate-900 dark:text-white">{spentPct}%</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Spent</span>
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
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <span className="text-right text-xs font-bold text-slate-900 dark:text-white">{fmt(cat.amount)}</span>
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
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
            <h2 className="font-poppins text-base font-bold text-slate-900 dark:text-white">Quick Expense</h2>
            <div className="mt-4 space-y-3">
              <input
                value={entry.title}
                onChange={(event) => setEntry({ ...entry, title: event.target.value })}
                className={inputCls}
                placeholder="Expense title"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={entry.amount}
                  onChange={(event) => setEntry({ ...entry, amount: event.target.value })}
                  className={inputCls}
                  type="number"
                  placeholder="Amount"
                />
                <input
                  value={entry.destination}
                  onChange={(event) => setEntry({ ...entry, destination: event.target.value })}
                  className={inputCls}
                  placeholder="Destination"
                />
              </div>
              <select
                value={entry.category}
                onChange={(event) => setEntry({ ...entry, category: event.target.value })}
                className={inputCls}
              >
                {categories.map((category) => <option key={category.label}>{category.label}</option>)}
              </select>
              <button
                onClick={addExpense}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/25"
              >
                <Plus size={15} /> Add Expense
              </button>
              {notice && (
                <p className="text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">{notice}</p>
              )}
            </div>
            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Budget</label>
            <input
              value={totalBudget}
              onChange={(event) => setTotalBudget(Number(event.target.value) || 0)}
              className={`${inputCls} mt-2`}
              type="number"
            />
          </section>
        </section>

        {/* Expense History */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
          <h2 className="mb-4 font-poppins text-base font-bold text-slate-900 dark:text-white">Expense History</h2>
          {expenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No expenses added yet.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const cat = categories.find((c) => c.label === expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
                  >
                    {cat && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: cat.color + '18' }}>
                        <cat.icon size={14} style={{ color: cat.color }} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{expense.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{expense.category} · {expense.destination || 'Unassigned'} · {expense.date}</p>
                    </div>
                    <span className="font-poppins font-bold text-indigo-600 dark:text-indigo-400">{fmt(expense.amount)}</span>
                    <button
                      onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white hover:text-rose-500 dark:hover:bg-slate-600 dark:hover:text-rose-400"
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
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
          <h2 className="mb-4 font-poppins text-base font-bold text-slate-900 dark:text-white">Cost per Destination</h2>
          <div className="space-y-4">
            {perDestination.map((c) => (
              <div key={c.city}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.city}</span>
                  <span className="text-sm font-bold" style={{ color: c.color }}>{fmt(c.total)}</span>
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
          <button
            type="button"
            className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-500 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            Export budget summary
          </button>
        </section>
      </main>
    </div>
  );
}

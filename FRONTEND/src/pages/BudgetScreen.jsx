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
  { label: 'Hotels', icon: Hotel, color: '#2563EB' },
  { label: 'Food', icon: Utensils, color: '#22C55E' },
  { label: 'Transport', icon: Car, color: '#F59E0B' },
  { label: 'Activities', icon: Ticket, color: '#4F46E5' },
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
    acc[key] = acc[key] || { city: key, total: 0, color: categories.find((cat) => cat.label === expense.category)?.color || '#2563EB' };
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
    setNotice('Expense added.');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="tap-target rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"><ArrowLeft size={18} /></button>
          <h1 className="font-poppins text-lg font-bold text-textDark">Budget & Costs</h1>
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-textDark">
            <option>INR</option>
            <option>USD</option>
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Budget', val: fmt(totalBudget), icon: DollarSign, color: '#2563EB' },
            { label: 'Spent', val: fmt(spent), icon: TrendingDown, color: spent > totalBudget ? '#EF4444' : '#4F46E5', trend: `${spentPct}%` },
            { label: 'Remaining', val: fmt(remaining), icon: TrendingUp, color: remaining < 0 ? '#EF4444' : '#22C55E', trend: `${Math.max(0, 100 - spentPct)}%` },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: c.color + '12' }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
              <p className="break-words font-poppins text-xl font-bold text-textDark sm:text-2xl">{c.val}</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-textMuted">{c.label}</span>
                {c.trend && <span className="ml-auto text-[10px] font-bold" style={{ color: c.color }}>{c.trend}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {spent > totalBudget && (
          <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
            Budget limit crossed. Reduce optional expenses or increase the trip budget.
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <h2 className="mb-5 font-poppins text-base font-bold text-textDark">Spending Breakdown</h2>
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  {categorySlices.map((cat) => (
                    <circle key={cat.label} cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                      stroke={cat.color} strokeDasharray={`${cat.pct} ${100 - cat.pct}`} strokeDashoffset={-cat.offset} />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-poppins text-lg font-bold text-textDark">{spentPct}%</span>
                  <span className="text-[10px] text-textMuted">Spent</span>
                </div>
              </div>
              <div className="w-full flex-1 space-y-3">
                {categoryTotals.map((cat, i) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: cat.color + '12' }}>
                      <cat.icon size={15} style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-textDark">{cat.label}</span>
                        <span className="text-right text-xs font-bold text-textDark">{fmt(cat.amount)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft">
            <h2 className="font-poppins text-base font-bold text-textDark">Quick Expense</h2>
            <input value={entry.title} onChange={(event) => setEntry({ ...entry, title: event.target.value })} className="input-field mt-4 py-3" placeholder="Expense title" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input value={entry.amount} onChange={(event) => setEntry({ ...entry, amount: event.target.value })} className="input-field py-3" type="number" placeholder="Amount" />
              <input value={entry.destination} onChange={(event) => setEntry({ ...entry, destination: event.target.value })} className="input-field py-3" placeholder="Destination" />
            </div>
            <select value={entry.category} onChange={(event) => setEntry({ ...entry, category: event.target.value })} className="input-field mt-3">
              {categories.map((category) => <option key={category.label}>{category.label}</option>)}
            </select>
            <ButtonLike onClick={addExpense}><Plus size={15} /> Add expense</ButtonLike>
            {notice && <p className="mt-3 text-xs font-semibold text-primary">{notice}</p>}
            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-textMuted">Total budget</label>
            <input value={totalBudget} onChange={(event) => setTotalBudget(Number(event.target.value) || 0)} className="input-field mt-2 py-3" type="number" />
          </section>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-poppins text-base font-bold text-textDark">Expense History</h2>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-textDark">{expense.title}</p>
                  <p className="text-xs text-textMuted">{expense.category} • {expense.destination || 'Unassigned'} • {expense.date}</p>
                </div>
                <span className="font-poppins font-bold text-primary">{fmt(expense.amount)}</span>
                <button onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} className="tap-target rounded-xl text-slate-400 hover:bg-white hover:text-danger" aria-label={`Delete ${expense.title}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-poppins text-base font-bold text-textDark">Cost per Destination</h2>
          <div className="space-y-4">
            {perDestination.map((c) => (
              <div key={c.city}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-textDark">{c.city}</span>
                  <span className="text-sm font-bold" style={{ color: c.color }}>{fmt(c.total)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((c.total / totalBudget) * 100)}%` }}
                    transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-textMuted">
            Export budget summary placeholder
          </button>
        </section>
      </main>
    </div>
  );
}

function ButtonLike({ children, onClick }) {
  return (
    <button onClick={onClick} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
      {children}
    </button>
  );
}

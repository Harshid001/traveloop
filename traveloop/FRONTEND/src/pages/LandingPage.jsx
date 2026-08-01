import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  Map,
  Wallet,
  CheckSquare,
  BookOpen,
  Bell,
  Compass,
  Sparkles,
  ArrowRight,
  Users,
  Download,
} from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  {
    icon: Map,
    title: 'Itinerary builder with map',
    description: 'Plan day-by-day stops with a numbered map view of your route — no spreadsheet gymnastics.',
  },
  {
    icon: Wallet,
    title: 'Budgets that actually track',
    description: 'Log expenses in your currency, watch category breakdowns, and get over-budget alerts before it hurts.',
  },
  {
    icon: CheckSquare,
    title: 'Smart packing lists',
    description: 'Weather-aware checklists generated per trip, so you pack for the place, not the guess.',
  },
  {
    icon: BookOpen,
    title: 'Trip journal',
    description: 'Capture memories, notes, and receipts while they are fresh — your trip history lives on.',
  },
  {
    icon: Bell,
    title: 'Reminders & alerts',
    description: 'Trip-date nudges, budget warnings, and packing reminders — Traveloop keeps the loop closed.',
  },
  {
    icon: Compass,
    title: 'Explore & discover',
    description: 'Trending destinations, seasonal picks, and search across every trip, place, and note you have.',
  },
];

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual travelers planning their own trips.',
    features: [
      'Unlimited trips & itineraries',
      'Budgets with currency conversion',
      'Packing lists',
      'Trip journal',
      'Explore & discover',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    description: 'For travelers who want AI help and trip concierge.',
    features: [
      'Everything in Free',
      'AI travel assistant with real planning help',
      'Trip data export (JSON/PDF)',
      'Priority call-back requests',
      'Advanced budget analytics',
    ],
    cta: 'Coming Soon',
    highlighted: true,
  },
  {
    name: 'Family / Group',
    price: '$9.99',
    period: '/month',
    description: 'For shared trips and collaborative planning.',
    features: [
      'Everything in Premium',
      'Collaborative trip planning',
      'Shared budgets & checklists',
      'Group itineraries',
    ],
    cta: 'Coming Soon',
    highlighted: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent text-white shadow-sm">
              <Send size={18} />
            </div>
            <span className="font-poppins text-lg font-extrabold tracking-tight">Traveloop</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/login')} className="px-5 py-2.5 text-xs font-bold">
              LOGIN
            </Button>
            <Button variant="primary" onClick={() => navigate('/signup')} className="px-5 py-2.5 text-xs font-bold">
              SIGN UP FREE
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary dark:text-primary-light">
                <Sparkles size={12} />
                One loop for your whole trip
              </span>
              <h1 className="mt-6 font-poppins text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Stop juggling tabs, notes,
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> apps, and spreadsheets</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                Traveloop keeps bookings, itineraries, budgets, packing lists, notes, and memories in one loop —
                plan a trip from first idea to last journal entry, on web and mobile.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold shadow-lg shadow-primary/25"
                >
                  Start Planning Free <ArrowRight size={16} className="ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold"
                >
                  I already have an account
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Free forever for individual planning · No credit card required
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature proof */}
      <section className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-poppins text-3xl font-extrabold tracking-tight">Everything your trip needs, in one place</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Built around the real trip lifecycle: plan, book-reference, budget, pack, travel, remember.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-4 font-poppins text-base font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-poppins text-3xl font-extrabold tracking-tight">Simple pricing, when you are ready</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              The core planner is free. Premium and group tiers are planned — this is where monetization lands next.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover ${
                  tier.highlighted
                    ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    Most popular
                  </span>
                )}
                <h3 className="font-poppins text-lg font-bold">{tier.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tier.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-poppins text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-sm font-semibold text-slate-400">{tier.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5">
                          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlighted ? 'primary' : 'secondary'}
                  onClick={() => navigate('/signup')}
                  className="mt-6 w-full py-3 text-xs font-bold"
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Users size={14} /> Group &amp; collaboration pricing arrives with the collaboration feature.
            <Download size={14} className="ml-3" /> Export your data anytime — it belongs to you.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-10 text-center text-white shadow-2xl sm:p-14">
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="font-poppins text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your next trip deserves one loop
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                Create your first itinerary in minutes. Free forever for individual travelers.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary-dark"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  Log In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary via-secondary to-accent text-white">
              <Send size={14} />
            </div>
            <span className="font-poppins text-sm font-bold">Traveloop</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Traveloop. Plan smart. Travel better.
          </p>
        </div>
      </footer>
    </div>
  );
}

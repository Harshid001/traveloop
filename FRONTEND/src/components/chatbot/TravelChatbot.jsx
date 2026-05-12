import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Compass,
  Eraser,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Minimize2,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { sendChatbotMessage } from './chatbotApi';

const STORAGE_KEY = 'traveloop.chat.history.v1';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm your travel assistant. Where would you like to go?",
  links: [
    { label: 'Explore destinations', href: '/explore' },
    { label: 'Create a trip', href: '/create-trip' },
  ],
};

const quickSuggestions = [
  'Suggest a trip',
  'Find hotels',
  'Plan 3-day itinerary',
  'Best places near me',
  'Budget travel ideas',
];

function createMessage(role, text, extras = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    ...extras,
  };
}

function getInitialMessages() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [welcomeMessage];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [welcomeMessage];
  } catch {
    return [welcomeMessage];
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-slate-400 shadow-sm ring-1 ring-slate-100">
      <Loader2 size={14} className="animate-spin text-blue-600" />
      <span className="text-xs font-semibold">Travel assistant is typing</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

function AssistantLinks({ links }) {
  if (!links?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          to={link.href}
          className="inline-flex min-h-9 items-center rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-[#E0E7FF]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function DestinationCards({ cards }) {
  if (!cards?.length) return null;

  return (
    <div className="mt-3 grid gap-2">
      {cards.map((card) => (
        <Link
          key={`${card.href}-${card.title}`}
          to={card.href}
          className="group flex min-h-24 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-shadow hover:shadow-md sm:flex-row"
        >
          <img src={card.image} alt="" className="h-28 w-full shrink-0 object-cover sm:h-auto sm:w-24" />
          <div className="min-w-0 flex-1 p-3">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="truncate font-poppins text-sm font-bold text-slate-900">{card.title}</p>
                <p className="text-xs font-semibold text-blue-600">{card.subtitle}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {card.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Bot size={12} /> Travel Assistant
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-br-md bg-blue-600 text-white'
              : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-100'
          }`}
        >
          {message.text}
        </div>
        {!isUser && (
          <>
            <DestinationCards cards={message.cards} />
            <AssistantLinks links={message.links} />
          </>
        )}
      </div>
    </div>
  );
}

export default function TravelChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const speechSupported = useMemo(
    () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    [],
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const submitMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = createMessage('user', trimmed);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: trimmed,
        history: nextMessages.map(({ role, text: itemText }) => ({ role, text: itemText })),
      });
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.reply, {
          cards: response.cards,
          links: response.links,
          suggestions: response.suggestions,
        }),
      ]);
    } catch (requestError) {
      setError(requestError.message);
      setMessages((current) => [
        ...current,
        createMessage('assistant', 'I had trouble reaching the travel assistant API. Please try again in a moment.', {
          links: [{ label: 'Explore destinations', href: '/explore' }],
        }),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setInput('');
    setError('');
  };

  const toggleVoiceInput = () => {
    if (!speechSupported || listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setInput((current) => `${current}${current ? ' ' : ''}${transcript}`.trim());
    };

    recognition.start();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage(input);
  };

  const latestSuggestions = messages.at(-1)?.suggestions || quickSuggestions;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="travel-chatbot-title"
            className="fixed inset-0 z-[80] flex h-[100dvh] flex-col overflow-hidden bg-[#f8fafc] sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(680px,calc(100dvh-7rem))] sm:w-[420px] sm:max-w-[calc(100vw-2rem)] sm:rounded-3xl sm:border sm:border-white/70 sm:shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
          >
            <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-500 px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white sm:rounded-t-3xl sm:pt-5">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <Compass size={24} />
                  </div>
                  <div className="min-w-0">
                    <h2 id="travel-chatbot-title" className="truncate font-poppins text-base font-bold xs:text-lg">
                      Traveloop Assistant
                    </h2>
                    <p className="flex items-center gap-1 text-xs text-white/75">
                      <Sparkles size={12} /> Plans, routes, budgets and tips
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={clearChat}
                    aria-label="Clear chat"
                    className="tap-target rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Eraser size={17} className="mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Minimize chat"
                    className="tap-target rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Minimize2 size={17} className="mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="tap-target rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
              {error && (
                <p className="mb-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                  {error}
                </p>
              )}

              <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
                {latestSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitMessage(suggestion)}
                    disabled={loading}
                    className="min-h-10 shrink-0 rounded-full border border-slate-100 bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-accent/20 hover:bg-[#EEF2FF] hover:text-blue-600 disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        submitMessage(input);
                      }
                    }}
                    rows={1}
                    placeholder="Ask about destinations, hotels, budgets..."
                    className="max-h-28 min-h-12 w-full resize-none rounded-2xl border border-slate-100 bg-[#f8fafc] py-3 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      aria-label="Use voice input"
                      className={`absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        listening ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:bg-white hover:text-blue-600'
                      }`}
                    >
                      <Mic size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="tap-target rounded-2xl bg-blue-600 text-white shadow-[0_10px_26px_rgba(79,70,229,0.28)] transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : <Send size={18} className="mx-auto" />}
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open travel assistant chat"
        initial={false}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        className="fixed bottom-4 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_32px_rgba(79,70,229,0.3)] ring-1 ring-white/30 transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 sm:h-16 sm:w-16 sm:rounded-3xl"      >
        <MessageCircle size={22} className="sm:hidden" />
        <MessageCircle size={26} className="hidden sm:block" />
        <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-green-400 ring-4 ring-white sm:h-5 sm:w-5 animate-pulse" />
      </motion.button>
    </>
  );
}

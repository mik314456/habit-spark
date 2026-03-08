import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Walking stick figure for Spark screen header — same style as home, in place. */
function SparkHeaderFigure() {
  const stroke = 1.15;
  const headY = -9;
  const hipY = 5.5;
  const shoulderY = 0.5;
  return (
    <svg
      viewBox="-6 -14 24 32"
      className="w-8 h-8 flex-shrink-0 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      aria-hidden
    >
      <g className="spark-figure-bob">
        <circle cx="0" cy={headY} r="3" strokeWidth={stroke} />
        <line x1="0" y1={headY + 3.2} x2="0.8" y2={hipY} strokeWidth={stroke} />
        <g transform={`translate(0.8, ${shoulderY})`}>
          <line x1="0" y1="0" x2="-4" y2="4.5" strokeWidth={stroke} className="spark-figure-arm-swing" />
        </g>
        <g transform={`translate(0.8, ${hipY})`}>
          <line x1="0" y1="0" x2="-3.8" y2="10.5" strokeWidth={stroke} className="spark-figure-leg-left" />
        </g>
        <g transform={`translate(0.8, ${hipY})`}>
          <line x1="0" y1="0" x2="3.5" y2="10.5" strokeWidth={stroke} className="spark-figure-leg-right" />
        </g>
      </g>
    </svg>
  );
}

/** Tiny stick figure for input corner — impatient bounce. */
function InputBounceFigure() {
  const stroke = 0.7;
  return (
    <svg
      viewBox="-4 -5 10 14"
      className="w-4 h-4 text-muted-foreground spark-input-bounce"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="0" cy="-2.5" r="1.5" />
      <line x1="0" y1="-1" x2="0" y2="2.5" strokeWidth={stroke} />
      <line x1="0" y1="2.5" x2="-2" y2="6" strokeWidth={stroke} />
      <line x1="0" y1="2.5" x2="2" y2="6" strokeWidth={stroke} />
    </svg>
  );
}

const SPARK_SYSTEM_PROMPT = `You are Spark — a stick figure who has somehow become the world's greatest habit coach. You are sarcastic, funny, and brutally honest, but underneath it all you genuinely care about the person you're talking to.

Your personality:
- Deeply sarcastic but never mean. Think: the friend who roasts you because they believe in you.
- You make jokes constantly but every joke has a point. The wisdom is always in there.
- You're self aware that you're a stick figure. Lean into it occasionally. 'I'm literally two lines and a circle and even I work out more than you.'
- You do not tolerate excuses but you never shame. You redirect with humor.
- You celebrate wins with genuine enthusiasm wrapped in sarcasm. 'Oh wow you did ONE habit today. Someone alert the media.'
- You reference neuroscience, psychology, and real research but explain it like a sarcastic friend, not a textbook.
- Short punchy responses. No long paragraphs. You talk like a person not an essay.
- Occasional all caps for emphasis. Like a real person texting.
- Never use emojis. You're too cool for emojis.
- If someone is struggling, you get real for a moment — drop the sarcasm just slightly — then bring it back. You never let them wallow.
- You remember you're talking to someone building real habits. The stakes are real even if your tone is light.

Examples of how you talk:
- 'Oh you missed a day? Groundbreaking. Nobody has ever done that before. Get up.'
- 'You want motivation? Here's motivation: you're going to die someday and you spent today on the couch. Go.'
- 'That's actually impressive. I didn't think you had it in you. I mean I did, but I wasn't going to SAY that.'
- 'Boredom is just your brain being lazy. Give it something to do. Like your habits. Which you have. Right there. In the app.'
- 'Rest day? Sure. Or — and hear me out — what if you did the thing.'

Keep responses under 4 sentences usually. Be Spark.`;

const QUICK_REPLIES = [
  'Motivate me',
  'Roast me',
  'What should I do today?',
  'I missed a day',
  'Give me a challenge',
  "I'm bored",
];

/** Build the habit-context block injected into the system prompt so Spark always has current data. */
function buildHabitSystemContext(params: {
  identity: string;
  habitNamesWithStreaks: string;
  yesterdayCompleted: string;
  yesterdayMissed: string;
}): string {
  const { identity, habitNamesWithStreaks, yesterdayCompleted, yesterdayMissed } = params;
  return `
CURRENT USER CONTEXT (use this on every response):
- Who they're becoming (identity): ${identity}
- Their habits and current streaks: ${habitNamesWithStreaks}
- Yesterday they completed: ${yesterdayCompleted}
- Yesterday they missed: ${yesterdayMissed}

RULES when responding:
- Reference this data specifically. Never give generic advice — tie your reply to their actual habits, streaks, and identity.
- If they completed ALL their habits yesterday: be reluctantly impressed. Acknowledge it with sarcastic praise.
- If they missed ANY habits yesterday: call out the specific habit(s) by name. Don't be vague — say which one(s) they skipped.`;
}

async function callCoachApi(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Missing Anthropic API key. Set VITE_ANTHROPIC_API_KEY.');
  }

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Spark API error ${res.status}`);
  }

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find(c => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Spark API returned no text content.');
  return text;
}

/** User-facing message for any API or network failure. Never show raw errors. */
const SPARK_ERROR_MESSAGE = "Even I have off days. Try again.";

const WORD_DELAY_MS = 55;

/** Exact same class for every Spark bubble — full width, left-aligned row. */
const SPARK_BUBBLE_CLASS =
  'w-full rounded-2xl px-4 py-2.5 bg-[#111111] border border-[#1e1e1e] text-foreground/95';
/** Exact same class for every user bubble — full width, right-aligned row. */
const USER_BUBBLE_CLASS =
  'w-full rounded-2xl px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] text-foreground';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Dynamic greeting: time of day + habit data, under 12 words, Spark voice. */
function getSparkGreeting(
  hour: number,
  completedToday: number,
  totalHabits: number,
  bestStreak: number,
): string {
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 22;
  const allDone = totalHabits > 0 && completedToday >= totalHabits;
  const incomplete = totalHabits > 0 && completedToday < totalHabits;

  if (totalHabits === 0) {
    return "No habits yet. Let's fix that. Or don't. Your call.";
  }
  if (allDone && isEvening) {
    return "Look at you. You actually did the thing. I'm reluctantly proud.";
  }
  if (allDone && isMorning) {
    return "Done already? Show-off. I'm almost impressed. Almost.";
  }
  if (allDone && isAfternoon) {
    return "Halfway through the day and you're already done. Okay, fine.";
  }
  if (incomplete && isMorning) {
    return "Morning. Your habits didn't sleep in. Get moving.";
  }
  if (incomplete && isEvening) {
    return "Evening. Still time to fix today. Get to it.";
  }
  if (incomplete && isAfternoon) {
    return "Afternoon. Your habits are waiting. So am I.";
  }
  if (bestStreak >= 3) {
    return "That streak's almost respectable. Don't blow it now.";
  }
  if (bestStreak >= 1) {
    return "You've got a streak going. No pressure. Okay, some pressure.";
  }
  if (hour >= 22 || hour < 5) {
    return "You're up late. Tomorrow's habits are already judging you.";
  }
  return "Hey. You're here. That's step one. Don't waste it.";
}

export default function Coach() {
  const { state, getHabitStreak } = useApp();
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [figureExiting, setFigureExiting] = useState(false);
  const [figureExited, setFigureExited] = useState(false);
  const wordIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  const habitsAndStreaks = useMemo(() => {
    if (activeHabits.length === 0) return 'none';
    return activeHabits
      .map(habit => `${habit.title} (streak ${getHabitStreak(habit.id)} days)`)
      .join('; ');
  }, [activeHabits, getHabitStreak]);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const completedTodayCount = useMemo(() => {
    return state.habitLogs.filter(l => l.date === todayStr && l.completed).length;
  }, [state.habitLogs, todayStr]);
  const bestStreak = useMemo(
    () => (activeHabits.length === 0 ? 0 : Math.max(0, ...activeHabits.map(h => getHabitStreak(h.id)))),
    [activeHabits, getHabitStreak],
  );

  const sparkGreeting = useMemo(() => {
    const hour = new Date().getHours();
    return getSparkGreeting(hour, completedTodayCount, activeHabits.length, bestStreak);
  }, [completedTodayCount, activeHabits.length, bestStreak]);

  const { yesterdayCompleted, yesterdayMissed } = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = format(yesterday, 'yyyy-MM-dd');
    const completedIds = new Set(
      state.habitLogs.filter(l => l.date === yStr && l.completed).map(l => l.habitId),
    );
    const completed = activeHabits.filter(h => completedIds.has(h.id)).map(h => h.title);
    const missed = activeHabits.filter(h => !completedIds.has(h.id)).map(h => h.title);
    return {
      yesterdayCompleted: completed.length === 0 ? 'none' : completed.join(', '),
      yesterdayMissed: missed.length === 0 ? 'none' : missed.join(', '),
    };
  }, [activeHabits, state.habitLogs]);

  const habitSystemContext = useMemo(
    () =>
      buildHabitSystemContext({
        identity: state.identityStatement?.trim() || 'not set',
        habitNamesWithStreaks: habitsAndStreaks,
        yesterdayCompleted,
        yesterdayMissed,
      }),
    [state.identityStatement, habitsAndStreaks, yesterdayCompleted, yesterdayMissed],
  );

  const fullSystemPrompt = useMemo(
    () => SPARK_SYSTEM_PROMPT + habitSystemContext,
    [habitSystemContext],
  );

  const isStreaming = pendingResponse != null && displayedAnswer !== pendingResponse;
  const showRunningFigure = loading || isStreaming || figureExiting;
  const startWordReveal = useCallback(() => {
    if (!pendingResponse) return;
    const words = pendingResponse.trim().split(/\s+/).filter(Boolean);
    wordIndexRef.current = 0;
    setDisplayedAnswer('');

    const tick = () => {
      if (wordIndexRef.current >= words.length) {
        setFigureExiting(true);
        return;
      }
      setDisplayedAnswer(prev => prev + (prev.length ? ' ' : '') + words[wordIndexRef.current]);
      wordIndexRef.current += 1;
      timerRef.current = setTimeout(tick, WORD_DELAY_MS);
    };
    timerRef.current = setTimeout(tick, WORD_DELAY_MS);
  }, [pendingResponse]);

  useEffect(() => {
    if (!pendingResponse || displayedAnswer !== '') return;
    startWordReveal();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingResponse, startWordReveal]);

  useEffect(() => {
    if (!figureExiting) return;
    const t = setTimeout(() => {
      setFigureExited(true);
      setFigureExiting(false);
    }, 520);
    return () => clearTimeout(t);
  }, [figureExiting]);

  useEffect(() => {
    if (figureExited && pendingResponse) {
      setConversation(prev => [
        ...prev,
        { id: generateId(), role: 'assistant', content: pendingResponse, timestamp: new Date() },
      ]);
      setPendingResponse(null);
      setDisplayedAnswer('');
      setFigureExited(false);
    }
  }, [figureExited, pendingResponse]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation, loading, pendingResponse, displayedAnswer]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    setError(null);
    setPendingResponse(null);
    setDisplayedAnswer('');
    setFigureExited(false);
    setFigureExiting(false);

    try {
      const apiMessages = [
        ...conversation.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
      ];
      const reply = await callCoachApi(fullSystemPrompt, apiMessages);
      setPendingResponse(reply);
    } catch {
      setError(SPARK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [inputValue, conversation, fullSystemPrompt]);

  const lastMessage = conversation[conversation.length - 1];
  const showQuickReplies = lastMessage?.role === 'assistant' && !loading && !pendingResponse;
  const quickReplyChips = useMemo(
    () => [...QUICK_REPLIES].sort(() => Math.random() - 0.5).slice(0, 3),
    [showQuickReplies],
  );

  const hasTyped = inputValue.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: '#080808' }}>
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 min-h-0 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 pt-6 pb-2 flex-shrink-0"
        >
          <SparkHeaderFigure />
          <h1 className="text-2xl font-semibold text-white">Spark</h1>
        </motion.div>
        <p className="text-white/60 text-sm mb-3 flex-shrink-0">
          {sparkGreeting}
        </p>

        <div
          ref={scrollRef}
          className={`overflow-y-auto min-h-0 space-y-4 pb-4 ${conversation.length > 0 || showRunningFigure ? 'flex-1' : ''}`}
        >
          {conversation.map(msg => (
            <div
              key={msg.id}
              className={msg.role === 'user' ? 'flex flex-row-reverse' : 'flex'}
            >
              <div
                className={msg.role === 'user' ? USER_BUBBLE_CLASS : SPARK_BUBBLE_CLASS}
              >
                <p className="text-sm font-body whitespace-pre-wrap break-words" style={{ lineHeight: 1.6 }}>
                  {msg.content}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {format(msg.timestamp, 'h:mm a')}
                </p>
              </div>
            </div>
          ))}

          {showRunningFigure && (
            <div className="flex">
              <div className={SPARK_BUBBLE_CLASS}>
                <p className="text-sm font-body whitespace-pre-wrap break-words" style={{ lineHeight: 1.7 }}>
                  {figureExited ? (
                    pendingResponse
                  ) : (
                    <span>
                      {displayedAnswer}
                      <span className="animate-pulse">|</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex">
              <div className={SPARK_BUBBLE_CLASS}>
                <p className="text-sm font-body whitespace-pre-wrap break-words" style={{ lineHeight: 1.7 }}>
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 space-y-2 pt-2">
          {showQuickReplies && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2"
            >
              {quickReplyChips.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setInputValue(label)}
                  className="px-3 py-1.5 rounded-full text-xs font-body border border-border/60 bg-muted/30 text-foreground/90 hover:bg-muted/50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}

          <div
            className="rounded-[20px] border p-3 space-y-2"
            style={{ backgroundColor: '#111111', borderColor: '#222222' }}
          >
            <div className="relative">
              <textarea
                rows={2}
                className="w-full rounded-xl border px-3 py-2 pr-9 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] text-white placeholder:text-white/40"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#222222' }}
                placeholder="Ask Spark anything..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              {hasTyped && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 right-2 pointer-events-none"
                >
                  <InputBounceFigure />
                </motion.div>
              )}
            </div>
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              className="w-full py-2.5 rounded-2xl gradient-warm text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Thinking…' : 'Ask Spark'}
            </button>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}

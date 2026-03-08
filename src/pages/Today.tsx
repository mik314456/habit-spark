import { useEffect, useMemo, useState, useRef } from 'react';
import { format, subDays, differenceInMinutes, differenceInHours, isSameDay, startOfWeek, addDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sprout,
  Sun,
  CloudSun,
  Moon,
  Flame,
  CheckSquare,
  Calendar,
  Dumbbell,
  Brain,
  BookOpen,
  Droplets,
  Heart,
  Pencil,
  Music,
  Phone,
  Apple,
  Bike,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import HabitCard from '@/components/HabitCard';
import TabBar from '@/components/TabBar';
import AddHabitModal from '@/components/AddHabitModal';
import MilestoneCelebrationModal from '@/components/MilestoneCelebrationModal';
import HabitDetailSheet from '@/components/HabitDetailSheet';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import { Habit, type HabitColor } from '@/lib/habitData';
import type { ComponentType } from 'react';

/** Habit color to Tailwind bg class for week grid cells */
const HABIT_BG: Record<HabitColor, string> = {
  amber: 'bg-habit-amber',
  sage: 'bg-habit-sage',
  coral: 'bg-habit-coral',
  sky: 'bg-habit-sky',
  violet: 'bg-habit-violet',
  rose: 'bg-habit-rose',
  teal: 'bg-habit-teal',
  slate: 'bg-habit-slate',
};

const SPARK_QUIP_CACHE_KEY = 'spark-today-quip-v1';

/** Motivational lines used for the bottom strip (fallback when no habit-matched lines). */
const MOTIVATIONAL_LINES = [
  'Strong people show up for their habits.',
  'Healthy habits build a better you.',
  'Consistency beats intensity.',
  'Small steps compound.',
  'You are what you do daily.',
];

const habitIconMap: Record<string, ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  brain: Brain,
  book: BookOpen,
  droplets: Droplets,
  heart: Heart,
  moon: Moon,
  pencil: Pencil,
  music: Music,
  phone: Phone,
  apple: Apple,
  bike: Bike,
  flame: Flame,
};

function TodayHabitIcon({ habit }: { habit: Habit }) {
  const key = habit.icon?.startsWith('lucide:') ? habit.icon.slice(7) : undefined;
  const Icon = key ? habitIconMap[key] : getHabitIconByTitle(habit.title);
  return Icon ? <Icon className="w-5 h-5" /> : <Sprout className="w-5 h-5" />;
}

function TimeOfDayIcon({ hour, className }: { hour: number; className?: string }) {
  if (hour >= 5 && hour < 12) return <Sun className={className} />;
  if (hour >= 12 && hour < 18) return <CloudSun className={className} />;
  return <Moon className={className} />;
}

/** Jumping for joy at start position (right) — 3s when a habit is completed. */
function HeaderCelebrationFigure() {
  const stroke = 1.15;
  const headY = -9;
  return (
    <g className="header-celebration-wrap" fill="none" stroke="#fff" strokeWidth={stroke} opacity={0.95}>
      <g className="header-celebration-jump">
        <circle cx="0" cy={headY} r="3" strokeWidth={stroke} />
        <line x1="0" y1="-6" x2="0" y2="5.5" strokeWidth={stroke} />
        <line x1="0" y1="-1.5" x2="-5" y2="-10" strokeWidth={stroke} />
        <line x1="0" y1="-1.5" x2="5" y2="-10" strokeWidth={stroke} />
        <line x1="0" y1="5.5" x2="-3" y2="12" strokeWidth={stroke} />
        <line x1="0" y1="5.5" x2="3" y2="12" strokeWidth={stroke} />
      </g>
    </g>
  );
}

/** Cinematic loop: same body proportions in every pose — head r=3, torso to hip, clean joints. */
function HeaderCinematicFigure() {
  const stroke = 1.15;
  const headY = -9;
  const hipY = 5.5;
  const shoulderY = 0.5;
  return (
    <g className="header-cinematic-move" fill="none" stroke="#fff" strokeWidth={stroke} opacity={0.9}>
      {/* Scene 1 & 5: Walking — torso lean forward, stick, backpack, arm + legs from same hip. */}
      <g className="header-pose-walk">
        <g className="header-hiker-bob">
          <circle cx="0" cy={headY} r="3" strokeWidth={stroke} />
          <line x1="0" y1={headY + 3.2} x2="0.8" y2={hipY} strokeWidth={stroke} />
          <line x1="0.8" y1={shoulderY} x2="7.5" y2="-5.5" strokeWidth={stroke} className="header-hiker-stick" />
          <g transform={`translate(0.8, ${shoulderY})`}>
            <line x1="0" y1="0" x2="-4" y2="4.5" strokeWidth={stroke} className="header-hiker-arm-swing" />
          </g>
          <g transform={`translate(0.8, ${hipY})`}>
            <line x1="0" y1="0" x2="-3.8" y2="10.5" strokeWidth={stroke} className="header-hiker-leg-left" />
          </g>
          <g transform={`translate(0.8, ${hipY})`}>
            <line x1="0" y1="0" x2="3.5" y2="10.5" strokeWidth={stroke} className="header-hiker-leg-right" />
          </g>
        </g>
      </g>
      {/* Scene 2: Sprint — upright torso, arms back from shoulder, legs from hip. */}
      <g className="header-pose-sprint">
        <circle cx="0" cy={headY} r="3" strokeWidth={stroke} />
        <line x1="0" y1={headY + 3.2} x2="0" y2={hipY} strokeWidth={stroke} />
        <line x1="0" y1={shoulderY} x2="-5.5" y2="3.5" strokeWidth={stroke} />
        <line x1="0" y1={shoulderY} x2="5.5" y2="3.5" strokeWidth={stroke} />
        <g transform={`translate(0, ${hipY})`}>
          <g className="header-sprint-leg-left">
            <line x1="0" y1="0" x2="-4.5" y2="10" strokeWidth={stroke} />
          </g>
          <g className="header-sprint-leg-right">
            <line x1="0" y1="0" x2="4.5" y2="10" strokeWidth={stroke} />
          </g>
        </g>
      </g>
      {/* Scene 3: Exhausted — same head/torso proportion, torso angled forward, stick, legs from hip. */}
      <g className="header-pose-exhausted">
        <circle cx="0" cy={headY - 0.5} r="3" strokeWidth={stroke} />
        <line x1="0" y1={headY + 2.8} x2="1.8" y2={hipY - 0.5} strokeWidth={stroke} />
        <line x1="1.8" y1="1.5" x2="6.5" y2="-3" strokeWidth={stroke} />
        <g transform={`translate(1.8, ${hipY - 0.5})`}>
          <line x1="0" y1="0" x2="-3.2" y2="9" strokeWidth={stroke} className="header-exhausted-leg-l" />
        </g>
        <g transform={`translate(1.8, ${hipY - 0.5})`}>
          <line x1="0" y1="0" x2="2.8" y2="9" strokeWidth={stroke} className="header-exhausted-leg-r" />
        </g>
      </g>
      {/* Scene 4: Rest — sitting: head, short torso, backpack, legs bent under, z above. */}
      <g className="header-pose-sit">
        <circle cx="0" cy="-5" r="3" strokeWidth={stroke} />
        <line x1="0" y1="-2" x2="0" y2="2.5" strokeWidth={stroke} />
        <line x1="0" y1="2.5" x2="-3.5" y2="7.5" strokeWidth={stroke} />
        <line x1="0" y1="2.5" x2="3.5" y2="7.5" strokeWidth={stroke} />
        <text x="0" y="-9" textAnchor="middle" fill="#fff" fontSize="3.5" opacity={0.9} className="header-rest-z">z</text>
      </g>
    </g>
  );
}

/** Parse "HH:mm" into today's Date at that time (local). */
function todayAtTime(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

/** Human countdown from now to target. */
function countdownTo(target: Date): string {
  const now = new Date();
  if (target <= now) return 'now';
  const mins = differenceInMinutes(target, now);
  if (mins < 60) return `in ${mins} min`;
  const hours = differenceInHours(target, now);
  if (hours < 24) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  return `in ${Math.floor(hours / 24)} days`;
}

/** Time-of-day context message. */
function getTimeContext(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Start strong.';
  if (hour >= 12 && hour < 17) return 'Stay consistent.';
  if (hour >= 17 && hour < 22) return 'Finish what you started.';
  return 'Rest is part of the process.';
}

/** Fetch one punchy Spark quip for Today banner (cached per day). */
async function fetchSparkQuip(params: {
  hour: number;
  bestStreak: number;
  completedToday: number;
  totalHabits: number;
  habitNames: string[];
}): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) return getTimeContext(params.hour);

  const { hour, bestStreak, completedToday, totalHabits, habitNames } = params;
  const timeLabel = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 22 ? 'evening' : 'night';

  const systemPrompt = `You are Spark — a stick-figure habit coach. You must NEVER say anything positive, encouraging, or motivational. No "great job", no "you're doing amazing", no "keep it up". Every quip must be snarky, sarcastic, or a backhanded compliment. If the user has done 0 habits say something like "Zero. Bold strategy." If all done say something like "Done already? Fine. Whatever." Roast first, respect second. Maximum 12 words. One line only. No quotes or preamble.

Examples:
- 0 habits: "Zero. Bold strategy." or "You've done 0 habits. Impressive commitment to nothing."
- One done: "One habit done. The bar was low and you cleared it."
- All done: "Done already? Fine. Whatever." or "Both done? Don't get cocky. Tomorrow exists."
- Day 1 streak: "Day 1. Everyone starts Day 1. Few survive Day 2."
- Streak going: "Still going? Weird. Most people quit by now."

Output nothing but the single line.`;

  const userPrompt = `Time: ${timeLabel} (${hour}:00). Best streak: ${bestStreak} days. Completed today: ${completedToday}/${totalHabits} habits. Habit names: ${habitNames.length ? habitNames.join(', ') : 'none'}.`;

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
      max_tokens: 60,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) return getTimeContext(hour);

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find(c => c.type === 'text')?.text?.trim();
  if (!text) return getTimeContext(hour);

  const oneLine = text.split(/\n/)[0].trim();
  const words = oneLine.split(/\s+/).slice(0, 12);
  return words.join(' ');
}

/** Identity-style motivational lines; some keyed by habit keywords. */
const MOTIVATIONAL_BY_HABIT: { match: RegExp | string; line: string }[] = [
  { match: /meditate|calm|mind/i, line: 'Calm people meditate daily.' },
  { match: /read|book/i, line: 'Readers never stop growing.' },
  { match: /exercise|workout|gym|run/i, line: 'Strong people show up for their habits.' },
  { match: /water|drink|eat|health/i, line: 'Healthy habits build a better you.' },
  { match: /journal|write/i, line: 'Writers show up one sentence at a time.' },
];
const MOTIVATIONAL_FALLBACK = MOTIVATIONAL_LINES;

export default function Today() {
  const navigate = useNavigate();
  const app = useApp();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [milestoneHabitId, setMilestoneHabitId] = useState<string | null>(null);
  const [milestoneValue, setMilestoneValue] = useState<number | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [sparkQuip, setSparkQuip] = useState<string | null>(null);
  const [sparkQuipLoading, setSparkQuipLoading] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const prevCompletedRef = useRef<number | null>(null);

  const state = app?.state;
  const isHabitCompletedToday = app?.isHabitCompletedToday ?? (() => false);
  const isHabitSkippedToday = app?.isHabitSkippedToday ?? (() => false);
  const toggleHabitCompletion = app?.toggleHabitCompletion ?? (() => {});
  const skipHabit = app?.skipHabit ?? (() => {});
  const deleteHabit = app?.deleteHabit ?? (() => {});
  const getHabitStreak = app?.getHabitStreak ?? (() => 0);
  const markMilestoneCelebrated = app?.markMilestoneCelebrated ?? (() => {});

  const habits = state?.habits ?? [];
  const habitLogs = state?.habitLogs ?? [];

  const activeHabits = useMemo(
    () => (Array.isArray(habits) ? habits.filter((h: { archived?: boolean }) => !h.archived) : []),
    [habits],
  );

  const motivationalLines = useMemo(() => {
    const fromHabits = new Set<string>();
    activeHabits.forEach(h => {
      const title = h.title || '';
      for (const { match, line } of MOTIVATIONAL_BY_HABIT) {
        if (typeof match === 'string' ? title.toLowerCase().includes(match.toLowerCase()) : match.test(title)) {
          fromHabits.add(line);
          break;
        }
      }
    });
    const combined = [...fromHabits, ...MOTIVATIONAL_FALLBACK];
    return combined.length > 0 ? combined : MOTIVATIONAL_FALLBACK;
  }, [activeHabits]);

  const [motivationalIndex] = useState(() => Math.floor(Math.random() * 10));
  const motivationalLine = motivationalLines[motivationalIndex % Math.max(1, motivationalLines.length)];

  const now = new Date();
  const todayLocal = format(now, 'yyyy-MM-dd');
  const yesterdayLocal = format(subDays(now, 1), 'yyyy-MM-dd');
  const dontMissKey = `dontMiss-${todayLocal}`;

  const [dismissedDontMiss, setDismissedDontMiss] = useState(() =>
    typeof window !== 'undefined' ? !!window.localStorage.getItem(dontMissKey) : false,
  );

  useEffect(() => {
    setDismissedDontMiss(!!window.localStorage.getItem(dontMissKey));
  }, [dontMissKey]);

  const yesterdayCompletionsCount = useMemo(
    () =>
      Array.isArray(habitLogs)
        ? habitLogs.filter(l => l.date === yesterdayLocal && l.completed).length
        : 0,
    [habitLogs, yesterdayLocal],
  );
  const hasAnyLogHistory = (habitLogs?.length ?? 0) > 0;
  const showDontMissBanner =
    !dismissedDontMiss &&
    activeHabits.length >= 1 &&
    yesterdayCompletionsCount === 0 &&
    hasAnyLogHistory;
  const completedCount = activeHabits.filter(h => isHabitCompletedToday(h.id)).length;

  useEffect(() => {
    if (activeHabits.length === 0) return;
    if (prevCompletedRef.current === null) {
      prevCompletedRef.current = completedCount;
      return;
    }
    if (completedCount > prevCompletedRef.current) {
      setCelebrating(true);
      prevCompletedRef.current = completedCount;
      const t = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(t);
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, activeHabits.length]);

  const hour = now.getHours();
  const greeting =
    hour < 5
      ? 'Still up?'
      : hour < 12
        ? 'Good morning'
        : hour < 17
          ? 'Good afternoon'
          : hour < 21
            ? 'Good evening'
            : 'Good night';

  // Next up: up to 3 incomplete habits for today, ordered by scheduled time ascending (all incomplete, not just future times)
  const nextUpHabits = useMemo(() => {
    if (activeHabits.length === 0) return [];
    const incomplete = activeHabits.filter(h => !isHabitCompletedToday(h.id));
    const withTime = incomplete
      .map(h => ({
        habit: h,
        at: todayAtTime(h.reminderTime ?? h.timeOfDay ?? '09:00'),
      }))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
    return withTime.slice(0, 3);
  }, [activeHabits, isHabitCompletedToday]);

  // Best streak across habits (for Weather row + Quick Stats)
  const bestStreak = useMemo(
    () => Math.max(0, ...activeHabits.map(h => getHabitStreak(h.id))),
    [activeHabits, getHabitStreak],
  );

  const totalCompletions = useMemo(
    () => (Array.isArray(habitLogs) ? habitLogs.filter(l => l.completed).length : 0),
    [habitLogs],
  );

  const daysSinceStarted = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const firstCreated = activeHabits.reduce(
      (acc, h) => Math.min(acc, new Date(h.createdAt).getTime()),
      Number.MAX_SAFE_INTEGER,
    );
    if (firstCreated === Number.MAX_SAFE_INTEGER) return 0;
    const days = Math.floor((Date.now() - firstCreated) / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  }, [activeHabits]);

  // Per-habit last 7 days completion (oldest to newest) for mini streak on cards
  const last7DaysByHabit = useMemo(() => {
    const out: Record<string, boolean[]> = {};
    const logs = Array.isArray(habitLogs) ? habitLogs : [];
    activeHabits.forEach(h => {
      const arr: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const completed = logs.some(
          l => l.habitId === h.id && l.date === dateStr && l.completed,
        );
        arr.push(completed);
      }
      out[h.id] = arr;
    });
    return out;
  }, [activeHabits, habitLogs, now]);

  // Per-habit current week (Mon–Sun) completion for week dots on cards
  const weekCompletionByHabit = useMemo(() => {
    const out: Record<string, { completed: boolean; isToday: boolean; isFuture: boolean }[]> = {};
    const logs = Array.isArray(habitLogs) ? habitLogs : [];
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const todayStr = format(now, 'yyyy-MM-dd');
    activeHabits.forEach(h => {
      const arr: { completed: boolean; isToday: boolean; isFuture: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;
        const completed = logs.some(
          l => l.habitId === h.id && l.date === dateStr && l.completed,
        );
        arr.push({ completed, isToday, isFuture });
      }
      out[h.id] = arr;
    });
    return out;
  }, [activeHabits, habitLogs, now]);

  // Spark quip for Today banner: fetch once per day, cache by date
  useEffect(() => {
    if (activeHabits.length === 0) {
      setSparkQuip(null);
      return;
    }

    // 1) Clear quip cache immediately so a fresh (snarky) quip is fetched (removes old motivational cache).
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SPARK_QUIP_CACHE_KEY);
    }

    const tryCache = () => {
      // 3) In development, skip cache so we re-fetch on every app load.
      if (import.meta.env.DEV) return false;
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(SPARK_QUIP_CACHE_KEY) : null;
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { date?: string; quip?: string };
        if (parsed.date === todayLocal && parsed.quip) {
          setSparkQuip(parsed.quip);
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    if (tryCache()) return;

    setSparkQuipLoading(true);
    const hour = new Date().getHours();
    fetchSparkQuip({
      hour,
      bestStreak,
      completedToday: completedCount,
      totalHabits: activeHabits.length,
      habitNames: activeHabits.map(h => h.title || ''),
    })
      .then(quip => {
        setSparkQuip(quip);
        try {
          localStorage.setItem(SPARK_QUIP_CACHE_KEY, JSON.stringify({ date: todayLocal, quip }));
        } catch {
          // ignore
        }
      })
      .catch(() => {
        setSparkQuip(null);
      })
      .finally(() => {
        setSparkQuipLoading(false);
      });
  }, [todayLocal, activeHabits, bestStreak, completedCount]);

  // Milestone celebrations (3, 7, 14, 21, 30, 50, 100)
  useEffect(() => {
    if (activeHabits.length === 0) return;
    if (milestoneHabitId) return; // already showing one

    const milestones = [3, 7, 14, 21, 30, 50, 100];

    for (const habit of activeHabits) {
      const streak = getHabitStreak(habit.id);
      if (streak <= 0) continue;

      const already = (state.milestoneCelebrations ?? []).filter(
        m => m.habitId === habit.id,
      );

      const next = milestones.find(
        m => streak >= m && !already.some(a => a.milestone === m),
      );

      if (next != null) {
        markMilestoneCelebrated(habit.id, next);
        setMilestoneHabitId(habit.id);
        setMilestoneValue(next);
        break;
      }
    }
  }, [activeHabits, getHabitStreak, markMilestoneCelebrated, milestoneHabitId, state?.milestoneCelebrations]);

  if (!app) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a0a0a' }} />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md mx-auto px-5 pt-12">
        <AnimatePresence>
          {showDontMissBanner && (
            <motion.div
              className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground/90 text-background px-3 py-1 text-xs pointer-events-auto">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Don&apos;t miss twice. Yesterday wasn&apos;t logged.</span>
                <button
                  type="button"
                  className="ml-1 text-[10px] text-background/80 hover:text-background"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(dontMissKey, 'true');
                    }
                    setDismissedDontMiss(true);
                  }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header: full-bleed mountain background, text on top with left gradient for readability */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative overflow-hidden rounded-2xl min-h-[150px]">
          {/* Full-bleed mountain SVG background */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 300 140"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            {/* Stars — 8–10 dots, upper portion */}
            <g fill="#fff">
              <circle cx="180" cy="22" r="1" opacity={0.35} />
              <circle cx="220" cy="18" r="1.2" opacity={0.25} />
              <circle cx="255" cy="28" r="0.8" opacity={0.3} />
              <circle cx="198" cy="38" r="1" opacity={0.2} />
              <circle cx="238" cy="32" r="0.8" opacity={0.4} />
              <circle cx="268" cy="20" r="1" opacity={0.25} />
              <circle cx="210" cy="45" r="0.8" opacity={0.3} />
              <circle cx="248" cy="42" r="1" opacity={0.2} />
              <circle cx="230" cy="12" r="0.8" opacity={0.35} />
            </g>
            {/* Moon — upper right */}
            <circle cx="265" cy="28" r="8" fill="#fff" opacity={0.15} />
            {/* Back mountain — #111, tallest, centered-right */}
            <polygon
              fill="#111111"
              points="60,140 60,75 100,55 140,70 180,45 220,65 260,38 300,50 300,140"
            />
            {/* Mid mountain — #1a1a1a, slightly shorter, offset right */}
            <polygon
              fill="#1a1a1a"
              points="100,140 100,88 140,72 180,85 220,62 260,78 300,68 300,140"
            />
            {/* Front mountain — #222222, jagged foreground, right */}
            <polygon
              fill="#222222"
              points="140,140 140,105 180,95 220,108 260,92 300,98 300,140"
            />
            {/* Dotted path up the slope */}
            <path
              d="M 235 128 Q 225 108 218 88 T 208 58 T 202 42"
              fill="none"
              stroke="#fff"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              opacity={0.2}
            />
            {celebrating ? (
              <HeaderCelebrationFigure />
            ) : (
              <HeaderCinematicFigure />
            )}
          </svg>
          {/* Left-side dark gradient so text is always readable */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)',
            }}
            aria-hidden
          />
          {/* Text on top */}
          <div className="relative z-10 pt-0.5 pb-1 px-4">
            <p
              className="text-[11px] text-muted-foreground/90 tracking-[0.12em] uppercase font-body"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
            >
              {format(now, 'EEEE, MMMM d')}
            </p>
            <h1
              className="mt-2 font-body font-semibold text-[2.6rem] leading-tight text-foreground"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
            >
              {greeting}
            </h1>
            {activeHabits.length > 0 && (
              completedCount === activeHabits.length ? (
                <div className="flex items-center gap-2 mt-3" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
                  <CheckCircle2 className="w-4 h-4 text-[color:var(--accent-color)]" />
                  <p className="text-sm font-body text-[color:var(--accent-color)]">
                    All done. You showed up today.
                  </p>
                </div>
              ) : (
                <p
                  className="text-muted-foreground text-sm mt-3 font-body min-h-[1.25rem] overflow-visible"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
                >
                  <span className="tabular-nums">{completedCount}</span>
                  {' of '}
                  <span className="tabular-nums">{activeHabits.length}</span>
                  {' habits done today'}
                </p>
              )
            )}
          </div>
        </motion.div>

        {/* Next Up — up to 3 upcoming incomplete habits, stacked rows */}
        {activeHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl p-4 border border-[#222222]"
            style={{ backgroundColor: '#111111' }}
          >
            <p className="text-[11px] text-white/60 uppercase tracking-wide font-body mb-3">
              Next up
            </p>
            {nextUpHabits.length > 0 ? (
              <div className="divide-y divide-[#222222]">
                {nextUpHabits.map(({ habit }) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1a1a1a]"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      <TodayHabitIcon habit={habit} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-[15px] truncate text-white">
                        {habit.title}
                      </p>
                      <p className="text-[13px] text-white/70 font-body truncate">
                        {habit.timeOfDay} · {habit.location || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-white/80 text-sm py-1">
                No more habits left for today.
              </p>
            )}
          </motion.div>
        )}

        {/* Weather + Spark quip row — live quip fetched once per day, wraps to 2 lines if needed */}
        {activeHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-5 py-2.5 px-3 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <TimeOfDayIcon hour={hour} className="w-5 h-5" />
            </div>
            {bestStreak > 0 && (
              <span className="text-xs font-medium text-foreground font-body flex-shrink-0">
                Day {bestStreak}
              </span>
            )}
            <span className="flex-1 min-w-0 text-xs text-muted-foreground font-body leading-snug py-0.5">
              {sparkQuipLoading ? '…' : sparkQuip ?? getTimeContext(hour)}
            </span>
          </motion.div>
        )}

        {/* Habits */}
        {activeHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="mb-4 flex justify-center">
              <Sprout className="w-10 h-10 text-primary" />
            </p>
            <h2 className="text-xl mb-2">No habits yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Add your first habit and start building.</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="px-6 py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold shadow-elevated"
            >
              Add your first habit
            </button>
          </motion.div>
        ) : (
          <div className="today-habit-list">
            {activeHabits.map(habit => {
              const rawIdentity = habit.why?.trim() || '';
              const cleanedIdentity = rawIdentity.toLowerCase().startsWith('to become ')
                ? rawIdentity.slice('to become '.length).trim()
                : rawIdentity;

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={getHabitStreak(habit.id)}
                  completed={isHabitCompletedToday(habit.id)}
                  skipped={isHabitSkippedToday(habit.id)}
                  showIdentityWhisper={!!habit.why}
                  identityStatement={cleanedIdentity}
                  onComplete={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(dontMissKey, 'true');
                    }
                    setDismissedDontMiss(true);
                    toggleHabitCompletion(habit.id);
                  }}
                  onSkip={() => skipHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                  onOpenDetails={() => setDetailHabitId(habit.id)}
                />
              );
            })}
          </div>
        )}

        {/* Quick Stats row */}
        {activeHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-6 mb-4"
          >
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-foreground/10 text-foreground text-xs font-medium font-body border border-border/50 hover:bg-foreground/15 transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              {bestStreak}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-foreground/10 text-foreground text-xs font-medium font-body border border-border/50">
              <CheckSquare className="w-3.5 h-3.5" />
              {totalCompletions}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-foreground/10 text-foreground text-xs font-medium font-body border border-border/50">
              <Calendar className="w-3.5 h-3.5" />
              {daysSinceStarted}d
            </div>
          </motion.div>
        )}

        {/* Week grid at the end: M–S header, then one row per habit (habit color = logged that day) */}
        {activeHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 py-3 px-4 rounded-xl bg-muted/30 border border-border/40"
          >
            {/* Header row: day letters — 11px, font-weight 500, equal column spacing */}
            <div className="grid grid-cols-7 gap-4 mb-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, i) => {
                const weekData = weekCompletionByHabit[activeHabits[0]?.id];
                const day = weekData?.[i];
                const isToday = day?.isToday ?? false;
                const isFuture = day?.isFuture ?? false;
                return (
                  <span
                    key={i}
                    className={`text-[15px] font-medium font-body text-center ${
                      isToday ? 'text-foreground font-semibold' : isFuture ? 'text-muted-foreground/60' : 'text-muted-foreground'
                    }`}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
            {/* One row per habit: 6px dots, same style as habit card week dots */}
            {activeHabits.map(habit => {
              const week = weekCompletionByHabit[habit.id];
              const bgClass = HABIT_BG[habit.color];
              return (
                <div key={habit.id} className="grid grid-cols-7 gap-4 mt-2.5 first:mt-0">
                  {week && week.length === 7
                    ? week.map((day, i) => (
                        <span
                          key={i}
                          className="flex justify-center"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              day.isFuture
                                ? 'bg-muted/50'
                                : day.completed
                                  ? bgClass
                                  : 'border border-muted-foreground/60 bg-transparent'
                            }`}
                          />
                        </span>
                      ))
                    : null}
                </div>
              );
            })}
          </motion.div>
        )}

      </div>

      {/* Bottom motivational strip (above tab bar) */}
      {activeHabits.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 flex justify-center z-30 pointer-events-none px-4">
          <p className="text-[11px] text-muted-foreground/70 font-body max-w-xs text-center">
            {motivationalLine}
          </p>
        </div>
      )}

      {/* FAB */}
      {activeHabits.length > 0 && (
        <motion.button
          onClick={() => setShowAddHabit(true)}
          className="fixed bottom-20 right-5 w-[52px] h-[52px] rounded-full bg-[color:var(--accent-color)] text-white shadow-card flex items-center justify-center z-40 transition-transform duration-150"
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <Plus size={24} />
        </motion.button>
      )}

      <TabBar />
      {showAddHabit && <AddHabitModal onClose={() => setShowAddHabit(false)} />}
      <MilestoneCelebrationModal
        open={!!milestoneHabitId && milestoneValue != null}
        habit={milestoneHabitId ? activeHabits.find(h => h.id === milestoneHabitId) ?? null : null}
        milestone={milestoneValue}
        onClose={() => {
          setMilestoneHabitId(null);
          setMilestoneValue(null);
        }}
      />
      <HabitDetailSheet
        open={!!detailHabitId}
        habit={detailHabitId ? activeHabits.find(h => h.id === detailHabitId) ?? null : null}
        onClose={() => setDetailHabitId(null)}
      />
    </div>
  );
}

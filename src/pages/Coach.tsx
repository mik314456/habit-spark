import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { getToday } from '@/lib/habitData';
import TabBar from '@/components/TabBar';

interface DailyCoachCache {
  date: string;
  message: string;
}

const DAILY_KEY = 'coach-daily-message-v1';

async function callCoachApi(systemPrompt: string, userPrompt: string): Promise<string> {
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
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Coach API error ${res.status}`);
  }

  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };

  const text = json.content?.find(c => c.type === 'text')?.text?.trim();
  if (!text) {
    throw new Error('Coach API returned no text content.');
  }
  return text;
}

export default function Coach() {
  const { state, getHabitStreak } = useApp();
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupAnswer, setFollowupAnswer] = useState<string | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getToday(), []);

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  const habitsAndStreaks = useMemo(() => {
    if (activeHabits.length === 0) return 'none';
    return activeHabits
      .map(habit => {
        const streak = getHabitStreak(habit.id);
        return `${habit.title} (streak ${streak} days)`;
      })
      .join('; ');
  }, [activeHabits, getHabitStreak]);

  const yesterdaysCompletions = useMemo(() => {
    const yesterday = subDays(today, 1);
    const yStr = format(yesterday, 'yyyy-MM-dd');
    const completedIds = new Set(
      state.habitLogs.filter(l => l.date === yStr && l.completed).map(l => l.habitId),
    );
    if (completedIds.size === 0) return 'none';
    return activeHabits
      .filter(h => completedIds.has(h.id))
      .map(h => h.title)
      .join(', ');
  }, [activeHabits, state.habitLogs, today]);

  useEffect(() => {
    const cachedRaw = localStorage.getItem(DAILY_KEY);
    if (cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw) as DailyCoachCache;
        const hasErrorWord = parsed.message?.toLowerCase().includes('error');
        if (hasErrorWord) {
          localStorage.removeItem(DAILY_KEY);
        } else if (parsed.date === todayStr && parsed.message) {
          setDailyMessage(parsed.message);
          return;
        }
      } catch {
        // ignore
      }
    }

    const run = async () => {
      setDailyLoading(true);
      setDailyError(null);
      try {
        const identity = state.identityStatement?.trim() || 'not set';
        const systemPrompt =
          'You are a warm, encouraging habit coach. Be specific, concise, and personal. Never be generic. Max 4 sentences.';
        const userPrompt = `My identity goal: ${identity}. My habits and streaks: ${habitsAndStreaks}. Yesterday I completed: ${yesterdaysCompletions}. Today give me one specific insight, encouragement, or challenge based on exactly where I am right now.`;

        const message = await callCoachApi(systemPrompt, userPrompt);
        setDailyMessage(message);
        const payload: DailyCoachCache = { date: todayStr, message };
        localStorage.setItem(DAILY_KEY, JSON.stringify(payload));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load coach message.';
        setDailyError(msg);
      } finally {
        setDailyLoading(false);
      }
    };

    void run();
  }, [habitsAndStreaks, state.identityStatement, todayStr, yesterdaysCompletions]);

  const handleAskCoach = async () => {
    const question = followupQuestion.trim();
    if (!question) return;
    setFollowupLoading(true);
    setFollowupError(null);
    setFollowupAnswer(null);
    try {
      const identity = state.identityStatement?.trim() || 'not set';
      const systemPrompt =
        'You are a warm, encouraging habit coach. Be specific, concise, and personal. Never be generic. Max 4 sentences.';
      const baseContext = `My identity goal: ${identity}. My habits and streaks: ${habitsAndStreaks}. Yesterday I completed: ${yesterdaysCompletions}.`;
      const userPrompt = `${baseContext} Follow-up question: ${question}`;

      const answer = await callCoachApi(systemPrompt, userPrompt);
      setFollowupAnswer(answer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get coach response.';
      setFollowupError(msg);
    } finally {
      setFollowupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-2">Your Coach</h1>
          <p className="text-muted-foreground text-sm mb-6">
            One daily message, tailored to your identity and streaks.
          </p>
        </motion.div>

        {/* Daily coach card */}
        <motion.div
          className="mb-6 rounded-3xl bg-card shadow-elevated border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Today&apos;s coaching
          </p>
          {dailyLoading && !dailyMessage && (
            <div className="space-y-3">
              <div className="h-4 rounded bg-muted animate-pulse" />
              <div className="h-4 rounded bg-muted animate-pulse w-5/6" />
            </div>
          )}
          {dailyError && !dailyMessage && (
            <p className="text-sm text-destructive">
              {dailyError}
            </p>
          )}
          {dailyMessage && (
            <p className="text-base leading-relaxed mb-4">
              {dailyMessage}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {format(today, 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Ask your coach */}
        <div className="p-4 rounded-2xl bg-card shadow-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Ask your coach</p>
          </div>
          <div className="space-y-2">
            <textarea
              rows={3}
              className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm resize-none"
              placeholder="Ask one follow-up question about your habits, streak, or today."
              value={followupQuestion}
              onChange={e => setFollowupQuestion(e.target.value)}
            />
            <button
              onClick={handleAskCoach}
              disabled={followupLoading || !followupQuestion.trim()}
              className="w-full py-2.5 rounded-2xl gradient-warm text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {followupLoading ? 'Thinking…' : 'Send to coach'}
            </button>
          </div>
          {followupError && (
            <p className="text-xs text-destructive mt-1">{followupError}</p>
          )}
          {followupAnswer && (
            <div className="mt-3 p-3 rounded-2xl bg-muted/50 text-sm">
              {followupAnswer}
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
}

